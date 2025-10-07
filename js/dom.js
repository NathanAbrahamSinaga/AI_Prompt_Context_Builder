const fileListElement = document.getElementById('file-list');
const editorWrapper = document.getElementById('editor-wrapper');
const editorInput = document.getElementById('editor-input');
const editorDisplay = document.getElementById('editor-display');
const editorOutput = document.getElementById('editor-output');
const editorPlaceholder = document.getElementById('editor-placeholder');
const currentFileNameElement = document.getElementById('current-file-name');

const saveProjectButton = document.getElementById('save-project-btn');
const addFileButton = document.getElementById('add-file-btn');
const addFolderButton = document.getElementById('add-folder-btn');
const exportButton = document.getElementById('export-btn');
const importButton = document.getElementById('import-btn');
const resetButton = document.getElementById('reset-btn');
const rebuildIdsButton = document.getElementById('rebuild-ids-btn');
const helpButton = document.getElementById('help-btn');
const themeToggleButton = document.getElementById('theme-toggle-btn');

const contextMenu = document.getElementById('context-menu');
const modalOverlay = document.getElementById('modal-overlay');
const modalBox = document.querySelector('.modal-box');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const toastContainer = document.getElementById('toast-container');

const resizer = document.getElementById('resizer');
const sidebar = document.getElementById('sidebar');