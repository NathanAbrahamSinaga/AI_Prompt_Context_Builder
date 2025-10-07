function parseImportedText(text) {
    const lines = text.split('\n').map(l => l.replace(/\r$/, ''));
    const newFileSystem = [];
    const pathStack = [{ indent: -1, children: newFileSystem, path: '' }];
    const allItemsByPath = {};
    const fileHeaderRegex = /^--- File: (.*) ---$/;
    let inTreeSection = false;
    const treeRegex = /^(│|\s)*(├──|└──)\s(.*)$/;

    for (const line of lines) {
        if (line.startsWith('STRUKTUR PROYEK')) {
            inTreeSection = true;
            continue;
        }
        if (!inTreeSection || line.startsWith('KONTEN FILE')) {
            break;
        }
        if (line.trim() === '' || line.startsWith('===')) {
            continue;
        }

        const match = line.match(treeRegex);
        if (match) {
            const indentText = match[1] || '';
            const name = match[3].trim().replace(/\/$/, '');
            if (!name) continue;
            
            const indent = indentText.replace(/│/g, ' ').length;

            while (pathStack.length > 1 && indent <= pathStack[pathStack.length - 1].indent) {
                pathStack.pop();
            }

            const parent = pathStack[pathStack.length - 1];
            const currentPath = parent.path ? `${parent.path}/${name}` : name;
            
            const newItem = { id: 0, name: name, type: 'folder', children: [], isCollapsed: false };

            parent.children.push(newItem);
            allItemsByPath[currentPath] = newItem;
            pathStack.push({ indent: indent, children: newItem.children, path: currentPath });
        }
    }

    let currentFileObject = null;
    let contentLines = [];
    const commitFileContent = () => {
        if (currentFileObject) {
            currentFileObject.content = contentLines.join('\n').trim();
            contentLines = [];
            currentFileObject = null;
        }
    };
    
    for (const line of lines) {
        const fileHeaderMatch = line.match(fileHeaderRegex);
        if (fileHeaderMatch) {
            commitFileContent();
            const filePath = fileHeaderMatch[1].trim();
            const item = allItemsByPath[filePath];
            if (item) {
                item.type = 'file';
                delete item.children;
                delete item.isCollapsed;
                currentFileObject = item;
            }
        } else if (currentFileObject) {
            contentLines.push(line);
        }
    }
    commitFileContent();

    return newFileSystem;
}

function generateExportText() {
    const outputLines = [];
    const buildTreeRecursive = (tree, prefix = '') => {
        tree.forEach((item, index) => {
            const isLast = index === tree.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            outputLines.push(`${prefix}${connector}${item.name}`);

            if (item.type === 'folder' && item.children?.length > 0 && !item.isCollapsed) {
                buildTreeRecursive(item.children, prefix + (isLast ? '    ' : '│   '));
            }
        });
    };

    const appendContentRecursive = (tree, currentPath = '') => {
        tree.forEach(item => {
            const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
            if (item.type === 'file') {
                outputLines.push(`\n--- File: ${itemPath} ---\n${item.content || ''}`);
            } else if (item.type === 'folder') {
                appendContentRecursive(item.children, itemPath);
            }
        });
    };

    outputLines.push('STRUKTUR PROYEK:\n=================');
    buildTreeRecursive(fileSystem);
    outputLines.push('\n\nKONTEN FILE:\n==============');
    appendContentRecursive(fileSystem);
    return outputLines.join('\n');
}