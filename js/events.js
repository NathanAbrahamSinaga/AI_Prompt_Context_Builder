// --- Core Actions ---
async function addItem(type, parentItem = null) {
    const name = await showModal({
        title: `Buat ${type} Baru`,
        bodyHtml: `<input type="text" placeholder="Nama ${type}..." />`,
        confirmText: 'Buat'
    });
    if (!name) return;

    const newItem = { id: nextId++, type, name };
    if (type === 'file') newItem.content = '';
    if (type === 'folder') {
        newItem.children = [];
        newItem.isCollapsed = false;
    }

    let parent = parentItem ? (parentItem.type === 'folder' ? parentItem : findParentOf(parentItem.id)) : null;

    if (!parent && activeItemId) {
        const activeItem = findItemById(activeItemId);
        if(activeItem?.type === 'folder') parent = activeItem;
    }

    if (parent && parent.type === 'folder') {
        parent.children.push(newItem);
        parent.isCollapsed = false;
    } else {
        fileSystem.push(newItem);
    }
    renderFileSystem();
}

async function deleteItem(itemId) {
    const item = findItemById(itemId);
    if (!item) return;

    const isConfirmed = await showModal({
        title: `Hapus "${item.name}"`,
        bodyHtml: `<p>Tindakan ini tidak dapat diurungkan.</p>`,
        confirmText: 'Hapus'
    });

    if (isConfirmed) {
        const parent = findParentOf(itemId);
        if (parent) {
            parent.children = parent.children.filter(child => child.id !== itemId);
        } else {
            fileSystem = fileSystem.filter(item => item.id !== itemId);
        }

        if (itemId === activeItemId) {
            clearEditorState();
        } else {
            renderFileSystem();
        }
    }
}

function triggerRename(itemId) {
    const itemElement = fileListElement.querySelector(`.list-item[data-id="${itemId}"] .item-name`);
    if (!itemElement) return;

    const item = findItemById(itemId);
    const oldName = item.name;
    itemElement.innerHTML = `<input type="text" class="rename-input" value="${oldName}" />`;

    const input = itemElement.querySelector('input');
    input.focus();
    input.select();

    const finishRename = () => {
        const newName = input.value.trim();
        item.name = newName || oldName;
        renderFileSystem();
        input.removeEventListener('blur', finishRename);
        input.removeEventListener('keydown', handleKeydown);
    };
    
    const handleKeydown = (event) => {
        if (event.key === 'Enter') {
            finishRename();
        } else if (event.key === 'Escape') {
            item.name = oldName;
            renderFileSystem();
            input.removeEventListener('blur', finishRename);
            input.removeEventListener('keydown', handleKeydown);
        }
    };

    input.addEventListener('blur', finishRename);
    input.addEventListener('keydown', handleKeydown);
}

function selectItem(itemId) {
    const item = findItemById(itemId);
    if (!item) return;

    activeItemId = itemId;

    if (item.type === 'file') {
        const extension = item.name.split('.').pop();
        const language = languageMap[extension] || 'clike';
        
        editorInput.value = item.content || '';
        updateEditor(item.content || '', language);

        currentFileNameElement.textContent = `${item.name}`;
        editorPlaceholder.style.display = 'none';
        editorWrapper.style.display = 'block';
        editorInput.focus();
    } else {
        currentFileNameElement.textContent = `Folder: ${item.name}`;
        editorWrapper.style.display = 'none';
        editorPlaceholder.style.display = 'flex';
    }
    renderFileSystem();
}

function saveProject() {
    try {
        if (activeItemId) {
            const activeFile = findItemById(activeItemId);
            if (activeFile && activeFile.type === 'file') {
                activeFile.content = editorInput.value;
            }
        }
        localStorage.setItem('aiContextBuilderFS', JSON.stringify(fileSystem));
        return true;
    } catch (error) {
        console.error("Save failed:", error);
        showToast('Gagal menyimpan proyek.', 'error');
        return false;
    }
}

function navigateFileSystem(direction) {
    if (!activeItemId) {
        const firstItem = fileListElement.querySelector('.list-item');
        if (firstItem) {
            selectItem(parseInt(firstItem.dataset.id));
        }
        return;
    }

    const visibleItems = getVisibleItems();
    if (visibleItems.length <= 1) return;

    const currentIndex = visibleItems.findIndex(el => parseInt(el.dataset.id) === activeItemId);
    let nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (nextIndex >= 0 && nextIndex < visibleItems.length) {
        const nextItem = visibleItems[nextIndex];
        selectItem(parseInt(nextItem.dataset.id));
        nextItem.querySelector('.item-content').scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
}

// --- Event Handlers ---

function handleSaveClick() {
    if (saveProject()) {
        showToast('Proyek berhasil disimpan.');
    }
}

function handleExportClick() {
    if (!saveProject()) return;
    const exportText = generateExportText();
    navigator.clipboard.writeText(exportText).then(() => {
        showToast('Proyek disimpan & Konteks disalin ke clipboard!');
    });
}

async function handleImportClick() {
    const textToImport = await showModal({
        title: 'Impor Proyek',
        bodyHtml: `<textarea placeholder="Paste teks proyek yang diekspor di sini..."></textarea>`,
        confirmText: 'Impor'
    });

    if (textToImport) {
        try {
            const importedFS = parseImportedText(textToImport);
            if (importedFS.length === 0 && textToImport.trim().length > 0) {
                throw new Error("Format tidak valid atau teks kosong.");
            }
            
            fileSystem = importedFS;
            rebuildAllIds();

            if (saveProject()) {
                location.reload();
            } else {
                clearEditorState();
            }
        } catch (e) {
            showToast(`Gagal mengimpor: ${e.message}`, 'error');
        }
    }
}

async function handleResetClick() {
    const isConfirmed = await showModal({
        title: 'Reset Proyek',
        bodyHtml: '<p>Semua file dan folder akan dihapus permanen. Anda yakin?</p>',
        confirmText: 'Ya, Reset'
    });
    if (isConfirmed) {
        localStorage.removeItem('aiContextBuilderFS');
        fileSystem = [];
        nextId = 1;
        clearEditorState();
        showToast('Proyek telah direset.');
    }
}

function handleRebuildIdsClick() {
    rebuildAllIds();
    renderFileSystem();
    showToast('ID berhasil dibangun ulang.', 'success');
}

function handleHelpClick() {
    showModal({
        title: 'Bantuan & Panduan',
        bodyHtml: HELP_CONTENT_HTML,
        confirmText: 'Tutup',
        showCancelButton: false,
        large: true
    });
}

function handleThemeToggle() {
    const isLightMode = document.body.classList.toggle('light-mode');
    localStorage.setItem('editorTheme', isLightMode ? 'light' : 'dark');
    themeToggleButton.textContent = isLightMode ? '🌙' : '☀️';
}

function handleEditorInput() {
    const code = editorInput.value;
    const language = editorDisplay.className.replace('line-numbers', '').trim();
    updateEditor(code, language);

    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        const file = findItemById(activeItemId);
        if (file && file.type === 'file') {
            file.content = code;
        }
    }, 300);
}

function handleEditorScroll() {
    editorDisplay.scrollTop = editorInput.scrollTop;
    editorDisplay.scrollLeft = editorInput.scrollLeft;
}

function handleModalConfirm() {
    if (modalConfirmResolver) {
        const input = modalBody.querySelector('input, textarea');
        modalConfirmResolver(input ? input.value : true);
    }
    hideModal();
}

function handleFileListClick(event) {
    const listItem = event.target.closest('.list-item');
    if (!listItem) return;

    const id = parseInt(listItem.dataset.id);
    
    if (event.target.classList.contains('delete-btn')) {
        event.stopPropagation();
        deleteItem(id);
        return;
    }

    const item = findItemById(id);
    if (item.type === 'folder') {
        item.isCollapsed = !item.isCollapsed;
    }
    selectItem(id);
}

function handleFileListDblClick(event) {
    const nameSpan = event.target.closest('.item-name');
    if (!nameSpan) return;
    const listItem = nameSpan.closest('.list-item');
    triggerRename(parseInt(listItem.dataset.id));
}

function handleFileListContextMenu(event) {
    const listItem = event.target.closest('.list-item');
    if (listItem) {
        event.preventDefault();
        contextTargetId = parseInt(listItem.dataset.id);
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
        contextMenu.classList.add('visible');
    }
}

function handleContextMenuClick(event) {
    if (!contextTargetId) return;
    
    const action = event.target.dataset.action;
    hideContextMenu();
    if (!action) return;
    
    const item = findItemById(contextTargetId);
    switch (action) {
        case 'rename': triggerRename(contextTargetId); break;
        case 'delete': deleteItem(contextTargetId); break;
        case 'new-file': addItem('file', item); break;
        case 'new-folder': addItem('folder', item); break;
    }
}

function handleGlobalKeyDown(event) {
    const isModalVisible = modalOverlay.classList.contains('visible');

    if (isModalVisible && event.key === 'Enter') {
        if (document.activeElement.tagName !== 'TEXTAREA') {
            event.preventDefault();
            modalConfirmBtn.click();
        }
        return;
    }

    if (!isModalVisible && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveProjectButton.click();
        return;
    }

    const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if (isTyping) return;

    if (activeItemId) {
        const activeItem = findItemById(activeItemId);
        if (!activeItem) return;

        switch (event.key) {
            case 'F2': event.preventDefault(); triggerRename(activeItemId); break;
            case 'Delete': event.preventDefault(); deleteItem(activeItemId); break;
            case 'ArrowUp': event.preventDefault(); navigateFileSystem('up'); break;
            case 'ArrowDown': event.preventDefault(); navigateFileSystem('down'); break;
            case 'ArrowRight':
                if (activeItem.type === 'folder' && activeItem.isCollapsed) {
                    event.preventDefault();
                    activeItem.isCollapsed = false;
                    renderFileSystem();
                }
                break;
            case 'ArrowLeft':
                if (activeItem.type === 'folder' && !activeItem.isCollapsed) {
                    event.preventDefault();
                    activeItem.isCollapsed = true;
                    renderFileSystem();
                }
                break;
        }
    }
}

// --- Drag and Drop Handlers ---
function handleDragStart(event) {
    const listItem = event.target.closest('.list-item');
    if (!listItem) return;
    draggedItemId = parseInt(listItem.dataset.id);
    setTimeout(() => listItem.classList.add('dragging'), 0);
}

function handleDragEnd() {
    const draggingElement = fileListElement.querySelector('.dragging');
    if (draggingElement) {
        draggingElement.classList.remove('dragging');
    }
}

function handleDragOver(event) {
    event.preventDefault();
    fileListElement.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    const listItem = event.target.closest('.list-item');
    if (listItem && listItem.dataset.type === 'folder') {
        listItem.classList.add('drag-over');
    }
}

function handleDragLeave(event) {
    event.target.closest('.list-item')?.classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    fileListElement.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    
    const draggedItem = findItemById(draggedItemId);
    if (!draggedItem) return;
    
    const targetListItem = event.target.closest('.list-item');
    const originalParent = findParentOf(draggedItemId);
    
    if (!targetListItem && !originalParent) return;

    const parentRegistry = originalParent ? originalParent.children : fileSystem;
    const itemIndex = parentRegistry.findIndex(child => child.id === draggedItemId);

    if (itemIndex > -1) {
        parentRegistry.splice(itemIndex, 1);
    }

    if (targetListItem) {
        const targetFolder = findItemById(parseInt(targetListItem.dataset.id));
        if (targetFolder?.type === 'folder' && targetFolder.id !== draggedItemId) {
            targetFolder.children.push(draggedItem);
            targetFolder.isCollapsed = false;
        } else {
            parentRegistry.splice(itemIndex, 0, draggedItem);
        }
    } else {
        fileSystem.push(draggedItem);
    }
    renderFileSystem();
}

// --- Resizer Handlers ---
function handleResizerMouseMove(event) {
    sidebar.style.width = `${event.clientX}px`;
}

function stopResizing() {
    document.removeEventListener('mousemove', handleResizerMouseMove);
}

function handleResizerMouseDown() {
    document.addEventListener('mousemove', handleResizerMouseMove);
    document.addEventListener('mouseup', stopResizing, { once: true });
}