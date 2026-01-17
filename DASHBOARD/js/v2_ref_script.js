/* ============================================================
   QUICK REFERENCE : LOGIC & EDIT MODE
   ============================================================ */

let isEditMode = false;
let currentCategory = 'ALL';

// 初期化
window.onload = () => {
    if (typeof REF_DATA === 'undefined') {
        alert("Error: ref_data.js not loaded.");
        return;
    }
    renderRefItems(REF_DATA);
};

/* --- RENDER LOGIC --- */
function renderRefItems(data) {
    const container = document.getElementById('ref-content-area');
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#64748b; grid-column:1/-1; padding:40px; font-weight:700;">NO MATCHING ITEMS</div>`;
        return;
    }

    data.forEach((item) => {
        let typeClass = "type-normal";
        if (item.category === "LIMIT") typeClass = "type-limit";
        if (item.category === "MEMORY") typeClass = "type-memory";
        if (item.category === "PERF") typeClass = "type-perf";

        const div = document.createElement('div');
        div.className = `ref-card ${typeClass}`;
        
        // カードクリック時の動作（編集ボタンなどを避ける）
        div.onclick = (e) => {
            if(!isEditMode && !e.target.closest('button')) toggleCard(div);
        };

        let editControls = "";
        if (isEditMode) {
            // ★編集ボタンと削除ボタンを表示
            // IDを渡して編集関数を呼ぶ
            editControls = `
                <button class="ref-edit-btn" onclick="openEditModal('${item.id}')">✎</button>
                <button class="ref-del-btn" onclick="deleteItem('${item.id}')">×</button>
            `;
        }

        div.innerHTML = `
            ${editControls}
            <div class="ref-card-header">
                <div class="ref-title-group">
                    <span class="ref-card-tag" style="color:${getColor(item.category)}">${item.tag}</span>
                    <span class="ref-card-title">${item.title}</span>
                </div>
                <div class="ref-expand-icon">▼</div>
            </div>
            <div class="ref-card-body">
                <div class="ref-content-inner">${item.content}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

function getColor(cat) {
    if(cat==='LIMIT') return '#ef4444';
    if(cat==='MEMORY') return '#f59e0b';
    if(cat==='PERF') return '#10b981';
    return '#3b82f6';
}

function toggleCard(card) {
    const body = card.querySelector('.ref-card-body');
    if (card.classList.contains('expanded')) {
        card.classList.remove('expanded');
        body.style.maxHeight = null;
    } else {
        card.classList.add('expanded');
        body.style.maxHeight = body.scrollHeight + "px";
    }
}

/* --- FILTER LOGIC --- */
function filterCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.ref-cat-btn').forEach(b => b.classList.remove('active'));
    
    if (cat === 'ALL') {
        document.querySelector('.ref-cat-btn').classList.add('active');
    } else {
        const targetBtn = document.querySelector(`.ref-cat-btn.cat-${cat.toLowerCase()}`);
        if(targetBtn) targetBtn.classList.add('active');
    }
    filterRefItems();
}

function filterRefItems() {
    const keyword = document.getElementById('ref-search-input').value.toLowerCase();
    
    // グローバルなREF_DATAを使用
    const filtered = REF_DATA.filter(item => {
        const catMatch = (currentCategory === 'ALL') || (item.category === currentCategory);
        const textMatch = 
            item.title.toLowerCase().includes(keyword) || 
            item.content.toLowerCase().includes(keyword) ||
            item.tag.toLowerCase().includes(keyword);
        return catMatch && textMatch;
    });
    renderRefItems(filtered);
}

function clearSearch() {
    document.getElementById('ref-search-input').value = "";
    filterRefItems();
}

/* --- EDIT MODE LOGIC --- */
function toggleEditMode() {
    isEditMode = !isEditMode;
    const btn = document.getElementById('btn-edit-mode');
    const fabAdd = document.getElementById('fab-add');
    const fabExport = document.getElementById('fab-export');

    if (isEditMode) {
        btn.classList.add('active');
        fabAdd.style.display = 'flex';
        fabExport.style.display = 'flex';
    } else {
        btn.classList.remove('active');
        fabAdd.style.display = 'none';
        fabExport.style.display = 'none';
    }
    // 再描画して削除ボタンを表示/非表示
    filterRefItems();
}

// 削除機能
function deleteItem(id) {
    if (!confirm("Delete this item?")) return;
    
    // IDで検索して削除
    const idx = REF_DATA.findIndex(d => d.id === id);
    if (idx > -1) {
        REF_DATA.splice(idx, 1);
        filterRefItems();
    }
}

/* --- ADD / EXPORT MODAL LOGIC --- */
function openAddModal() {
    document.getElementById('modal-add').classList.add('active');
    document.getElementById('modal-title').innerText = "ADD NEW ITEM";
    
    // フォームをクリア
    document.getElementById('inp-id').value = ""; // ID空 = 新規
    document.getElementById('inp-cat').value = "LIMIT";
    document.getElementById('inp-tag').value = "";
    document.getElementById('inp-title').value = "";
    document.getElementById('inp-content').value = "";
}

// ★追加：編集モードで開く
function openEditModal(id) {
    const item = REF_DATA.find(d => d.id === id);
    if (!item) return;

    document.getElementById('modal-add').classList.add('active');
    document.getElementById('modal-title').innerText = "EDIT ITEM";

    // 既存データをセット
    document.getElementById('inp-id').value = item.id; // IDあり = 編集
    document.getElementById('inp-cat').value = item.category;
    document.getElementById('inp-tag').value = item.tag;
    document.getElementById('inp-title').value = item.title;
    document.getElementById('inp-content').value = item.content;
}

function openExportModal() {
    document.getElementById('modal-export').classList.add('active');
    
    // JSONデータをコード形式の文字列に変換
    const jsonStr = JSON.stringify(REF_DATA, null, 2);
    const codeStr = `/* ============================================================
   QUICK REFERENCE : DATA FILE
   Edit Modeで書き出されたコードをここに上書きしてください
   ============================================================ */

const REF_DATA = ${jsonStr};`;

    document.getElementById('export-area').value = codeStr;
}

function closeModals() {
    document.querySelectorAll('.ref-modal-overlay').forEach(el => el.classList.remove('active'));
}

// 保存処理（新規・編集共通）
function saveItem() {
    const id = document.getElementById('inp-id').value; // 隠しフィールドのID
    const cat = document.getElementById('inp-cat').value;
    const tag = document.getElementById('inp-tag').value;
    const title = document.getElementById('inp-title').value;
    const content = document.getElementById('inp-content').value;

    if (!title || !content) {
        alert("Title and Content are required.");
        return;
    }

    if (id) {
        // --- 編集モード（既存IDがある場合） ---
        const index = REF_DATA.findIndex(d => d.id === id);
        if (index > -1) {
            REF_DATA[index] = {
                id: id,
                category: cat,
                tag: tag || cat,
                title: title,
                content: content
            };
        }
    } else {
        // --- 新規作成モード ---
        const newItem = {
            id: "id-" + Date.now(),
            category: cat,
            tag: tag || cat,
            title: title,
            content: content
        };
        REF_DATA.push(newItem);
    }

    closeModals();
    filterRefItems(); // 再描画
}

function copyExportCode() {
    const textarea = document.getElementById('export-area');
    textarea.select();
    document.execCommand('copy');
    alert("Code copied! Paste it into 'ref_data.js'.");
}