function recomputeNextId(tree = fileSystem) {
    let maxId = 0;
    function findMax(items) {
        for (const item of items) {
            maxId = Math.max(maxId, item.id);
            if (item.type === 'folder' && item.children) {
                findMax(item.children);
            }
        }
    }
    findMax(tree);
    nextId = maxId + 1;
}

function findItemById(id, tree = fileSystem) {
    for (const item of tree) {
        if (item.id === id) return item;
        if (item.type === 'folder' && item.children) {
            const found = findItemById(id, item.children);
            if (found) return found;
        }
    }
    return null;
}

function findParentOf(itemId, tree = fileSystem, parent = null) {
    for (const item of tree) {
        if (item.id === itemId) return parent;
        if (item.type === 'folder' && item.children) {
            const found = findParentOf(itemId, item.children, item);
            if (found) return found;
        }
    }
    return null;
}

function rebuildAllIds() {
    let currentId = 1;
    function rebuild(items) {
        for (const item of items) {
            item.id = currentId++;
            if (item.type === 'folder' && item.children) {
                rebuild(item.children);
            }
        }
    }
    rebuild(fileSystem);
    nextId = currentId;
}

function getVisibleItems() {
    const visibleItemElements = [];
    const walker = document.createTreeWalker(fileListElement, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (node) => {
            return node.classList.contains('list-item') && node.offsetParent !== null
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT;
        }
    });
    while (walker.nextNode()) {
        visibleItemElements.push(walker.currentNode);
    }
    return visibleItemElements;
}