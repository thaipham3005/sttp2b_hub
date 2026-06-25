const API_URL = 'api.php';
let appData = { categories: [] };

// DOM Elements
const mainContent = document.getElementById('mainContent');
const editModeBtn = document.getElementById('editModeBtn');

const categoryModal = document.getElementById('categoryModal');
const categoryForm = document.getElementById('categoryForm');
const catModalTitle = document.getElementById('catModalTitle');
const catIdInput = document.getElementById('catId');
const catNameInput = document.getElementById('catName');

const linkModal = document.getElementById('linkModal');
const linkForm = document.getElementById('linkForm');
const linkModalTitle = document.getElementById('linkModalTitle');
const linkCategoryIdInput = document.getElementById('linkCategoryId');
const linkIdInput = document.getElementById('linkId');
const linkTitleInput = document.getElementById('linkTitle');
const linkDescInput = document.getElementById('linkDesc');
const linkUrlInput = document.getElementById('linkUrl');
const linkIconInput = document.getElementById('linkIcon');

const themeToggleBtn = document.getElementById('themeToggleBtn');
const layoutSelect = document.getElementById('layoutSelect');

const pinModal = document.getElementById('pinModal');
const pinForm = document.getElementById('pinForm');
const pinInput = document.getElementById('pinInput');

// State
let currentTheme = localStorage.getItem('theme') || 'light';
let currentLang = localStorage.getItem('lang') || 'EN';
let currentLayout = localStorage.getItem('layout') || 'layout-grid-3';

// Translations
const i18n = {
    EN: {
        editMode: "Edit Mode",
        addCategory: "Add Category",
        categoryName: "Category Name",
        cancel: "Cancel",
        save: "Save",
        addLink: "Add Link",
        description: "Description",
        title: "Title",
        url: "URL",
        iconUrl: "Icon URL (optional)",
        editCategory: "Edit Category",
        editLink: "Edit Link",
        layoutList: "List",
        layoutGrid3: "3 per row",
        layoutGrid4: "4 per row",
        layoutGrid8: "8 per row",
        enterPin: "Enter PIN",
        pin: "PIN",
        unlock: "Unlock",
        incorrectPin: "Incorrect PIN!"
    },
    VN: {
        editMode: "Chế độ Sửa",
        addCategory: "Thêm Danh mục",
        categoryName: "Tên Danh mục",
        cancel: "Hủy",
        save: "Lưu",
        addLink: "Thêm Liên kết",
        description: "Mô tả",
        title: "Tiêu đề",
        url: "Đường dẫn",
        iconUrl: "Đường dẫn Biểu tượng (tùy chọn)",
        editCategory: "Sửa Danh mục",
        editLink: "Sửa Liên kết",
        layoutList: "Danh sách",
        layoutGrid3: "3 mỗi hàng",
        layoutGrid4: "4 mỗi hàng",
        layoutGrid8: "8 mỗi hàng",
        enterPin: "Nhập mã PIN",
        pin: "Mã PIN",
        unlock: "Mở khóa",
        incorrectPin: "Mã PIN không đúng!"
    }
};

// Initialize
async function init() {
    applyTheme(currentTheme);
    applyLang(currentLang);
    
    // Set initial layout
    document.body.classList.add(currentLayout);
    layoutSelect.value = currentLayout;

    await loadData();
    render();
    
    // Edit mode button logic
    editModeBtn.addEventListener('click', () => {
        if (document.body.classList.contains('edit-mode')) {
            // Lock it
            document.body.classList.remove('edit-mode');
            editModeBtn.innerHTML = '<i class="fa-solid fa-lock"></i>';
            render();
        } else {
            // Prompt for PIN
            pinInput.value = '';
            openModal('pinModal');
            setTimeout(() => pinInput.focus(), 100);
        }
    });

    pinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify_pin', pin: pinInput.value })
            });
            const result = await response.json();
            if (result.success) {
                document.body.classList.add('edit-mode');
                editModeBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i>';
                closeModal('pinModal');
                render();
            } else {
                alert(i18n[currentLang].incorrectPin);
                pinInput.value = '';
                pinInput.focus();
            }
        } catch (err) {
            console.error('Error verifying PIN:', err);
            alert('Error verifying PIN');
        }
    });

    // Theme Toggle
    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    });

    // Layout Toggle
    layoutSelect.addEventListener('change', (e) => {
        document.body.classList.remove(currentLayout);
        currentLayout = e.target.value;
        document.body.classList.add(currentLayout);
        localStorage.setItem('layout', currentLayout);
    });

    // Handle Forms
    categoryForm.addEventListener('submit', handleCategorySubmit);
    linkForm.addEventListener('submit', handleLinkSubmit);
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove('light-mode');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

function applyLang(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang] && i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });
}

// Load Data
async function loadData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        appData = data;
        if (!appData.categories) appData.categories = [];
    } catch (err) {
        console.error('Error loading data:', err);
    }
}

// Save Data
async function saveData() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appData)
        });
        const result = await response.json();
        if(!result.success) {
            alert('Failed to save data!');
        }
    } catch (err) {
        console.error('Error saving data:', err);
    }
}

// Render
function render() {
    mainContent.innerHTML = '';
    const isEditMode = document.body.classList.contains('edit-mode');
    
    appData.categories.forEach((category, catIndex) => {
        const catEl = document.createElement('section');
        catEl.className = 'category';
        if (isEditMode) {
            catEl.draggable = true;
            catEl.dataset.type = 'category';
            catEl.dataset.catIndex = catIndex;
        }
        
        // Category Header
        const headerEl = document.createElement('div');
        headerEl.className = 'category-header';
        
        const titleEl = document.createElement('h2');
        titleEl.className = 'category-title';
        titleEl.innerHTML = `<span>${escapeHTML(category.name)}</span>`;
        
        const catActionsEl = document.createElement('div');
        catActionsEl.className = 'category-actions';
        catActionsEl.innerHTML = `
            <button class="btn-icon" onclick="openCategoryModal('${category.id}')" title="Edit Category"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon danger" onclick="deleteCategory('${category.id}')" title="Delete Category"><i class="fa-solid fa-trash"></i></button>
        `;
        
        headerEl.appendChild(titleEl);
        headerEl.appendChild(catActionsEl);
        catEl.appendChild(headerEl);
        
        // Tiles Grid
        const gridEl = document.createElement('div');
        gridEl.className = 'tiles-grid';
        if (isEditMode) {
            gridEl.dataset.dropZone = 'category';
            gridEl.dataset.catId = category.id;
        }
        
        if (category.links) {
            category.links.forEach((link, linkIndex) => {
                const tileEl = document.createElement('a');
                tileEl.className = 'tile';
                tileEl.href = link.url;
                tileEl.target = '_blank';
                tileEl.rel = 'noopener noreferrer';
                
                if (isEditMode) {
                    tileEl.draggable = true;
                    tileEl.dataset.type = 'link';
                    tileEl.dataset.catId = category.id;
                    tileEl.dataset.linkIndex = linkIndex;
                    tileEl.addEventListener('click', (e) => e.preventDefault());
                }
                
                const iconUrl = link.icon || 'https://via.placeholder.com/48/3b82f6/ffffff?text=' + link.title.charAt(0).toUpperCase();
                
                tileEl.innerHTML = `
                    <div class="tile-icon">
                        <img src="${escapeHTML(iconUrl)}" alt="${escapeHTML(link.title)} icon" onerror="this.src='https://via.placeholder.com/48/3b82f6/ffffff?text=${link.title.charAt(0).toUpperCase()}'">
                    </div>
                    <div class="tile-info">
                        <div class="tile-title">${escapeHTML(link.title)}</div>
                        ${link.description ? `<div class="tile-desc">${escapeHTML(link.description)}</div>` : `<div class="tile-url">${escapeHTML(link.url)}</div>`}
                    </div>
                    <div class="tile-actions" onclick="event.preventDefault();">
                        <button class="btn-icon" onclick="openLinkModal('${category.id}', '${link.id}')" title="Edit Link"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon danger" onclick="deleteLink('${category.id}', '${link.id}')" title="Delete Link"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                gridEl.appendChild(tileEl);
            });
        }
        
        // Add Tile Button (only visible in edit mode)
        const addTileBtn = document.createElement('div');
        addTileBtn.className = 'tile add-tile-btn';
        addTileBtn.innerHTML = `
            <i class="fa-solid fa-plus fa-2x"></i>
            <span>${i18n[currentLang].addLink}</span>
        `;
        addTileBtn.onclick = () => openLinkModal(category.id);
        gridEl.appendChild(addTileBtn);
        
        catEl.appendChild(gridEl);
        mainContent.appendChild(catEl);
    });
    
    // Add Category Button
    const addCatContainer = document.createElement('div');
    addCatContainer.className = 'add-category-btn-container';
    addCatContainer.innerHTML = `<button class="add-category-btn" onclick="openCategoryModal()"><i class="fa-solid fa-plus"></i> ${i18n[currentLang].addCategory}</button>`;
    mainContent.appendChild(addCatContainer);
    
    // Initialize Drag and Drop Listeners if in Edit Mode
    if (isEditMode) {
        initDragAndDrop();
    }
}

// Modal Logic
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function openCategoryModal(catId = null) {
    if (catId) {
        const cat = appData.categories.find(c => c.id === catId);
        catModalTitle.textContent = i18n[currentLang].editCategory;
        catIdInput.value = cat.id;
        catNameInput.value = cat.name;
    } else {
        catModalTitle.textContent = i18n[currentLang].addCategory;
        catIdInput.value = '';
        catNameInput.value = '';
    }
    openModal('categoryModal');
}

function openLinkModal(catId, linkId = null) {
    linkCategoryIdInput.value = catId;
    if (linkId) {
        const cat = appData.categories.find(c => c.id === catId);
        const link = cat.links.find(l => l.id === linkId);
        linkModalTitle.textContent = i18n[currentLang].editLink;
        linkIdInput.value = link.id;
        linkTitleInput.value = link.title;
        linkDescInput.value = link.description || '';
        linkUrlInput.value = link.url;
        linkIconInput.value = link.icon || '';
    } else {
        linkModalTitle.textContent = i18n[currentLang].addLink;
        linkIdInput.value = '';
        linkTitleInput.value = '';
        linkDescInput.value = '';
        linkUrlInput.value = '';
        linkIconInput.value = '';
    }
    openModal('linkModal');
}

// Handlers
async function handleCategorySubmit(e) {
    e.preventDefault();
    const id = catIdInput.value;
    const name = catNameInput.value.trim();
    
    if (id) {
        const cat = appData.categories.find(c => c.id === id);
        if(cat) cat.name = name;
    } else {
        appData.categories.push({
            id: 'cat-' + Date.now(),
            name: name,
            links: []
        });
    }
    closeModal('categoryModal');
    render();
    await saveData();
}

async function handleLinkSubmit(e) {
    e.preventDefault();
    const catId = linkCategoryIdInput.value;
    const linkId = linkIdInput.value;
    const title = linkTitleInput.value.trim();
    const desc = linkDescInput.value.trim();
    const url = linkUrlInput.value.trim();
    const icon = linkIconInput.value.trim();
    
    const cat = appData.categories.find(c => c.id === catId);
    if (!cat) return;

    if (linkId) {
        const link = cat.links.find(l => l.id === linkId);
        if (link) {
            link.title = title;
            link.description = desc;
            link.url = url;
            link.icon = icon;
        }
    } else {
        cat.links.push({
            id: 'link-' + Date.now(),
            title: title,
            description: desc,
            url: url,
            icon: icon
        });
    }
    closeModal('linkModal');
    render();
    await saveData();
}

async function deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        appData.categories = appData.categories.filter(c => c.id !== id);
        render();
        await saveData();
    }
}

async function deleteLink(catId, linkId) {
    if (confirm('Are you sure you want to delete this link?')) {
        const cat = appData.categories.find(c => c.id === catId);
        if (cat) {
            cat.links = cat.links.filter(l => l.id !== linkId);
            render();
            await saveData();
        }
    }
}

// Drag and Drop Logic (using SortableJS)
let sortableCategories = null;
let sortableLinksList = [];

function initDragAndDrop() {
    // Clean up existing instances if any
    if (sortableCategories) sortableCategories.destroy();
    sortableLinksList.forEach(s => s.destroy());
    sortableLinksList = [];
    
    // Sortable for Categories
    sortableCategories = new Sortable(mainContent, {
        animation: 150,
        handle: '.category-header', // drag handle
        draggable: '.category',
        onEnd: async function (evt) {
            const { oldIndex, newIndex } = evt;
            if (oldIndex === newIndex) return;
            const [movedCat] = appData.categories.splice(oldIndex, 1);
            appData.categories.splice(newIndex, 0, movedCat);
            render();
            await saveData();
        }
    });

    // Sortable for Links in each category
    const grids = document.querySelectorAll('.tiles-grid');
    grids.forEach(grid => {
        const s = new Sortable(grid, {
            group: 'shared', // set both lists to same group
            animation: 150,
            filter: '.add-tile-btn',
            draggable: '.tile:not(.add-tile-btn)',
            onEnd: async function (evt) {
                const fromCatId = evt.from.dataset.catId;
                const toCatId = evt.to.dataset.catId;
                const oldIndex = evt.oldIndex;
                let newIndex = evt.newIndex;
                
                if (!fromCatId || !toCatId) return;
                
                const fromCat = appData.categories.find(c => c.id === fromCatId);
                const toCat = appData.categories.find(c => c.id === toCatId);
                
                if (fromCat && toCat) {
                    if (newIndex > toCat.links.length) {
                        newIndex = toCat.links.length;
                    }
                    if (fromCatId === toCatId && oldIndex === newIndex) return;
                    
                    const [movedLink] = fromCat.links.splice(oldIndex, 1);
                    toCat.links.splice(newIndex, 0, movedLink);
                    render();
                    await saveData();
                }
            }
        });
        sortableLinksList.push(s);
    });
}

// Utils
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}

// Start
init();
