document.addEventListener('DOMContentLoaded', () => {
    function initialize() {
        // Button Listeners
        saveProjectButton.addEventListener('click', handleSaveClick);
        exportButton.addEventListener('click', handleExportClick);
        addFileButton.addEventListener('click', () => addItem('file'));
        addFolderButton.addEventListener('click', () => addItem('folder'));
        resetButton.addEventListener('click', handleResetClick);
        rebuildIdsButton.addEventListener('click', handleRebuildIdsClick);
        importButton.addEventListener('click', handleImportClick);
        helpButton.addEventListener('click', handleHelpClick);
        themeToggleButton.addEventListener('click', handleThemeToggle);

        // Editor Listeners
        editorInput.addEventListener('input', handleEditorInput);
        editorInput.addEventListener('scroll', handleEditorScroll);

        // Modal Listeners
        modalConfirmBtn.addEventListener('click', handleModalConfirm);
        modalCancelBtn.addEventListener('click', hideModal);
        
        // File List & Context Menu Listeners
        fileListElement.addEventListener('click', handleFileListClick);
        fileListElement.addEventListener('dblclick', handleFileListDblClick);
        fileListElement.addEventListener('contextmenu', handleFileListContextMenu);
        
        // Drag and Drop Listeners
        fileListElement.addEventListener('dragstart', handleDragStart);
        fileListElement.addEventListener('dragend', handleDragEnd);
        fileListElement.addEventListener('dragover', handleDragOver);
        fileListElement.addEventListener('dragleave', handleDragLeave);
        fileListElement.addEventListener('drop', handleDrop);

        // Other Listeners
        contextMenu.addEventListener('click', handleContextMenuClick);
        resizer.addEventListener('mousedown', handleResizerMouseDown);
        document.addEventListener('keydown', handleGlobalKeyDown);
        window.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                hideContextMenu();
            }
        });

        // Initial Setup
        loadTheme();
        recomputeNextId();
        clearEditorState();
    }
    
    initialize();
});