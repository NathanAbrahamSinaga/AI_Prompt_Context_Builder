function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function renderFileSystem() {
    fileListElement.innerHTML = '';
    const createItemElement = (item) => {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.dataset.id = item.id;
        li.dataset.type = item.type;

        if (item.type === 'file') {
            const ext = item.name.split('.').pop();
            li.dataset.extension = ext;
        }
        if (item.type === 'folder' && item.isCollapsed) {
            li.classList.add('collapsed');
        }
        if (item.id === activeItemId) {
            li.classList.add('active');
        }

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'item-content';
        contentWrapper.draggable = true;
        contentWrapper.innerHTML = `<span class="item-icon"></span><span class="item-name">${item.name}</span><button class="delete-btn">&times;</button>`;
        li.appendChild(contentWrapper);

        if (item.type === 'folder' && !item.isCollapsed && item.children?.length > 0) {
            const childrenUl = document.createElement('ul');
            item.children.forEach(child => childrenUl.appendChild(createItemElement(child)));
            li.appendChild(childrenUl);
        }
        return li;
    };
    fileSystem.forEach(item => fileListElement.appendChild(createItemElement(item)));
}

function showModal({ title, bodyHtml, confirmText = 'OK', showCancelButton = true, large = false }) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modalConfirmBtn.textContent = confirmText;
    modalCancelBtn.style.display = showCancelButton ? 'inline-block' : 'none';
    
    large ? modalBox.classList.add('modal-lg') : modalBox.classList.remove('modal-lg');
    
    modalOverlay.classList.add('visible');

    const input = modalBody.querySelector('input, textarea');
    if (input) {
        input.focus();
        input.select();
    }
    return new Promise((resolve) => {
        modalConfirmResolver = resolve;
    });
}

function hideModal() {
    modalOverlay.classList.remove('visible');
    modalBox.classList.remove('modal-lg');
    if (modalConfirmResolver) {
        modalConfirmResolver(null);
        modalConfirmResolver = null;
    }
}

function hideContextMenu() {
    contextMenu.classList.remove('visible');
}

function clearEditorState() {
    activeItemId = null;
    editorInput.value = '';
    editorOutput.textContent = '';
    currentFileNameElement.textContent = 'Pilih file untuk diedit';
    editorWrapper.style.display = 'none';
    editorPlaceholder.style.display = 'flex';
    renderFileSystem();
}

function updateEditor(code, language) {
    editorOutput.textContent = code;
    editorDisplay.className = `language-${language} line-numbers`;
    Prism.highlightElement(editorOutput);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('editorTheme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggleButton.textContent = '🌙';
    } else {
        themeToggleButton.textContent = '☀️';
    }
}