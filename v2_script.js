/* ============================================================
   CO-PILOT PAD v2 : MAIN LOGIC (FINAL REVISION)
   (Requires: flight_db2.js loaded in HTML)
   ============================================================ */

const ITEMS = ["APU", "MEL/ACARS", "WX", "W&B", "ATC CLEARANCE", "FINAL PRE FLIGHT CHECKLIST", "CA", "GND"];
const SP_DATA = [{c:"WCHC",l:"WCHC"},{c:"WCHS",l:"WCHS"},{c:"STCR",l:"STCR"},{c:"INF",l:"INFANT"}];

// ↓↓↓ ここに取得したCheckWXのAPIキーを貼り付けてください ↓↓↓
const WX_API_KEY = "70a1a6628e114359af87a90f1f2f39e1";

// IATA(3文字) -> ICAO(4文字) 変換マップ
const AIRPORT_MAP = {
    "HND": "RJTT", "ITM": "RJOO", "CTS": "RJCC", "FUK": "RJFF", "OKA": "ROAH",
    "KIX": "RJBB", "NGO": "RJGG", "HIJ": "RJOA", "MMB": "RJCM", "AKJ": "RJEC",
    "KUH": "RJCK", "HKD": "RJCH", "AOJ": "RJSA", "MSJ": "RJSM", "AXT": "RJSK",
    "GAJ": "RJSC", "KMQ": "RJNK", "SHM": "RJBD", "OKJ": "RJOB", "IZO": "RJOC",
    "UBJ": "RJDC", "TKS": "RJOS", "TAK": "RJOT", "KCZ": "RJOK", "MYJ": "RJOM",
    "KKJ": "RJFR", "OIT": "RJFO", "NGS": "RJFU", "KMJ": "RJFT", "KMI": "RJFM",
    "KOJ": "RJFK", "ASJ": "RJKA", "ISG": "ROIG", "MMY": "ROMY", "OKD": "RJCO",
    "UEO": "RORH", "JCJ": "RJFC"
};

// CLOSE LEG CHECKLIST DATA
const CL_DATA = {
    'INTERVAL': ["CLOSE FLIGHT (eLog)", "PREPARE FLIGHT (eLog)", "FLIGHT INFO TO CABIN"],
    'SHIP_CHANGE': ["SECURE PROCEDURE", "CLOSE FLIGHT (eLog)", "PERSONAL GEAR CHECK", "CHECK DRINK HOLDER"],
    'DUTY_OFF': ["SECURE PROCEDURE", "CLOSE FLIGHT (eLog)", "REPORTS (RNP/CAP)", "LOG BOOK SIGN", "PERSONAL GEAR CHECK"]
};



// 変換ヘルパー関数
function toICAO(code) {
    if (!code) return "----";
    // すでに4文字ならそのまま返す（OTHERSで手入力した場合など）
    if (code.length === 4) return code;
    // マップにあれば変換、なければそのまま
    return AIRPORT_MAP[code] || code;
}

// Crossover Calc Globals
let crossMach = 0.76;
let crossIas = 280;

// 新規追加: 天候表示モード ('dep', 'arr', 'alt')
// 天候表示モード
let wxMode = 'dep'; 
let wxOthersCode = 'ICAO'; // OTHERS選択時のデフォルト

let state = {
    idx: 0,
    timeMode: 'DOM', // 'DOM' or 'INT'
    legs: Array.from({length:4},()=>({
        // 初期値を空にして、未入力時は "----" を表示させる
        status: 'OPEN', // ★これを追加
        flt: "", 
        dep: "", arr: "", 
        std: "", sta: "", 
        timeEnroute: "", 
        taxi: "05",          // デフォルトを 05 分に変更
        paxTotal: "165", paxInf: "0",
        sp: {}, 
        load: { dry:0, dryMode:'DOM', mag:0, magPos:[], ti:0, radioPos:[], beadsFwd:0, beadsAft:0, codes:[] }, 
        loadAlerts: { ca: false, acars: false }, 
        checks: [], 
        turbLogs: []
    })),
    editKey: null, tmpVal: "", 
    turbCause: "", turbFreq: ""
};

window.onload = ()=>{ 
    loadData();
    initTurb(); 
    initCross(); 
    initWindCalc(); // 追加！
    render(); 
};

function render() {
    const l = state.legs[state.idx];
    
    // Leg Nav
    document.getElementById('leg-nav-area').innerHTML = state.legs.map((_,i)=>
        `<div class="leg-tab ${i===state.idx?'active':''}" onclick="setLeg(${i})">L${i+1}</div>`
    ).join('');
    
    // Status (データがない場合は "----" を表示)
    setTxt('disp-flt', l.flt || "----"); 
    setTxt('disp-dep', l.dep || "----"); 
    setTxt('disp-arr', l.arr || "----");
    
    // Time Formats (データがない場合は "--:--" を表示)
    setTxt('disp-std', fmt(l.std, true) || "--:--");
    setTxt('disp-sta', fmt(l.sta, true) || "--:--");
    setTxt('disp-flt-time', fmt(l.timeEnroute, false) || "--:--");
    setTxt('disp-taxi', (l.taxi ? l.taxi : "--") + " min");
    
    // === CALC: TTOT & INTERVAL ===
    setTxt('disp-ttot', calcTTOT(l));
    setTxt('disp-interval', calcInterval());
    
    // Pax
    setTxt('disp-pax-total', l.paxTotal);
    setTxt('disp-pax-inf', l.paxInf);
    
    // SP Icons
    const spTot = Object.values(l.sp).reduce((a,b)=>a+b,0);
    setTxt('badge-sp', spTot);
    const btnSp = document.getElementById('btn-sp-pax');
    if(btnSp) btnSp.classList.toggle('has-data', spTot>0);
    
    const btnLoad = document.getElementById('btn-sp-load');
    if(btnLoad) btnLoad.classList.toggle('has-data', l.spLoad);
    
    // Checklist
    const chkHTML = ITEMS.map(it=> {
        const chk = l.checks.includes(it);
        return `<div class="chk-item ${chk?'checked':''}" onclick="togChk('${it}')"><div class="chk-circle"></div><div class="chk-text">${it}</div></div>`;
    }).join('');
    document.getElementById('checklist-area').innerHTML = chkHTML;
    document.getElementById('checklist-complete-msg').style.display = ITEMS.every(i=>l.checks.includes(i)) ? 'block':'none';
    
    
    // Turb Log
    const listEl = document.getElementById('turb-log-list');
    if(listEl) {
        listEl.innerHTML = l.turbLogs.map(g => {
            const intClass = g.int ? g.int.replace('TB', 't') : '';
            return `
            <div class="log-row">
                <span style="flex:1.2; font-weight:700;">${g.fl}</span>
                <span style="flex:1; font-size:0.9rem;">${g.cause}</span>
                <span style="flex:0.8; font-size:0.8rem; color:#aaa;">${g.freq}</span>
                <span style="flex:0.8; display:flex; align-items:center;">
                    <span class="log-badge ${intClass}">${g.int}</span>
                </span>
                <span style="flex:0.8; text-align:right; font-size:0.9rem;">${g.time}</span>
            </div>`;
        }).join('');
    }

   // === WX TAB LOGIC (Updated for ICAO Conversion) ===
    let targetApt = "----";
    
    // 1. 元のコードを取得 (例: "HND")
    let rawCode = "";
    if (wxMode === 'dep') rawCode = l.dep;
    else if (wxMode === 'arr') rawCode = l.arr;
    
    // 2. ICAOコードに変換 (例: "HND" -> "RJTT")
    if (wxMode === 'others') {
        targetApt = wxOthersCode; // OTHERSはそのまま
    } else {
        targetApt = toICAO(rawCode); // DEP/ARRは変換する
    }

    // 3. 画面に表示
    const elCode = document.getElementById('wx-target-code');
    if(elCode) {
        elCode.innerText = targetApt;
        if (wxMode === 'others') {
            elCode.classList.add('input-active');
        } else {
            elCode.classList.remove('input-active');
        }
    }

    // Time Mode Buttons
    document.getElementById('tm-dom').classList.toggle('active', state.timeMode==='DOM');
    document.getElementById('tm-int').classList.toggle('active', state.timeMode==='INT');

    // ▼▼▼ WXタブの切り替え表示 (これを追加) ▼▼▼
    const btnWxDep = document.getElementById('wx-btn-dep');
    const btnWxArr = document.getElementById('wx-btn-arr');
    const btnWxOth = document.getElementById('wx-btn-others');
    
    if(btnWxDep && btnWxArr && btnWxOth) {
        btnWxDep.classList.toggle('active', wxMode === 'dep');
        btnWxArr.classList.toggle('active', wxMode === 'arr');
        btnWxOth.classList.toggle('active', wxMode === 'others');
    }

    // render() 関数内に追加
    // Check Leg Status
    const overlay = document.getElementById('leg-comp-overlay');
    if (overlay) {
        if (l.status === 'COMPLETED') {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
    saveData();
}


// Logic Helpers
function setLeg(i) { state.idx = i; render(); }
function setTxt(id,v) { const el=document.getElementById(id); if(el) el.innerText = v; }

function toggleTimeMode(m) { state.timeMode = m; render(); }

// HHMM文字列を「分」に変換
function toMin(t) {
    if(!t || t.length<4) return 0;
    return parseInt(t.substring(0,2))*60 + parseInt(t.substring(2,4));
}

function fmt(t, isPointInTime) {
    if(!t || t.length < 4) return ""; // 空文字を返してrender側でプレースホルダーを表示させる
    let displayTime = t;
    if(state.timeMode === 'INT' && isPointInTime) {
        let h = parseInt(t.substring(0,2));
        let m = t.substring(2,4);
        h = h - 9;
        if(h < 0) h += 24; 
        displayTime = String(h).padStart(2,'0') + m;
    }
    return displayTime.substring(0,2) + ":" + displayTime.substring(2,4);
}

// TTOT = STA - (FLT TIME + TAXI TIME)
function calcTTOT(l) {
    if(!l.sta || !l.timeEnroute || !l.taxi) return "--:--";
    
    const staMin = toMin(l.sta);
    const fltMin = toMin(l.timeEnroute);
    const taxiMin = parseInt(l.taxi);
    
    let ttotMin = staMin - (fltMin + taxiMin);
    if (ttotMin < 0) ttotMin += 1440;
    
    const h = Math.floor(ttotMin / 60);
    const m = ttotMin % 60;
    const ttotStr = String(h).padStart(2,'0') + String(m).padStart(2,'0');
    
    return fmt(ttotStr, true);
}

// INTERVAL = Next Leg STD - Current Leg STA
function calcInterval() {
    if(state.idx >= state.legs.length - 1) return "--+--";
    
    const cur = state.legs[state.idx];
    const next = state.legs[state.idx+1];
    
    if(!cur.sta || !next.std) return "--+--";
    
    const staMin = toMin(cur.sta);
    const stdMin = toMin(next.std);
    
    let diff = stdMin - staMin;
    if(diff < 0) diff += 1440;
    
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    
    return String(h).padStart(2,'0') + "+" + String(m).padStart(2,'0');
}

function switchTab(t) {
    document.querySelectorAll('.sys-tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    document.getElementById('tab-btn-'+t).classList.add('active');
    document.getElementById('tab-content-'+t).classList.add('active');
}
// WX表示切り替え & データ取得
function switchWxView(mode) {
    wxMode = mode;
    render(); // まず空港コード表示などを更新
    
    // 現在表示されているICAOコードを取得してAPIを叩く
    const target = document.getElementById('wx-target-code').innerText;
    fetchWxData(target);
}

// OTHERS入力時
function inputWxStation() {
    if (wxMode !== 'others') return;
    const input = prompt("Enter ICAO Code (e.g. RJTT):", wxOthersCode);
    if (input && input.length === 4) {
        wxOthersCode = input.toUpperCase();
        render();
        fetchWxData(wxOthersCode); // 入力確定後に即取得
    } else if (input) {
        alert("Please enter a 4-letter ICAO code.");
    }
}

// === NUMPAD & FLIGHT DB LOGIC ===

function openNumpad(k) { 
    state.editKey=k; 
    state.tmpVal=""; 
    let label = k.toUpperCase();
    if(k === 'flt') label = "FLT NO";
    if(k === 'timeEnroute') label = "FLT TIME";
    
    document.getElementById('np-label').innerText=label; 
    document.getElementById('np-val').innerText=""; 
    openModal('numpad'); 
}

function openKeyboard(k) {
    const currentVal = state.legs[state.idx][k];
    const input = prompt(`ENTER ${k.toUpperCase()} CODE:`, currentVal);
    if (input !== null) {
        state.legs[state.idx][k] = input.toUpperCase();
        render();
    }
}

function npInput(n) { if(state.tmpVal.length<5) state.tmpVal+=n; document.getElementById('np-val').innerText=state.tmpVal; }
function npBack() { state.tmpVal=state.tmpVal.slice(0,-1); document.getElementById('np-val').innerText=state.tmpVal; }

function npConfirm() {
    const l = state.legs[state.idx];
    const k = state.editKey;
    const v = state.tmpVal;
    
    // PAX
    if(k==='paxTotal') l.paxTotal = v;
    else if(k==='paxInf') l.paxInf = v;
    
    // FLT & DB
    else if(k==='flt' || k==='fltNo') {
        l.flt = v; 
        updateFlightFromDB(v);
    }
    
    // TIME FORMAT (0-padding)
    else if(k==='std' || k==='sta' || k==='timeEnroute') {
        l[k] = v.padStart(4, '0');
    }
    
    // OTHERS
    else {
        l[k] = v;
    }
    
    closeModal('numpad');
    render();
}

function updateFlightFromDB(fltNum) {
    if (typeof FLIGHT_DB === 'undefined') {
        console.warn("FLIGHT_DB not loaded");
        return;
    }

    const data = FLIGHT_DB[fltNum];
    const l = state.legs[state.idx];

    if (data) {
        const stdStr = String(data.stdH || "00") + String(data.stdM || "00");
        const staStr = String(data.staH || "00") + String(data.staM || "00");
        const ftStr  = String(data.ftH  || "00") + String(data.ftM  || "00");

        l.dep = data.dep || "---";
        l.arr = data.arr || "---";
        l.std = stdStr;
        l.sta = staStr;
        l.timeEnroute = ftStr;
    } else {
        // DBに見つからない場合はデータをクリアして "----" 表示に戻す
        l.dep = ""; 
        l.arr = "";
        l.std = ""; 
        l.sta = ""; 
        l.timeEnroute = "";
        // alert(`Flight ${fltNum} not found.`); // 必要であればコメントアウトを外す
    }
}

// === TURB LOGIC ===
function initTurb() {
    let h = "";
    for(let i=41; i>=0; i--) {
        const flNum = "FL" + String(i).padStart(2,'0') + "0";
        h += `<div class="fl-opt" onclick="selFL(this)">${flNum}</div>`;
    }
    const elFrom = document.getElementById('turb-fl-from');
    const elTo = document.getElementById('turb-fl-to');
    if(elFrom && elTo) { elFrom.innerHTML = h; elTo.innerHTML = h; }
}

function selFL(el) {
    const siblings = el.parentElement.children;
    for (let sibling of siblings) sibling.classList.remove('selected');
    el.classList.add('selected');
}

function setTurbCause(c) { 
    state.turbCause=c; 
    document.querySelectorAll('.c-btn').forEach(b=>b.classList.toggle('active', b.innerText===c)); 
    saveData();
}

function setTurbFreq(f) {
    state.turbFreq=f;
    document.querySelectorAll('.i-btn.freq').forEach(b=>b.classList.toggle('active', b.innerText===f));
    saveData();
}

function addTurbLog(int) {
    const fromEl = document.querySelector('#turb-fl-from .fl-opt.selected');
    const toEl = document.querySelector('#turb-fl-to .fl-opt.selected');
    
    const flFrom = fromEl ? fromEl.innerText : "---";
    const flTo = toEl ? toEl.innerText : "---";
    let flStr = flFrom;
    if (flFrom !== "---" && flTo !== "---" && flFrom !== flTo) {
        flStr = `${flFrom}-${flTo.replace("FL", "")}`;
    }

    const cause = state.turbCause || "-";
    const freq = state.turbFreq || "-";
    const d=new Date(); 
    const t=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    
    state.legs[state.idx].turbLogs.unshift({
        fl: flStr, cause: cause, freq: freq, int: int, time: t
    }); 
    render();
}

function closeModal(id) { document.getElementById('modal-'+id).classList.remove('active'); }
function modSp(c,d) { const l=state.legs[state.idx]; if(!l.sp[c]) l.sp[c]=0; l.sp[c]+=d; if(l.sp[c]<0) l.sp[c]=0; openModal('sp'); render(); }

// === CROSSOVER CALCULATOR ===
function initCross() { calcCross(); }

function adjMach(delta) {
    crossMach = parseFloat((crossMach + delta).toFixed(2));
    if(crossMach < 0.60) crossMach = 0.60;
    if(crossMach > 0.85) crossMach = 0.85;
    const el = document.getElementById('in-mach');
    if(el) el.value = crossMach.toFixed(2);
    calcCross();
}

function adjIas(delta) {
    crossIas += delta;
    if(crossIas < 200) crossIas = 200;
    if(crossIas > 340) crossIas = 340;
    const el = document.getElementById('in-ias');
    if(el) el.value = crossIas;
    calcCross();
}

function calcCross() {
    const a0 = 661.47; 
    const termCAS = Math.pow(1 + 0.2 * Math.pow(crossIas / a0, 2), 3.5) - 1;
    const termMach = Math.pow(1 + 0.2 * Math.pow(crossMach, 2), 3.5) - 1;
    if(termMach === 0) return;

    const delta = termCAS / termMach;
    const altFt = 145442 * (1 - Math.pow(delta, 0.190263));
    const fl = Math.round(altFt / 100);

    const elFl = document.getElementById('res-fl');
    const elVis = document.getElementById('visual-fl');
    if(elFl) elFl.innerText = fl;
    if(elVis) elVis.innerText = `FL ${fl}`;

    const btnLabel = document.getElementById('cross-label');
    const btnVal = document.getElementById('cross-val');
    if (btnLabel && btnVal) {
        btnLabel.innerText = "X-OVER"; 
        btnLabel.style.display = "block";
        btnLabel.style.fontSize = "0.75rem"; 
        btnLabel.style.color = "var(--muted)"; 
        btnVal.innerText = `FL ${fl}`;
        btnVal.style.display = "block";
        btnVal.style.fontSize = "1.8rem";    
        btnVal.style.marginTop = "0px";      
        btnVal.style.lineHeight = "1.1";
    }
}

// OTHERSモードの時だけ空港コードを入力する関数
function inputWxStation() {
    // DEP/ARRモードの時は自動取得なので変更させない
    if (wxMode !== 'others') return;

    const input = prompt("Enter ICAO Code (e.g. RJTT):", wxOthersCode);
    if (input && input.length === 4) {
        wxOthersCode = input.toUpperCase();
        render(); // 再描画して反映
    } else if (input) {
        alert("Please enter a 4-letter ICAO code.");
    }
}

// === WX API FETCH LOGIC (CheckWX Version) ===

async function fetchWxData(icao) {
    if (!icao || icao === "----") return;

    // UIを読み込み中に更新
    setTxt('wx-content-metar', "LOADING (CheckWX)...");
    setTxt('wx-content-taf', "LOADING (CheckWX)...");

    // CheckWX用のヘッダー準備
    const headers = { "X-API-Key": WX_API_KEY };

    try {
        // --- METAR ---
        const metarUrl = `https://api.checkwx.com/metar/${icao}/decoded`;
        const resMetar = await fetch(metarUrl, { headers: headers });
        
        if (!resMetar.ok) throw new Error(`METAR Error: ${resMetar.status}`);
        
        const jsonMetar = await resMetar.json();
        
        if (jsonMetar && jsonMetar.data && jsonMetar.data.length > 0) {
            // CheckWXは decoded データも持っていますが、ここでは原文(raw_text)を表示
            // データ構造: jsonMetar.data[0].raw_text
            // ※ decoded版を使いたい場合は jsonMetar.data[0] の中身を整形する必要があります
            const metarData = jsonMetar.data[0];
            setTxt('wx-content-metar', metarData.raw_text || metarData);
        } else {
            setTxt('wx-content-metar', "NO DATA (CheckWX)");
        }

        // --- TAF ---
        const tafUrl = `https://api.checkwx.com/taf/${icao}/decoded`;
        const resTaf = await fetch(tafUrl, { headers: headers });
        
        if (!resTaf.ok) {
            console.warn(`TAF Error: ${resTaf.status}`);
            setTxt('wx-content-taf', "TAF FETCH ERROR");
        } else {
            const jsonTaf = await resTaf.json();
            if (jsonTaf && jsonTaf.data && jsonTaf.data.length > 0) {
                const tafData = jsonTaf.data[0];
                setTxt('wx-content-taf', tafData.raw_text || tafData);
            } else {
                setTxt('wx-content-taf', "NO DATA (CheckWX)");
            }
        }

    } catch (error) {
        console.error("WX Fetch Error:", error);
        
        let msg = "NETWORK ERROR";
        if (error.message.includes("Failed to fetch")) {
            msg = "CORS/KEY ERROR";
        }
        
        setTxt('wx-content-metar', msg);
        setTxt('wx-content-taf', "Check Console (F12)");
    }
}

// リフレッシュボタン用
function refreshWx() {
    const target = document.getElementById('wx-target-code').innerText;
    fetchWxData(target);
}

/* ============================================================
   MODULE: WIND CALCULATOR (With DEP/ARR Loading)
   ============================================================ */

// 滑走路データベース (ユーザー提供データ)
const RUNWAY_DB = {
    "HND": { "34R": 337, "16L": 157, "34L": 337, "16R": 157, "05": 51, "23": 231, "04": 42, "22": 222 },
    "NRT": { "16R": 157, "34L": 337, "16L": 157, "34R": 337 },
    "ITM": { "14R": 142, "32L": 322, "14L": 142, "32R": 322 },
    "KIX": { "06R": 59,  "24L": 239, "06L": 59,  "24R": 239 },
    "CTS": { "01L": 6,   "19R": 186, "01R": 6,   "19L": 186 },
    "FUK": { "16": 161,  "34": 341 },
    "OKA": { "18L": 182, "36R": 2,   "18R": 182, "36L": 2 },
    "NGO": { "18": 181,  "36": 1 },
    "KOJ": { "16": 158,  "34": 338 },
    "SDJ": { "09": 92,   "27": 272 },
    "HKD": { "12": 117,  "30": 297 },
    "AKJ": { "16": 158,  "34": 338 },
    "KUH": { "17": 169,  "35": 349 },
    "OBO": { "17": 168,  "35": 348 },
    "MMB": { "18": 178,  "36": 358 },
    "OKD": { "14": 137,  "32": 317 },
    "AOJ": { "06": 58,   "24": 238 },
    "MSJ": { "10": 98,   "28": 278 },
    "AXT": { "10": 97,   "28": 277 },
    "HNA": { "02": 18,   "20": 198 },
    "GAJ": { "01": 8,    "19": 188 },
    "KIJ": { "10": 97,   "28": 277 },
    "KMQ": { "06": 59,   "24": 239 },
    "NKM": { "16": 158,  "34": 338 },
    "SHM": { "15": 148,  "33": 328 },
    "TJE": { "01": 8,    "19": 188 },
    "OKJ": { "07": 68,   "25": 248 },
    "HIJ": { "10": 103,  "28": 283 },
    "UBJ": { "07": 69,   "25": 249 },
    "IZO": { "07": 67,   "25": 247 },
    "TKS": { "11": 108,  "29": 288 },
    "TAK": { "08": 78,   "26": 258 },
    "KCZ": { "14": 136,  "32": 316 },
    "MYJ": { "14": 137,  "32": 317 },
    "KKJ": { "18": 178,  "36": 358 },
    "OIT": { "01": 7,    "19": 187 },
    "NGS": { "14": 137,  "32": 317 },
    "KMJ": { "07": 68,   "25": 248 },
    "KMI": { "09": 91,   "27": 271 },
    "TNE": { "13": 128,  "31": 308 },
    "YAK": { "14": 138,  "32": 318 },
    "KJP": { "07": 67,   "25": 247 },
    "ASJ": { "03": 29,   "21": 209 },
    "TKN": { "01": 7,    "19": 187 },
    "OKE": { "04": 38,   "22": 218 },
    "YOR": { "04": 38,   "22": 218 },
    "UEO": { "03": 28,   "21": 208 },
    "MMY": { "04": 42,   "22": 222 },
    "SHI": { "17": 169,  "35": 349 },
    "ISG": { "04": 43,   "22": 223 },
    "TRA": { "18": 178,  "36": 358 },
    "YON": { "08": 78,   "26": 258 },
    "KTD": { "03": 25,   "21": 205 },
    "MMD": { "18": 175,  "36": 355 }
};

let windUnit = 'kt';
let userLimits = { hw: 25, tw: 10, xw: 30 };
let currentWindMode = 'takeoff'; // 'takeoff' or 'landing'

// 初期化（window.onloadから呼ばれる）
function initWindCalc() {
    // デフォルトでTAKEOFFモードにする
    setWindMode('takeoff');
    
    // リミット値の初期セット
    const hwLim = document.getElementById('lim-hw');
    const twLim = document.getElementById('lim-tw');
    const xwLim = document.getElementById('lim-xw');
    if(hwLim) hwLim.value = userLimits.hw;
    if(twLim) twLim.value = userLimits.tw;
    if(xwLim) xwLim.value = userLimits.xw;
}

// モード切り替え & 空港データ読み込み
function setWindMode(mode) {
    currentWindMode = mode;
    
    // 1. ボタンの見た目を更新
    const btnTo = document.getElementById('btn-wind-to');
    const btnLdg = document.getElementById('btn-wind-ldg');
    if(btnTo && btnLdg) {
        if(mode === 'takeoff') {
            btnTo.classList.add('active');
            btnLdg.classList.remove('active');
        } else {
            btnTo.classList.remove('active');
            btnLdg.classList.add('active');
        }
    }

    // 2. 現在のLEG情報から空港コードを取得
    const l = state.legs[state.idx];
    let targetApt = (mode === 'takeoff') ? l.dep : l.arr;
    
    // 3. 空港コードを使ってセレクトボックスを更新
    loadRunways(targetApt);
}

// 滑走路セレクトボックスの生成
function loadRunways(aptCode) {
    const rwySelect = document.getElementById('calc-rwy-sel');
    if(!rwySelect) return;

    rwySelect.innerHTML = "";
    
    // DBに該当空港があるかチェック
    if (aptCode && RUNWAY_DB[aptCode]) {
        // 空港の滑走路を追加
        const rwys = RUNWAY_DB[aptCode];
        const grp = document.createElement('optgroup');
        grp.label = aptCode; // グループ名に空港コードを表示
        
        let firstVal = null;
        for (const [rwy, hdg] of Object.entries(rwys)) {
            const opt = document.createElement('option');
            opt.value = hdg; 
            opt.text = `${aptCode} ${rwy}`; // 例: HND 34R
            grp.appendChild(opt);
            if(firstVal === null) firstVal = hdg;
        }
        rwySelect.appendChild(grp);
        
        // 最初の滑走路を選択状態にする
        if(firstVal !== null) {
            rwySelect.value = firstVal;
        }

    } else {
        // DBにない場合
        const grp = document.createElement('optgroup');
        grp.label = aptCode || "UNKNOWN";
        const opt = document.createElement('option');
        opt.disabled = true;
        opt.text = "NO DB DATA";
        grp.appendChild(opt);
    }

    // マニュアル入力用オプションを常に追加
    const manGrp = document.createElement('optgroup');
    manGrp.label = "MANUAL";
    const optMan = document.createElement('option');
    optMan.value = 0; optMan.text = "MANUAL INPUT";
    manGrp.appendChild(optMan);
    rwySelect.appendChild(manGrp);

    // ヘディング入力欄を更新
    updateHdgFromSel();
}

function updateHdgFromSel() {
    const sel = document.getElementById('calc-rwy-sel');
    // マニュアル入力(value=0)以外なら、Heading入力を自動更新
    if (sel.value && sel.value !== "0") {
        document.getElementById('calc-hdg').value = String(sel.value).padStart(3, '0');
    }
    runCalc();
}

// --- 以下、計算ロジック（既存のまま） ---

function formatHdg() {
    const el = document.getElementById('calc-hdg');
    let val = parseInt(el.value);
    if (!isNaN(val)) {
        if(val > 360) val = val % 360; 
        if(val === 0) val = 360; 
        el.value = String(val).padStart(3, '0');
    }
}

function formatDir() {
    const el = document.getElementById('calc-wd');
    let val = parseInt(el.value);
    if (!isNaN(val)) {
        if(val > 360) val = val % 360; 
        if(val <= 0) val = 360; 
        el.value = String(val).padStart(3, '0');
    }
}

function setUnit(u) {
    windUnit = u;
    document.getElementById('u-kt').className = (u === 'kt') ? 'active' : '';
    document.getElementById('u-m').className = (u === 'm') ? 'active' : '';
    document.getElementById('calc-ws').placeholder = (u === 'kt') ? 'kt' : 'm/s';
    runCalc();
}

function stepDir(amount) {
    const el = document.getElementById('calc-wd');
    let val = parseInt(el.value);
    if (isNaN(val)) val = 0;
    val += amount;
    if (val <= 0) val += 360;
    if (val > 360) val -= 360;
    el.value = String(val).padStart(3, '0');
    runCalc();
}

function stepHdg(amount) {
    const el = document.getElementById('calc-hdg');
    let val = parseInt(el.value);
    if (isNaN(val)) val = 0; 
    val += amount;
    if (val > 360) val = 1;
    if (val < 1) val = 360;
    el.value = String(val).padStart(3, '0');
    runCalc();
}

function saveLimit(type, val) {
    userLimits[type] = parseInt(val) || 0;
    runCalc();
    saveData();
}

function safeCeil(val) {
    if(val < 0) return 0;
    if (Math.abs(val - Math.round(val)) < 0.0001) return Math.round(val);
    return Math.ceil(val);
}

function runCalc() {
    const rwyHdg = parseInt(document.getElementById('calc-hdg').value);
    const windDir = parseInt(document.getElementById('calc-wd').value);
    let windSpd = parseInt(document.getElementById('calc-ws').value);
    
    const hwEl = document.getElementById('res-hw');
    const xwEl = document.getElementById('res-xw');
    const stEl = document.getElementById('status-display');
    
    const rwySel = document.getElementById('calc-rwy-sel');
    let rwyName = "";
    if (rwySel && rwySel.selectedIndex >= 0) {
        const txt = rwySel.options[rwySel.selectedIndex].text;
        // "HND 34R" -> "34R" を抽出、 "MANUAL INPUT" -> ""
        if(txt !== "MANUAL INPUT" && txt !== "NO DB DATA") {
            rwyName = txt.split(' ').pop();
        }
    }

    if (isNaN(rwyHdg) || isNaN(windDir) || isNaN(windSpd)) {
        if(hwEl) hwEl.innerText = "--"; 
        if(xwEl) xwEl.innerText = "--";
        if(stEl) { stEl.className = "status-neutral"; stEl.innerText = "--"; } // CSSクラス名を修正
        drawVisual(null, null, null, null); 
        renderChart(); 
        return;
    }

    drawVisual(rwyHdg, windDir, windSpd, rwyName);

    if (windUnit === 'm') windSpd = windSpd * 1.94384;
    
    let rad = (windDir - rwyHdg) * (Math.PI / 180);
    let hwRaw = windSpd * Math.cos(rad);
    let xwRaw = windSpd * Math.sin(rad);
    
    if (Math.abs(hwRaw) < 0.01) hwRaw = 0;
    if (Math.abs(xwRaw) < 0.01) xwRaw = 0;

    let hwComp, twComp, xwComp;
    if (hwRaw >= 0) {
        hwComp = safeCeil(hwRaw); 
        twComp = 0;
    } else {
        hwComp = 0;
        twComp = safeCeil(Math.abs(hwRaw));
    }
    xwComp = safeCeil(Math.abs(xwRaw));
    
    let side = "";
    if (xwComp > 0) side = (xwRaw >= 0) ? "(R)" : "(L)";

    let isLimitOver = false;

    if (hwRaw >= 0) {
        hwEl.innerText = `HEAD ${hwComp}`;
        if (hwComp > userLimits.hw) { hwEl.className = "wind-iso-val col-danger"; isLimitOver = true; }
        else { hwEl.className = "wind-iso-val col-safe"; }
    } else {
        hwEl.innerText = `TAIL ${twComp}`;
        if (twComp > userLimits.tw) { hwEl.className = "wind-iso-val col-danger"; isLimitOver = true; }
        else { hwEl.className = (twComp > userLimits.tw * 0.8) ? "wind-iso-val col-warn" : "wind-iso-val col-safe"; }
    }

    if (side) xwEl.innerText = `${xwComp} ${side}`; else xwEl.innerText = `${xwComp}`;
    if (xwComp > userLimits.xw) { xwEl.className = "wind-iso-val col-danger"; isLimitOver = true; }
    else { xwEl.className = (xwComp > userLimits.xw * 0.8) ? "wind-iso-val col-warn" : "wind-iso-val"; }

    if (isLimitOver) {
        stEl.className = "status-danger"; stEl.innerText = "LIMIT OVER";
    } else {
        stEl.className = "status-safe"; stEl.innerText = "WITHIN LIMIT";
    }
    stEl.style.borderRadius = "10px"; stEl.style.padding="10px"; stEl.style.textAlign="center"; stEl.style.fontWeight="900"; // スタイル補強
    
    renderChart();
}

function renderChart() {
    const rwyHdg = parseInt(document.getElementById('calc-hdg').value);
    if(isNaN(rwyHdg)) return;

    let curWindSpd = parseInt(document.getElementById('calc-ws').value) || 0;
    if (windUnit === 'm') curWindSpd *= 1.94384;
    let curWindDir = parseInt(document.getElementById('calc-wd').value);

    const container = document.getElementById('chart-rows');
    container.innerHTML = "";
    
    for (let wd = 10; wd <= 360; wd += 10) {
        let rad = (wd - rwyHdg) * (Math.PI / 180);
        let maxForXW = Math.floor(userLimits.xw / Math.abs(Math.sin(rad)));
        if(Math.abs(Math.sin(rad)) < 0.01) maxForXW = 999;
        if(maxForXW > 999) maxForXW = 999;

        let maxForLong = 999;
        let cosVal = Math.cos(rad);
        let isTail = cosVal < 0; 
        
        if (isTail) {
            maxForLong = Math.floor(userLimits.tw / Math.abs(cosVal));
        } else {
            maxForLong = Math.floor(userLimits.hw / Math.abs(cosVal));
        }
        if(Math.abs(cosVal) < 0.01) maxForLong = 999;

        let finalLim = Math.min(maxForXW, maxForLong);
        
        let dispXW = (maxForXW > 99) ? "---" : maxForXW;
        let dispLong = (maxForLong > 99) ? "---" : maxForLong;
        let dispFin = (finalLim > 99) ? "99+" : finalLim;

        let clsXW = "cell-val";
        let clsLong = "cell-val";
        if (finalLim === maxForXW) clsXW = "col-warn";
        if (finalLim === maxForLong) clsLong = isTail ? "col-danger" : "col-safe";

        let clsFin = "col-warn";
        if(finalLim === maxForLong && isTail) clsFin = "col-danger";

        if (curWindSpd > finalLim) clsFin += " limit-over-text";
        
        let rowCls = "c-row";
        if (!isNaN(curWindDir)) {
            let diff = Math.abs(wd - curWindDir);
            if (diff > 180) diff = 360 - diff;
            if (diff <= 5) rowCls += " current-row"; 
            else if (diff <= 50) rowCls += " range-highlight"; 
        }

        let strWD = String(wd).padStart(3, '0');

        const div = document.createElement('div');
        div.className = rowCls;
        div.innerHTML = `
            <div class="cell-mag">${strWD}°</div>
            <div class="${clsXW}">${dispXW}</div>
            <div class="${clsLong}">${dispLong}</div>
            <div class="${clsFin}" style="font-weight:900;">${dispFin}</div>
        `;
        container.appendChild(div);
    }
    
    if(!isNaN(curWindDir)) {
        setTimeout(() => {
            const el = container.querySelector('.current-row');
            if(el) el.scrollIntoView({behavior: "smooth", block: "center"});
        }, 50);
    }
}

function drawVisual(rwyHdg, windDir, windSpd, rwyName) {
    const canvas = document.getElementById('wind-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width; const h = canvas.height; const cx = w / 2; const cy = h / 2;
    ctx.clearRect(0, 0, w, h);
    
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, w/2 - 10, 0, 2 * Math.PI); ctx.stroke();
    ctx.fillStyle = "#94a3b8"; ctx.font = "700 10px Inter"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("N", cx, 12); ctx.fillText("E", w-12, cy); ctx.fillText("S", cx, h-12); ctx.fillText("W", 12, cy);

    if (rwyHdg === null) return;

    ctx.save(); ctx.translate(cx, cy); ctx.rotate((rwyHdg - 90) * Math.PI / 180);
    ctx.fillStyle = "#64748b"; ctx.fillRect(-45, -6, 90, 12);
    ctx.strokeStyle = "#ffffff"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-35, 0); ctx.lineTo(35, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(45, 0); ctx.lineTo(35, -6); ctx.lineTo(35, 6); ctx.fill();
    
    if (rwyName) {
        ctx.fillStyle = "#ffffff"; ctx.font = "900 11px Inter"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.save(); ctx.translate(-38, 0); ctx.rotate(Math.PI/2); ctx.fillText(rwyName, 0, 0); ctx.restore();
    }
    ctx.restore();

    if(windDir !== null && windSpd !== null) {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate((windDir - 90) * Math.PI / 180);
        let arrowLen = Math.min(windSpd * 1.5, 60); if(arrowLen < 25) arrowLen = 25;
        ctx.strokeStyle = "#06b6d4"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(arrowLen, 0); ctx.lineTo(10, 0); ctx.stroke();
        ctx.fillStyle = "#06b6d4"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, -5); ctx.lineTo(10, 5); ctx.fill();
        ctx.restore();
    }
}

/* ============================================================
   MODULE: LDG PERFORMANCE (Ported Logic)
   ============================================================ */

/* ============================================================
   MODULE: LDG PERFORMANCE (DB UPDATED)
   ============================================================ */

const PERF_AIRPORT_DB = {
    // --- 北海道 ---
    "RJCC": { name: "NEW CHITOSE", elevation: 82, runways: { "01L": {hdg:6,len:3000,lda:3000,slope:0}, "19R": {hdg:186,len:3000,lda:3000,slope:0}, "01R": {hdg:6,len:3000,lda:3000,slope:0}, "19L": {hdg:186,len:3000,lda:3000,slope:0} } },
    "RJCH": { name: "HAKODATE", elevation: 112, runways: { "12": {hdg:117,len:3000,lda:3000,slope:0}, "30": {hdg:297,len:3000,lda:3000,slope:0} } },
    "RJEC": { name: "ASAHIKAWA", elevation: 723, runways: { "16": {hdg:158,len:2500,lda:2500,slope:0}, "34": {hdg:338,len:2500,lda:2500,slope:0} } },
    "RJCM": { name: "MEMANBETSU", elevation: 109, runways: { "18": {hdg:178,len:2500,lda:2500,slope:0}, "36": {hdg:358,len:2500,lda:2500,slope:0} } },
    "RJCB": { name: "OBIHIRO", elevation: 490, runways: { "17": {hdg:168,len:2500,lda:2500,slope:0}, "35": {hdg:348,len:2500,lda:2500,slope:0} } },
    "RJCK": { name: "KUSHIRO", elevation: 311, runways: { "17": {hdg:169,len:2500,lda:2500,slope:0}, "35": {hdg:349,len:2500,lda:2500,slope:0} } },

    // --- 東北 ---
    "RJSA": { name: "AOMORI", elevation: 650, runways: { "06": {hdg:58,len:3000,lda:3000,slope:0}, "24": {hdg:238,len:3000,lda:3000,slope:0} } },
    "RJSM": { name: "MISAWA", elevation: 119, runways: { "10": {hdg:98,len:3050,lda:3050,slope:0}, "28": {hdg:278,len:3050,lda:3050,slope:0} } },
    "RJSS": { name: "SENDAI", elevation: 6, runways: { "09": {hdg:92,len:3000,lda:3000,slope:0}, "27": {hdg:272,len:3000,lda:3000,slope:0} } },
    "RJSK": { name: "AKITA", elevation: 305, runways: { "10": {hdg:97,len:2500,lda:2500,slope:0}, "28": {hdg:277,len:2500,lda:2500,slope:0} } },

    // --- 関東 ---
    "RJAA": { name: "TOKYO NARITA", elevation: 135, runways: { "16R": {hdg:158,len:4000,lda:4000,slope:0}, "34L": {hdg:338,len:4000,lda:4000,slope:0}, "16L": {hdg:158,len:2500,lda:2500,slope:0}, "34R": {hdg:338,len:2500,lda:2500,slope:0} } },
    "RJTT": { name: "TOKYO HANEDA", elevation: 21, runways: { "34L": {hdg:337,len:3360,lda:3360,slope:0}, "34R": {hdg:337,len:3360,lda:3360,slope:0}, "16R": {hdg:157,len:3360,lda:3360,slope:0}, "16L": {hdg:157,len:3360,lda:3360,slope:0}, "22": {hdg:217,len:2500,lda:2500,slope:0}, "04": {hdg:37,len:2500,lda:2500,slope:0}, "23": {hdg:227,len:2500,lda:2500,slope:0}, "05": {hdg:47,len:2500,lda:2500,slope:0} } },

    // --- 中部・北陸・関西 ---
    "RJNK": { name: "KOMATSU", elevation: 37, runways: { "06": {hdg:59,len:2700,lda:2700,slope:0}, "24": {hdg:239,len:2700,lda:2700,slope:0} } },
    "RJGG": { name: "CHUBU CENTRAIR", elevation: 15, runways: { "18": {hdg:181,len:3500,lda:3500,slope:0}, "36": {hdg:1,len:3500,lda:3500,slope:0} } },
    "RJOO": { name: "OSAKA ITAMI", elevation: 41, runways: { "32L": {hdg:322,len:3000,lda:3000,slope:0}, "14R": {hdg:142,len:3000,lda:3000,slope:0}, "32R": {hdg:322,len:1828,lda:1828,slope:0}, "14L": {hdg:142,len:1828,lda:1828,slope:0} } },
    "RJBB": { name: "KANSAI", elevation: 17, runways: { "06R": {hdg:64,len:3500,lda:3500,slope:0}, "24L": {hdg:244,len:3500,lda:3500,slope:0}, "06L": {hdg:64,len:4000,lda:4000,slope:0}, "24R": {hdg:244,len:4000,lda:4000,slope:0} } },
    "RJBE": { name: "KOBE", elevation: 22, runways: { "09": {hdg:91,len:2500,lda:2500,slope:0}, "27": {hdg:271,len:2500,lda:2500,slope:0} } },
    "RJBD": { name: "NANKI SHIRAHAMA", elevation: 292, runways: { "15": {hdg:148,len:2000,lda:2000,slope:0}, "33": {hdg:328,len:2000,lda:2000,slope:0} } },

    // --- 中国 ---
    "RJOB": { name: "OKAYAMA", elevation: 786, runways: { "07": {hdg:68,len:3000,lda:3000,slope:0}, "25": {hdg:248,len:3000,lda:3000,slope:0} } },
    "RJOA": { name: "HIROSHIMA", elevation: 1086, runways: { "10": {hdg:102,len:3000,lda:3000,slope:0.4}, "28": {hdg:282,len:3000,lda:3000,slope:-0.4} } },
    "RJDC": { name: "YAMAGUCHI UBE", elevation: 21, runways: { "07": {hdg:69,len:2500,lda:2500,slope:0}, "25": {hdg:249,len:2500,lda:2500,slope:0} } },
    "RJOC": { name: "IZUMO", elevation: 17, runways: { "07": {hdg:67,len:2000,lda:2000,slope:0}, "25": {hdg:247,len:2000,lda:2000,slope:0} } },

    // --- 四国 ---
    "RJOS": { name: "TOKUSHIMA", elevation: 37, runways: { "11": {hdg:108,len:2500,lda:2500,slope:0}, "29": {hdg:288,len:2500,lda:2500,slope:0} } },
    "RJOK": { name: "KOCHI", elevation: 27, runways: { "14": {hdg:136,len:2500,lda:2500,slope:0}, "32": {hdg:316,len:2500,lda:2360,slope:0} } },
    "RJOT": { name: "TAKAMATSU", elevation: 608, runways: { "08": {hdg:78,len:2500,lda:2500,slope:0}, "26": {hdg:258,len:2500,lda:2500,slope:0} } },
    "RJOM": { name: "MATSUYAMA", elevation: 15, runways: { "14": {hdg:137,len:2500,lda:2500,slope:0}, "32": {hdg:317,len:2500,lda:2500,slope:0} } },

    // --- 九州 ---
    "RJFF": { name: "FUKUOKA", elevation: 30, runways: { "16": {hdg:157,len:2800,lda:2800,slope:0}, "34": {hdg:337,len:2800,lda:2800,slope:0} } },
    "RJFR": { name: "KITAKYUSHU", elevation: 18, runways: { "18": {hdg:178,len:2500,lda:2500,slope:0}, "36": {hdg:358,len:2500,lda:2500,slope:0} } },
    "RJFU": { name: "NAGASAKI", elevation: 4, runways: { "14": {hdg:137,len:3000,lda:3000,slope:0}, "32": {hdg:317,len:3000,lda:3000,slope:0} } },
    "RJFO": { name: "OITA", elevation: 16, runways: { "01": {hdg:7,len:3000,lda:3000,slope:0}, "19": {hdg:187,len:3000,lda:3000,slope:0} } },
    "RJFM": { name: "MIYAZAKI", elevation: 20, runways: { "09": {hdg:91,len:2500,lda:2500,slope:0}, "27": {hdg:271,len:2500,lda:2500,slope:0} } },
    "RJFK": { name: "KAGOSHIMA", elevation: 890, runways: { "34": {hdg:336,len:3000,lda:3000,slope:-0.8}, "16": {hdg:156,len:3000,lda:3000,slope:0.8} } },
    "RJFT": { name: "KUMAMOTO", elevation: 632, runways: { "07": {hdg:65, len:3000, lda:3000, slope:0.4}, "25": {hdg:245, len:3000, lda:3000, slope:-0.4} }},
  
  
    // --- 沖縄・離島 ---
    "RJKA": { name: "AMAMI", elevation: 26, runways: { "03": {hdg:29,len:2000,lda:2000,slope:0}, "21": {hdg:209,len:2000,lda:2000,slope:0} } },
    "ROAH": { name: "NAHA", elevation: 12, runways: { "18L": {hdg:176,len:3000,lda:3000,slope:0}, "36R": {hdg:356,len:3000,lda:3000,slope:0}, "18R": {hdg:176,len:2700,lda:2700,slope:0}, "36L": {hdg:356,len:2700,lda:2700,slope:0} } },
    "ROIG": { name: "NEW ISHIGAKI", elevation: 102, runways: { "04": {hdg:43,len:2000,lda:2000,slope:0}, "22": {hdg:223,len:2000,lda:2000,slope:0} } },
    "ROMY": { name: "MIYAKO", elevation: 142, runways: { "04": {hdg:42,len:2000,lda:2000,slope:0}, "22": {hdg:222,len:2000,lda:2000,slope:0} } }
};

// === VREF TABLE DATA (Based on provided image) ===
// 重量(w)は降順、各FlapごとのVREF速度を定義
const VREF_TABLE = [
    { w: 180, f40: 155, f30: 158 },
    { w: 170, f40: 150, f30: 153 },
    { w: 160, f40: 145, f30: 148 },
    { w: 150, f40: 140, f30: 143 },
    { w: 140, f40: 136, f30: 139 },
    { w: 130, f40: 131, f30: 134 },
    { w: 120, f40: 125, f30: 128 },
    { w: 110, f40: 119, f30: 123 },
    { w: 100, f40: 113, f30: 117 },
    { w: 90,  f40: 107, f30: 111 }
];

// VREF計算関数（線形補間ロジック）
function getVrefFromTable(weight, flap) {
    // 範囲外のクランプ処理（データ範囲外は上限/下限値を使う）
    if (weight >= 180) {
        const d = VREF_TABLE[0];
        return (flap === 40) ? d.f40 : d.f30;
    }
    if (weight <= 90) {
        const d = VREF_TABLE[VREF_TABLE.length - 1];
        return (flap === 40) ? d.f40 : d.f30;
    }

    // 補間計算
    for (let i = 0; i < VREF_TABLE.length - 1; i++) {
        const upper = VREF_TABLE[i];     // 上側のデータ (例: 140)
        const lower = VREF_TABLE[i + 1]; // 下側のデータ (例: 130)

        // 重量がこの区間にあれば補間する
        if (weight <= upper.w && weight >= lower.w) {
            const ratio = (weight - lower.w) / (upper.w - lower.w);
            
            const upVal = (flap === 40) ? upper.f40 : upper.f30;
            const lowVal = (flap === 40) ? lower.f40 : lower.f30;

            return lowVal + (upVal - lowVal) * ratio;
        }
    }
    return 0; // Fallback
}


const QRH_DATA = {
    6: { 30: { 4: { b:4740, w:32, a:140, h:150, t:530, su:0, sd:0, nr:10, sp:210 }, 3: { b:6400, w:45, a:220, h:250, t:890, su:0, sd:0, nr:0, sp:350 }, 2: { b:7960, w:53, a:310, h:360, t:1230, su:-120, sd:90, nr:160, sp:350 }, 1: { b:8720, w:53, a:370, h:410, t:1450, su:-230, sd:210, nr:890, sp:320 } } },
    5: { 30: { 4: { b:5390, w:35, a:180, h:220, t:760, su:-90, sd:100, nr:510, sp:210 }, 3: { b:6410, w:47, a:230, h:250, t:900, su:-10, sd:30, nr:50, sp:350 }, 2: { b:7960, w:53, a:310, h:360, t:1230, su:-120, sd:90, nr:160, sp:350 }, 1: { b:8720, w:53, a:370, h:410, t:1450, su:-230, sd:210, nr:890, sp:320 } } },
    4: { 30: { 4: { b:6110, w:38, a:230, h:280, t:990, su:-150, sd:180, nr:950, sp:240 }, 3: { b:6750, w:47, a:260, h:300, t:1080, su:-80, sd:130, nr:650, sp:340 }, 2: { b:8050, w:53, a:320, h:370, t:1310, su:-160, sd:160, nr:410, sp:340 }, 1: { b:8740, w:53, a:370, h:420, t:1480, su:-250, sd:250, nr:980, sp:320 } } },
    3: { 30: { 4: { b:6820, w:40, a:280, h:330, t:1220, su:-210, sd:260, nr:1400, sp:260 }, 3: { b:7080, w:47, a:290, h:350, t:1250, su:-150, sd:230, nr:1250, sp:330 }, 2: { b:8140, w:53, a:330, h:390, t:1390, su:-200, sd:220, nr:670, sp:330 }, 1: { b:8760, w:53, a:380, h:430, t:1510, su:-260, sd:300, nr:1080, sp:320 } } },
    2: { 30: { 4: { b:7700, w:45, a:330, h:420, t:1580, su:-330, sd:490, nr:2370, sp:280 }, 3: { b:7870, w:49, a:340, h:430, t:1590, su:-290, sd:460, nr:2310, sp:320 }, 2: { b:8630, w:53, a:370, h:450, t:1690, su:-310, sd:440, nr:1790, sp:330 }, 1: { b:9120, w:55, a:410, h:480, t:1780, su:-360, sd:490, nr:2020, sp:320 } } },
    1: { 30: { 4: { b:8590, w:52, a:390, h:510, t:1930, su:-460, sd:710, nr:3340, sp:290 }, 3: { b:8650, w:53, a:400, h:510, t:1930, su:-440, sd:690, nr:3370, sp:310 }, 2: { b:9110, w:55, a:410, h:520, t:1990, su:-430, sd:660, nr:2920, sp:330 }, 1: { b:9470, w:58, a:440, h:540, t:2050, su:-460, sd:680, nr:2960, sp:310 } } }
};

let perfCC = 6, perfFlap = 30, perfBrake = 3, perfAdd = 5;
let perfWind = 0, perfXWind = 0, perfRev = false;
let perfRwyLenM = 3000, perfElev = 0, perfSlope = 0;
const XW_LIMITS = [10, 15, 20, 20, 25, 33];

// モーダルが開かれた時に呼ばれる（必要なら openModal('perf') で呼び出し）
function initPerf() {
    loadPerfAirport();
}

// 既存のLeg情報(ARR)から空港を読み込む
function loadPerfAirport() {
    // 既存のstateからARR空港を取得
    const arrCode = state.legs[state.idx].arr || "RJTT";
    // 3文字コード(HND)なら変換
    const icao = toICAO(arrCode);
    
    const db = PERF_AIRPORT_DB[icao];
    const container = document.getElementById('perf-rwy-btn-container');
    if(!container) return; // ガード

    container.innerHTML = "";
    
    if(db) {
        perfElev = db.elevation;
        document.getElementById('perf-apt-name-disp').innerText = db.name;
        
        let first = true;
        for (const [id, data] of Object.entries(db.runways)) {
            const btn = document.createElement('button');
            btn.className = 'perf-iso-select-btn perf-rwy-btn';
            btn.innerText = id;
            btn.onclick = () => perfSelectRunway(btn, id, data.hdg, data.len, data.lda, data.slope);
            container.appendChild(btn);
            
            if(first) {
                // 自動で最初の滑走路を選択
                perfSelectRunway(btn, id, data.hdg, data.len, data.lda, data.slope);
                first = false;
            }
        }
    } else {
        container.innerHTML = "<span>No Data</span>";
    }
}

function perfSelectRunway(el, id, hdg, len, lda, slope) {
    document.querySelectorAll('.perf-rwy-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    perfRwyLenM = lda || len;
    perfSlope = slope;
    document.getElementById('perf-rwy-data-disp').innerText = `${perfRwyLenM}m`;
    
    // 風の計算（簡易的に0固定、必要ならWIND CALCの値を参照させることも可）
    // ここでは初期値0
    const wdir = 0; 
    const wspd = 0;
    const rad = (wdir - hdg) * (Math.PI/180);
    perfXWind = Math.abs(Math.round(wspd * Math.sin(rad)));
    document.getElementById('perf-out-xwind').innerText = `${perfXWind} KT`;
    perfUpdateXWindWarn();
    perfCalc();
}

function perfSelectCC(v) {
    document.querySelectorAll('.perf-iso-cc-btn').forEach(b=>b.classList.remove('active'));
    document.querySelector(`.perf-iso-cc-btn[data-val="${v}"]`).classList.add('active');
    
    document.querySelectorAll('.perf-iso-ref-row').forEach(r=>r.classList.remove('active'));
    document.getElementById(`perf-row-${v}`).classList.add('active');
    
    perfCC=v; perfUpdateXWindWarn(); perfCalc();
}

function perfUpdateXWindWarn() {
    const limit = XW_LIMITS[perfCC - 1];
    const xwEl = document.getElementById('perf-out-xwind');
    if (perfXWind > limit) xwEl.classList.add('xw-warn'); else xwEl.classList.remove('xw-warn');
}

function perfCalc() {
    const ldw = parseFloat(document.getElementById('perf-in-ldw').value) || 130.0;
    // 以前の簡易計算式を削除し、テーブル参照関数を使用
    let vref = getVrefFromTable(ldw, perfFlap);
    
    // Flap 40以外の補正はテーブルに含まれているため、一律-4ktなどの処理は不要
    // 単純に計算されたVREFにADDを足す
    // --- 【修正ここまで】 ---

    // データ参照 (簡易ロジック: CC 6, Flap 30 以外は近似値やフォールバック)
    // ※ QRH_DATAのロジックは既存のままでOKであればそのまま
    const dataSet = (QRH_DATA[perfCC] && QRH_DATA[perfCC][30] && QRH_DATA[perfCC][30][perfBrake]) 
        ? QRH_DATA[perfCC][30][perfBrake] 
        : QRH_DATA[6][30][3];

    let dist = dataSet.b; 
    dist += (ldw - 140.0) * dataSet.w;
    dist += (perfElev / 1000) * dataSet.a;
    
    if (perfWind < 0) dist += (Math.abs(perfWind) / 10) * dataSet.t;
    else dist -= (perfWind / 10) * dataSet.h;
    
    if (perfSlope < 0) dist += (Math.abs(perfSlope)) * dataSet.sd;
    else dist += perfSlope * dataSet.su;
    
    if (!perfRev) dist += dataSet.nr;
    if (perfAdd > 0) dist += (perfAdd / 5) * dataSet.sp;
    
    if(perfFlap === 40) dist -= 180;

    dist = Math.round(dist);
    
    // VAPP表示 (四捨五入して整数表示)
    document.getElementById('perf-out-vapp').innerText = Math.round(vref + perfAdd);
    document.getElementById('perf-out-dist').innerText = dist;
    
    perfUpdateVisuals(dist);

    saveData();
}

function perfUpdateVisuals(dist) {
    const rwyLenFt = perfRwyLenM * 3.28084;
    const stop1500 = dist;
    const stop2000 = dist + 500;
    const stop3000 = dist + 1500;
    const distTo40kt = 2000 + ((dist - 1500) * 0.85);

    document.getElementById('perf-bar-lda-ft').innerText = Math.round(rwyLenFt);
    document.getElementById('perf-bar-lda-m').innerText = perfRwyLenM;
    perfDrawRuler(rwyLenFt);

    perfUpdateScenario('perf-bar-exit', 'perf-u-40', 'perf-r-40', null, 2000, distTo40kt, rwyLenFt, 'exit');
    perfUpdateScenario('perf-bar-norm', 'perf-u-norm', 'perf-r-norm', 'perf-mk-norm', 2000, stop2000, rwyLenFt, 'normal');
    perfUpdateScenario('perf-bar-deep', 'perf-u-deep', 'perf-r-deep', 'perf-mk-deep', 3000, stop3000, rwyLenFt, 'deep');
}

function perfDrawRuler(lenFt) {
    const el = document.getElementById('perf-rwy-ruler');
    el.innerHTML = '';
    const step = 1000;
    for(let i=0; i<=lenFt; i+=step) {
        const pct = (i / lenFt) * 100;
        const tick = document.createElement('div');
        tick.className = 'perf-iso-tick major'; tick.style.left = `${pct}%`;
        el.appendChild(tick);
        
        if (lenFt > 8000 && i % 2000 !== 0 && i !== 0 && i < lenFt-500) continue;
        
        const lbl = document.createElement('div');
        lbl.className = 'perf-iso-tick-label'; lbl.style.left = `${pct}%`;
        lbl.innerText = i; 
        el.appendChild(lbl);
    }
}

function perfUpdateScenario(barId, uId, rId, mkId, startFt, stopFt, totalFt, type) {
    const bar = document.getElementById(barId);
    const uTxt = document.getElementById(uId);
    const rTxt = document.getElementById(rId);
    const used = Math.round(stopFt);
    const rem = Math.round(totalFt - stopFt);
    const startPct = (startFt / totalFt) * 100;
    const lenPct = ((stopFt - startFt) / totalFt) * 100;

    if(mkId) document.getElementById(mkId).style.left = `${startPct}%`;
    else if (type === 'exit') { 
        const mk = document.querySelector('.perf-iso-marker-td-container'); 
        if(mk) mk.style.left = `${startPct}%`; 
    }

    bar.style.left = `${startPct}%`;
    
    // スタイルリセット (backgroundはHTML側で管理してるが念のため)
    let bg = "";
    if(type==='exit') bg = "#06b6d4";
    if(type==='normal') bg = "#22c55e";
    if(type==='deep') bg = "#f97316";

    if (stopFt > totalFt) {
        bar.style.width = `${100 - startPct}%`;
        bar.style.background = "#ef4444"; // Danger
        uTxt.innerText = `${used}`; 
        rTxt.innerText = `${rem}`; 
        rTxt.style.color = '#ef4444';
    } else {
        bar.style.width = `${lenPct}%`;
        bar.style.background = bg;
        uTxt.innerText = `${used}`; 
        rTxt.innerText = `${rem}`;
        rTxt.style.color = (type === 'deep' && rem < 1000) ? '#ef4444' : '#94a3b8';
    }
}

// Helpers
function perfSelectFlap(el, v) { document.querySelectorAll('[onclick*="perfSelectFlap"]').forEach(b=>b.classList.remove('active')); el.classList.add('active'); perfFlap=v; perfCalc(); }
function perfSelectBrake(el, v) { document.querySelectorAll('[onclick*="perfSelectBrake"]').forEach(b=>b.classList.remove('active')); el.classList.add('active'); perfBrake=v; perfCalc(); }
function perfSelectRev(el, v) { document.querySelectorAll('[onclick*="perfSelectRev"]').forEach(b=>b.classList.remove('active')); el.classList.add('active'); perfRev=v; perfCalc(); }
function perfAdjAdd(v) { perfAdd+=v; if(perfAdd<0)perfAdd=0; document.getElementById('perf-add-disp').value=(perfAdd>=0?"+":"")+perfAdd; perfCalc(); }
function perfAdjWind(v) { perfWind+=v; document.getElementById('perf-wind-disp').value=perfWind>=0?`H${perfWind}`:`T${Math.abs(perfWind)}`; perfCalc(); }
function perfAdjLdw(v) { let val=parseFloat(document.getElementById('perf-in-ldw').value)||130; document.getElementById('perf-in-ldw').value=(val+v).toFixed(1); perfCalc(); }

// モーダルを開くときに初期化を実行させるためのフック
// openModal関数の中で呼び出せるようにする（既存のopenModalを修正する必要があるかも）

/* ============================================================
   MODULE: TFC (LOGIC WITH DEDUP & ±60min)
   ============================================================ */

// ヘルパー: ゼロ埋め
const pad = (n) => String(n).padStart(2, '0');

function refreshTfc() {
    try {
        const listArea = document.getElementById('tfc-iso-list-area');
        if (typeof TFC_DB === 'undefined') {
            listArea.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">DATABASE NOT LOADED</div>';
            return;
        }

        const leg = state.legs[state.idx];
        
        // 【重要】データベースのキーに合わせて、3文字（HND等）のまま取得する
        const targetCode = (leg.arr || "").toUpperCase(); 
        
        console.log("TFC Debug - Target Airport:", targetCode, "STA:", leg.sta);

        if (!targetCode || targetCode === "---") {
            listArea.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">ENTER ARR AIRPORT (e.g. AKJ)</div>';
            return;
        }

        const tStr = leg.sta || "";
        if (tStr.length < 4) {
            listArea.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">ENTER STA TIME (e.g. 0730)</div>';
            return;
        }

        const staH = parseInt(tStr.substring(0,2));
        const staM = parseInt(tStr.substring(2,4));
        const targetTimeVal = (staH * 60) + staM;

        document.getElementById('tfc-iso-title').innerText = `TRAFFIC: ${targetCode}`;
        document.getElementById('tfc-target-disp').innerText = `${tStr.substring(0,2)}:${tStr.substring(2,4)} (±60min)`;

        // TFC_DB[targetCode] が存在するか確認
        if (!TFC_DB[targetCode]) {
            console.warn("Airport not found in DB:", targetCode);
            listArea.innerHTML = `<div style="text-align:center; padding:30px; color:#94a3b8;">NO DB DATA FOR ${targetCode}</div>`;
            return;
        }

        const extractNum = (fltStr) => {
            if (!fltStr) return null;
            const s = String(fltStr).replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            const numStr = s.replace(/[^0-9]/g, '');
            return numStr ? parseInt(numStr, 10) : null;
        };
        const myNum = extractNum(leg.flt);

        let flights = [];
        const processDbFlights = (list, type) => {
            if (!list) return;
            list.forEach(f => {
                const dbNum = extractNum(f.n);
                if (myNum !== null && dbNum !== null && myNum === dbNum) return;

                const tVal = (parseInt(f.t.substring(0, 2)) * 60) + parseInt(f.t.substring(2, 4));
                if (tVal >= targetTimeVal - 60 && tVal <= targetTimeVal + 60) {
                    flights.push({ ...f, sortTime: tVal, flightType: type });
                }
            });
        };

        processDbFlights(TFC_DB[targetCode].arr, 'arr');
        processDbFlights(TFC_DB[targetCode].dep, 'dep');

        // --- 修正箇所 1: 自機のデータ定義 ---
        const myFltDisplay = leg.flt ? `YOU JL${leg.flt}` : "YOU";

        flights.push({
            t: tStr,
            n: myFltDisplay, // ここで JL を付与した表示名にする
            m: "B738",
            f: leg.dep || "---",
            sortTime: targetTimeVal,
            flightType: 'self'
        });

        flights.sort((a, b) => a.sortTime - b.sortTime);

        listArea.innerHTML = flights.map(f => {
            let rowClass = '', icon = '', routeInfo = '';
            if (f.flightType === 'self') {
                rowClass = 'self'; 
                icon = '★';
                // --- 修正箇所 2: 自機のルート情報表示 ---
                routeInfo = `<span style="color:#3b82f6; font-weight:900;">STA ${tStr.substring(0,2)}:${tStr.substring(2,4)}</span>`;
            } else if (f.flightType === 'arr') {
                rowClass = 'arr'; icon = '🛬'; routeInfo = `FM ${f.f}`;
            } else if (f.flightType === 'dep') {
                rowClass = 'dep'; icon = '🛫'; routeInfo = `TO ${f.d}`;
            }

            if (f.m && (f.m.includes('78') || f.m.includes('77') || f.m.includes('350'))) {
                rowClass += ' heavy';
            }

            return `
            <div class="tfc-row ${rowClass}">
                <div class="tfc-time">${f.t.substring(0, 2)}:${f.t.substring(2, 4)}</div>
                <div class="tfc-flt"><span class="tfc-icon">${icon}</span>${f.n}</div>
                <div class="tfc-type">${f.m}</div>
                <div class="tfc-from" style="text-align:right;">${routeInfo}</div>
            </div>`;
        }).join('');

    } catch (e) {
        console.error("TFC Error:", e);
        document.getElementById('tfc-iso-list-area').innerHTML = `<div style="text-align:center; padding:20px; color:#ef4444;">SYSTEM ERROR</div>`;
    }
}


/* ============================================================
   MODULE: SPECIAL PAX HANDLING (INTEGRATED v2)
   ============================================================ */

const MASTER_SP_DATA = [
    { code: "WCHC", label: "WCHC", solo: "△", status: "cond", note: "歩行不可/条件付" },
    { code: "WCHS", label: "WCHS", solo: "◯", status: "ok", note: "歩行困難" },
    { code: "WCHR", label: "WCHR", solo: "◯", status: "ok", note: "階段のみ" },
    { code: "STCR", label: "STCR", solo: "×", status: "ng", note: "要付添/B738:Max1" },
    { code: "MEDA", label: "MEDA", solo: "△", status: "cond", note: "条件付可" },
    { code: "DEAF", label: "DEAF", solo: "◯", status: "ok", note: "-" },
    { code: "BLND", label: "BLND", solo: "△", status: "cond", note: "条件付可" },
    { code: "DPNA", label: "DPNA", solo: "△", status: "cond", note: "条件付可" },
    { code: "PRGN", label: "PRGN", solo: "◯", status: "ok", note: "7日以内はDr." },
    { code: "INCP", label: "INCP", solo: "◯", status: "ok", note: "-" },
    { code: "U8",   label: "<8yo", solo: "×", status: "ng", note: "6歳~CVIP条件付可" }
];
function openModal(id) {}
// データの全消去機能（アラート付き）
function clearSpData() {
    // 誤操作防止の確認アラート
    if (!confirm("Clear all Special Pax data for this leg?")) return;
    
    const l = state.legs[state.idx];
    l.sp = {};     // 数値を全てリセット
    l.spMemo = ""; // メモ欄をリセット
    
    // 画面を再描画
    renderSpModalContent(); // モーダル内を更新（数値0へ）
    render();               // メイン画面のバッジを更新
    saveData();
}
// モーダル表示用: 現在のレグのデータを反映
/* --- SPECIAL PAX LOGIC (Integrated) --- */

// MASTER_SP_DATA は既存のものを使用

/* --- SPECIAL PAX LOGIC (Integrated Fix) --- */

// 1. レンダリング関数：既存のID「sp-iso-grid-area」に正しく流し込む
function renderSpModalContent() {
    const l = state.legs[state.idx];
    if (!l.sp) l.sp = {};

    // 左側：ステッパー
    const gridArea = document.getElementById('sp-iso-grid-area');
    if (gridArea) {
        gridArea.innerHTML = MASTER_SP_DATA.map(d => {
            const v = l.sp[d.code] || 0;
            return `
            <div class="sp-iso-item ${v > 0 ? 'has-val' : ''}" id="sp-item-${d.code}">
                <span class="sp-iso-code">${d.label}</span>
                <div class="sp-iso-stepper-group">
                    <div class="sp-iso-btn-wrapper" onclick="modSpIsolated('${d.code}', -1)">−</div>
                    <input type="number" class="sp-iso-input" value="${v}" readonly>
                    <div class="sp-iso-btn-wrapper" onclick="modSpIsolated('${d.code}', 1)">+</div>
                </div>
            </div>`;
        }).join('');
    }

    // 右側：リファレンスリスト
    const refList = document.getElementById('sp-iso-ref-list');
    if (refList) {
        refList.innerHTML = MASTER_SP_DATA.map(d => `
            <div class="sp-iso-ref-row">
                <span class="pos-code">${d.label}</span>
                <span class="pos-solo status-${d.status}">${d.solo}</span>
                <span class="pos-note">${d.note}</span>
            </div>`).join('');
    }

    const memoInput = document.getElementById('sp-iso-memo');
    if (memoInput) memoInput.value = l.spMemo || "";

    checkSpLimits(); // 制限チェック
}

// 2. 数値変更関数：メイン画面のバッジ(badge-sp)も更新するように
function modSpIsolated(code, delta) {
    const l = state.legs[state.idx];
    if (!l.sp) l.sp = {};
    l.sp[code] = Math.max(0, (l.sp[code] || 0) + delta);
    renderSpModalContent();
    
    // メイン画面のバッジを更新
    const spTot = Object.values(l.sp).reduce((a, b) => a + b, 0);
    const badge = document.getElementById('badge-sp');
    if (badge) badge.innerText = spTot;
    
    const btnSp = document.getElementById('btn-sp-pax');
    if (btnSp) btnSp.classList.toggle('has-data', spTot > 0);
    saveData();
}

// 3. openModalの統合（重要：既存の関数を壊さないように）
function openModal(id) {
    const modal = document.getElementById('modal-' + id);
    if (modal) modal.classList.add('active');
    
    // 各モードに応じた初期化
    if (id === 'sp') renderSpModalContent();
    if (id === 'perf') initPerf();
    if (id === 'tfc') refreshTfc();
}

/* --- SPECIAL PAX LIMIT CHECK LOGIC --- */

function checkSpLimits() {
    const l = state.legs[state.idx];
    const getVal = (c) => l.sp[c] || 0;
    
    // 制限ロジック (B737-800)
    const stcrErr = getVal("STCR") > 1; // STCR Max 1
    const wchcErr = getVal("WCHC") > 2; // WCHC Solo Max 2
    const totalWch = getVal("WCHC") + getVal("WCHS") + getVal("WCHR") + getVal("STCR");
    const totalErr = totalWch > 8;      // Total Max 8

    let hasGlobalError = false;

    MASTER_SP_DATA.forEach(d => {
        const el = document.getElementById(`sp-item-${d.code}`); // IDが sp-item-CODE であることを確認
        if (!el) return;

        // 一旦リセット
        el.classList.remove('limit-error');

        // エラー判定
        let isError = false;
        if (d.code === "STCR" && stcrErr) isError = true;
        if (d.code === "WCHC" && wchcErr) isError = true;
        if (["WCHC", "WCHS", "WCHR", "STCR"].includes(d.code) && totalErr) isError = true;

        if (isError) {
            el.classList.add('limit-error');
            hasGlobalError = true;
        }
    });

    // メイン画面の「SPECIAL PAX」ボタン（トリガー）も赤く点滅させる
    const btnSp = document.getElementById('btn-sp-pax');
    if (btnSp) {
        btnSp.classList.toggle('limit-error', hasGlobalError);
    }
}


// メモ更新関数
function updateSpMemo(val) {
    state.legs[state.idx].spMemo = val;
    saveData();
}

// 制限チェックロジック（修正版：エラー時は琥珀色クラスを削除）
function checkSpLimits() {
    const l = state.legs[state.idx];
    const sp = l.sp || {};
    const getVal = (c) => parseInt(sp[c]) || 0;

    // 1. 各種制限の判定
    const stcrErr = getVal("STCR") > 1; // STCRは最大1名
    const wchcErr = getVal("WCHC") > 2; // WCHC単独は最大2名
    const totalWch = getVal("WCHC") + getVal("WCHS") + getVal("WCHR") + getVal("STCR");
    const totalErr = totalWch > 8;      // 合計最大8名

    let hasGlobalError = false;

    // 2. DOM要素への反映
    MASTER_SP_DATA.forEach(d => {
        const el = document.getElementById(`sp-item-${d.code}`);
        if (!el) return;

        // まずエラー状態をリセット
        el.classList.remove('limit-error');
        
        // ★重要：レンダリング時に付与された 'has-val'（琥珀色）を
        // ここでは一旦そのままにしますが、エラー判定なら削除します。

        let isError = false;
        if (d.code === "STCR" && stcrErr) isError = true;
        if (d.code === "WCHC" && wchcErr) isError = true;
        if (["WCHC", "WCHS", "WCHR", "STCR"].includes(d.code) && totalErr) isError = true;

        if (isError) {
            // エラー確定時：赤色パルスを追加し、琥珀色クラスを「消去」
            el.classList.add('limit-error');
            el.classList.remove('has-val'); 
            hasGlobalError = true;
        }
    });

    // 3. メイン画面のボタン（トリガー）への反映
    const btnSp = document.getElementById('btn-sp-pax');
    if (btnSp) {
        // メインボタンも同様に、エラー時は琥珀色クラス(has-data)を消して赤くする
        if (hasGlobalError) {
            btnSp.classList.add('limit-error');
            btnSp.classList.remove('has-data');
        } else {
            btnSp.classList.remove('limit-error');
            // エラーがない場合、データがあれば琥珀色を戻す必要があるが、
            // modSpIsolated関数内で計算されているため、ここでは何もしなくてOK
            // (ただし、念のため整合性をとるなら以下)
            const spTot = Object.values(l.sp).reduce((a, b) => a + b, 0);
            btnSp.classList.toggle('has-data', spTot > 0);
        }
    }
}

/* ============================================================
   MODAL CONTROLLER (UNIVERSAL)
   すべてのモーダル制御をこの関数に統合します
   ============================================================ */

function openModal(id) {
    // 1. モーダルを表示
    const el = document.getElementById('modal-' + id);
    if (el) {
        el.classList.add('active');
    } else {
        console.warn('Modal element not found: modal-' + id);
        return;
    }

    // 2. IDに応じた初期化処理を実行
    switch (id) {
        case 'sp':
            // Special Pax: 最新データを表示
            if (typeof renderSpModalContent === 'function') {
                renderSpModalContent();
            }
            break;

        case 'load':
            initLoadModal();
            break;


        case 'perf':
            // Landing Perf: 空港データをロード
            if (typeof initPerf === 'function') {
                initPerf();
            }
            break;

        case 'tfc':
            // Traffic: 最新情報を取得
            if (typeof refreshTfc === 'function') {
                refreshTfc();
            }
            break;
        
        // ▼▼▼ これを追加してください ▼▼▼
        case 'wb':
            if (typeof initWb === 'function') initWb();
            break;
        // ▲▲▲ 追加ここまで ▲▲▲

        case 'hold':
            if (typeof initHold === 'function') initHold();
            break;

        case 'converter':
            if (typeof initConverter === 'function') initConverter();
            break;    

        case 'calc-wind':
            // Wind Calc: 必要であればリセット処理などをここに追加
            // (基本はwindow.onloadで初期化済み)
            break;

        case 'cross':
            // Crossover: (基本は初期化済み)
            break;

        case 'scenario':
        initScenario();
        break;

        case 'log':
            initLog();
            break;

    }
}

// 既存の closeModal 関数をこれに置き換え、または修正してください
function closeModal(id) {
    const el = document.getElementById('modal-' + id);
    if (el) el.classList.remove('active');

    // ★追加: LOADモーダルを閉じた時の処理
    if (id === 'load') {
        closeModalLoad(); // アラート判定を実行
    }
}

// チェックリストのトグル機能
function togChk(item) {
    const l = state.legs[state.idx];
    
    // すでにチェック済みなら外す、未チェックなら入れる
    if (l.checks.includes(item)) {
        l.checks = l.checks.filter(i => i !== item);
    } else {
        l.checks.push(item);
    }
    
    render(); // 画面更新
}

/* ============================================================
   MODULE: SPECIAL LOAD & NOTOC LOGIC
   ============================================================ */

// モーダルを開いた時にデータを反映
function initLoadModal() {
    const l = state.legs[state.idx];
    if(!l.load) l.load = { dry:0, dryMode:'DOM', mag:0, magPos:[], ti:0, radioPos:[], beadsFwd:0, beadsAft:0, codes:[] }; // 安全策
    const d = l.load;

    // Inputs
    document.getElementById('in-dry').value = d.dry || "";
    document.getElementById('in-mag').value = d.mag || "";
    document.getElementById('in-radio-ti').value = d.ti || "";
    document.getElementById('in-beads-fwd').value = d.beadsFwd || "";
    document.getElementById('in-beads-aft').value = d.beadsAft || "";

    // Toggles (DRY)
    setLoadDryMode(d.dryMode || 'DOM');

    // Pos Buttons (MAG)
    document.querySelectorAll('#grp-mag-pos .pos-btn').forEach((b, i) => {
        const posName = ['F1','F2','R1','R2'][i];
        b.classList.toggle('active', d.magPos.includes(posName));
    });

    // Pos Buttons (RADIO)
    document.querySelectorAll('#grp-radio-pos .pos-btn').forEach((b, i) => {
        const posName = ['F1','F2','R1','R2'][i];
        b.classList.toggle('active', d.radioPos.includes(posName));
    });

    // List Buttons
    document.querySelectorAll('.list-btn').forEach(b => {
        // コード取得（HTML構造依存）
        const code = b.querySelector('.code-box').innerText;
        b.classList.toggle('active', d.codes.includes(code));
    });

    validateLoad();
}

function setLoadDryMode(mode) {
    const l = state.legs[state.idx];
    l.load.dryMode = mode;
    document.getElementById('btn-dry-dom').className = `toggle-btn ${mode==='DOM'?'active':''}`;
    document.getElementById('btn-dry-int').className = `toggle-btn ${mode==='INT'?'active':''}`;
    validateLoad();
}

function toggleLoadPos(el) {
    el.classList.toggle('active');
    saveLoadDataFromUI();
    validateLoad();
}

function toggleLoadList(el, code) {
    el.classList.toggle('active');
    saveLoadDataFromUI();
    validateLoad();
}

function saveLoadDataFromUI() {
    const l = state.legs[state.idx];
    const d = l.load;

    d.dry = parseFloat(document.getElementById('in-dry').value) || 0;
    d.mag = parseFloat(document.getElementById('in-mag').value) || 0;
    d.ti = parseFloat(document.getElementById('in-radio-ti').value) || 0;
    d.beadsFwd = parseFloat(document.getElementById('in-beads-fwd').value) || 0;
    d.beadsAft = parseFloat(document.getElementById('in-beads-aft').value) || 0;

    // Mag Pos
    d.magPos = [];
    document.querySelectorAll('#grp-mag-pos .pos-btn.active').forEach(b => d.magPos.push(b.innerText));

    // Radio Pos
    d.radioPos = [];
    document.querySelectorAll('#grp-radio-pos .pos-btn.active').forEach(b => d.radioPos.push(b.innerText));

    // Codes
    d.codes = [];
    document.querySelectorAll('.list-btn.active').forEach(b => d.codes.push(b.querySelector('.code-box').innerText));

    saveData();
}

function validateLoad() {
    saveLoadDataFromUI(); // 最新状態を保存
    const l = state.legs[state.idx];
    const d = l.load;

    // DRY CHECK
    const dryLimit = (d.dryMode === 'DOM') ? 262 : 213;
    const dryErr = d.dry > dryLimit;
    updateRowStyle('row-dry', d.dry > 0, dryErr);

    // MAG CHECK
    const magPosErr = d.magPos.length > 0 && d.mag === 0; // 位置指定あるのに重量0など（簡易チェック）
    const magWgtErr = d.mag > 600;
    updateRowStyle('row-mag', d.mag > 0, (magWgtErr));

    // RADIO CHECK
    const hasRadioPos = d.radioPos.length > 0;
    const radioActive = (d.ti > 0 || hasRadioPos);
    const tiErr = d.ti > 50;
    
    const elRadio = document.getElementById('row-radio');
    elRadio.className = 'detail-row';
    if (tiErr) elRadio.classList.add('limit-error');
    else if (radioActive) elRadio.classList.add('radio-active');

    // BEADS CHECK
    const bErr = (d.beadsFwd > 100) || (d.beadsAft > 100);
    const hasBeads = (d.beadsFwd > 0 || d.beadsAft > 0);
    updateRowStyle('row-beads', hasBeads, bErr);

    // Main Button Update Logic Trigger
    updateLoadButtonState();
}

function updateRowStyle(id, hasVal, isErr) {
    const el = document.getElementById(id);
    if(!el) return;
    el.className = 'detail-row';
    if (isErr) el.classList.add('limit-error');
    else if (hasVal) el.classList.add('has-val');
}

// モーダルを閉じたときにアラート状態をセット
function closeModalLoad() { // closeModal('load') から呼ばれる想定
    const l = state.legs[state.idx];
    const d = l.load;
    
    // データがあるか判定
    const isRadio = (d.ti > 0 || d.radioPos.length > 0);
    const hasAnyLoad = (isRadio || d.dry > 0 || d.mag > 0 || d.beadsFwd > 0 || d.beadsAft > 0 || d.codes.length > 0);
    
    // 未確認フラグをセット (前回から変更があった場合などを厳密にやるならdiffが必要だが、ここでは閉じるたびにリセット)
    // 既にAck済みなら再セットしないロジックにするか、毎回確認させるか。
    // 安全のため「データがあれば毎回アラートON」にして、ボタンタップで消す運用にします。
    
    if (isRadio) l.loadAlerts.ca = true;
    if (hasAnyLoad) l.loadAlerts.acars = true;
    
    updateLoadButtonState();
    saveData();
}

// === SPECIAL LOAD CLEAR LOGIC ===
function clearLoadData() {
    // 誤操作防止のアラート
    if (!confirm("Clear all Special Load data?")) return;

    const l = state.legs[state.idx];
    
    // 1. データのリセット
    l.load = { 
        dry: 0, dryMode: 'DOM', 
        mag: 0, magPos: [], 
        ti: 0, radioPos: [], 
        beadsFwd: 0, beadsAft: 0, 
        codes: [] 
    };
    l.loadAlerts = { ca: false, acars: false }; // アラート状態もクリア

    // 2. UI入力欄のクリア
    const inputs = ['in-dry', 'in-mag', 'in-radio-ti', 'in-beads-fwd', 'in-beads-aft'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = "";
    });

    // 3. UIボタン/トグルのリセット
    setLoadDryMode('DOM'); // DRYモードをDOMに戻す
    
    // 位置ボタン(F1, F2...)の選択解除
    document.querySelectorAll('#modal-load .pos-btn').forEach(b => b.classList.remove('active'));
    
    // リストボタン(RFL, AVI...)の選択解除
    document.querySelectorAll('#modal-load .list-btn').forEach(b => b.classList.remove('active'));

    // 4. バリデーションを実行してメイン画面のステータスを更新
    validateLoad();
}

function ackLoadAlert(e, type) {
    e.stopPropagation();
    const l = state.legs[state.idx];
    if(!l.loadAlerts) l.loadAlerts = {};
    
    l.loadAlerts[type] = false;
    updateLoadButtonState();
    saveData();
}

function updateLoadButtonState() {
    const btn = document.getElementById('btn-sp-load');
    if(!btn) return;
    
    const l = state.legs[state.idx];
    if(!l.load) return;
    const d = l.load;
    const al = l.loadAlerts || {ca:false, acars:false};

    // 1. Validate Errors (Limit Exceeded) -> 優先表示
    // (簡易的にDOMの状態を見るか、データを再チェック)
    const dryLimit = (d.dryMode === 'DOM') ? 262 : 213;
    const hasErr = (d.dry > dryLimit) || (d.mag > 600) || (d.ti > 50) || (d.beadsFwd > 100) || (d.beadsAft > 100);
    
    if (hasErr) {
        btn.className = 'trigger-container';
        btn.innerHTML = `<div class="alert-row" style="background:var(--danger); color:white; animation:none; border:none;"><span>🚫 LIMIT EXCEEDED</span></div>`;
        return;
    }

    // 2. Pending Alerts
    let alertHtml = "";
    if (al.ca) {
        alertHtml += `<div class="alert-row" onclick="ackLoadAlert(event, 'ca')"><span>☢️ CA NOTIFY RQRD</span></div>`;
    }
    if (al.acars) {
        alertHtml += `<div class="alert-row" onclick="ackLoadAlert(event, 'acars')"><span>📩 ACARS ACK RQRD</span></div>`;
    }

    if (alertHtml !== "") {
        btn.className = 'trigger-container';
        btn.style.border = "none";
        btn.innerHTML = `<div class="alert-wrapper">${alertHtml}</div>`;
        return;
    }

    // 3. Normal State
    const isRadio = (d.ti > 0 || d.radioPos.length > 0);
    const hasAnyLoad = (isRadio || d.dry > 0 || d.mag > 0 || d.beadsFwd > 0 || d.beadsAft > 0 || d.codes.length > 0);

    let icon = "📦";
    let text = "NO SPECIAL LOAD";
    let statusIcon = "";
    let className = "trigger-container";

    if (isRadio) {
        className += " status-radio";
        icon = "☢️";
        text = "CA NOTIFY (RADIO)";
        statusIcon = "✅";
    } else if (hasAnyLoad) {
        className += " status-data";
        icon = "📦";
        text = "SPECIAL LOAD EXIST";
        statusIcon = "✅";
    }

    btn.className = className;
    btn.style.border = "";
    btn.innerHTML = `
        <div class="trigger-content">
            <div style="display:flex; align-items:center;">
                <span class="trigger-icon">${icon}</span>
                <span class="trigger-text">${text}</span>
            </div>
            <span class="status-icon">${statusIcon}</span>
        </div>`;
}

/* ============================================================
   MODULE: CLOSE LEG & ENDING LOGIC
   ============================================================ */

let closeActionType = "";
let closeCheckState = [];

function openCloseLegModal() {
    // 既に完了している場合は何もしない（あるいはRe-openを促す）
    if(state.legs[state.idx].status === 'COMPLETED') return;
    
    resetCloseModal();
    openModal('action');
}

function resetCloseModal() {
    document.getElementById('cl-step-select').style.display = 'grid';
    document.getElementById('cl-step-list').style.display = 'none';
    document.getElementById('btn-cl-cancel').style.display = 'block';
    closeActionType = "";
}

function selectCloseAction(type) {
    closeActionType = type;
    const items = [...CL_DATA[type]];
    
    // アルコールチェック条件（簡易版：DUTY OFFなら必須とする例）
    if(type === 'DUTY_OFF') {
        items.push("⚠️ ALCOHOL CHECK");
    }

    closeCheckState = new Array(items.length).fill(false);
    
    // UI切り替え
    document.getElementById('cl-step-select').style.display = 'none';
    document.getElementById('cl-step-list').style.display = 'flex';
    document.getElementById('btn-cl-cancel').style.display = 'none';
    
    // リスト生成
    const listArea = document.getElementById('cl-items-area');
    listArea.innerHTML = items.map((txt, i) => {
        const isAlc = txt.includes("ALCOHOL");
        const exClass = isAlc ? " alcohol-alert" : "";
        return `
        <div class="cl-item ${exClass}" id="cl-item-${i}" onclick="toggleCloseCheck(${i})">
            <div class="cl-circle"></div>
            <div class="cl-text">${txt}</div>
        </div>`;
    }).join('');
    
    validateCloseCheck();
}

function toggleCloseCheck(i) {
    closeCheckState[i] = !closeCheckState[i];
    const el = document.getElementById(`cl-item-${i}`);
    if(closeCheckState[i]) el.classList.add('checked');
    else el.classList.remove('checked');
    
    validateCloseCheck();
}

function validateCloseCheck() {
    const allChecked = closeCheckState.every(Boolean);
    const btn = document.getElementById('btn-cl-confirm');
    
    if(allChecked) {
        btn.classList.add('ready');
        btn.innerText = (closeActionType === 'DUTY_OFF') ? "COMPLETE DUTY" : "COMPLETE LEG";
    } else {
        btn.classList.remove('ready');
        btn.innerText = "CHECKLIST INCOMPLETE";
    }
}

function confirmCloseLeg() {
    closeModal('action');
    
    // ステータス更新
    state.legs[state.idx].status = 'COMPLETED';
    
    if(closeActionType === 'DUTY_OFF') {
        // エンディング演出
        render(); // オーバーレイ表示
        setTimeout(() => {
            const endScreen = document.getElementById('ending-screen');
            if(endScreen) endScreen.classList.add('visible');
        }, 500);
    } else {
        // 次のレグへ
        // もし次のレグがまだ配列の範囲内なら移動
        if(state.idx < state.legs.length - 1) {
            setTimeout(() => {
                setLeg(state.idx + 1);
            }, 500);
        } else {
            render(); // 最終レグ完了
        }
    }

    saveData();
}

function reOpenLeg() {
    if(confirm("Re-open this leg for editing?")) {
        state.legs[state.idx].status = 'OPEN';
        render();
    }
}

function resetSystem() {
    const endScreen = document.getElementById('ending-screen');
    if(!endScreen.classList.contains('visible')) return;
    
    if(confirm("Start a new duty? (All data will be reset)")) {
        localStorage.removeItem(STORAGE_KEY); // ★この行を追加（保存データを削除）
        location.reload(); 
    }
}

/* ============================================================
   MODULE: WEIGHT & BALANCE (INTEGRATED)
   ============================================================ */

let wbMode = "DOM"; 
let wbNpKey = "";
let wbNpVal = "";

const WB_LIMITS = {
    DOM: { MTOW: 149.9, MLDW: 144.0, MZFW: 136.0, thrust: "22K" },
    INT: { MTOW: 174.1, MLDW: 146.3, MZFW: 138.3, thrust: "27K" }
};

const WB_THRUST_LINES = {
    DOM: [ { wt: 80800, cg: 26.2 }, { wt: 155500, cg: 34.9 } ], 
    INT: [ { wt: 80800, cg: 25.0 }, { wt: 155500, cg: 34.9 } ] 
};

const WB_CHART_CFG = { minCG: 0, maxCG: 40, minWt: 70000, maxWt: 180000, padding: 30 };

// モーダルを開いた時に呼び出される初期化関数
function initWb() {
    renderWbChart();
}

// 統合版 openModal で呼び出し分岐を追加してください
/* 既存の openModal 関数内の switch 文に以下を追加してください：
   case 'wb':
       initWb();
       break;
*/

function setWbMode(mode) {
    wbMode = mode;
    document.getElementById('btn-dom').className = `mode-btn ${mode==='DOM'?'active':''}`;
    document.getElementById('btn-int').className = `mode-btn ${mode==='INT'?'active':''}`;
    renderWbChart();
}

function renderWbChart() {
    const canvas = document.getElementById('cg-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const limits = WB_LIMITS[wbMode];
    const envelope = getWbEnvelope(wbMode);
    const thrustLine = WB_THRUST_LINES[wbMode];
    
    document.getElementById('thrust-badge').innerText = `THRUST: ${limits.thrust} (${wbMode})`;
    document.getElementById('limit-to').innerText = limits.MTOW.toFixed(1);
    document.getElementById('limit-ldg').innerText = limits.MLDW.toFixed(1);
    document.getElementById('limit-zfw').innerText = limits.MZFW.toFixed(1);

    const rawRamp = parseFloat(document.getElementById('wb-ramp').value) || 0;
    const rawGwTo = parseFloat(document.getElementById('wb-gw').value) || 0;
    const gwTo = rawGwTo * 1000; 
    const cgTo = parseFloat(document.getElementById('wb-cg').value) || 0;
    const rawGwLdg = parseFloat(document.getElementById('wb-gw-ldg').value) || 0;
    const gwLdg = rawGwLdg * 1000; 
    const cgLdg = parseFloat(document.getElementById('wb-cg-ldg').value) || 0;

    ctx.clearRect(0, 0, W, H);
    drawWbGrid(ctx, W, H);
    
    const envColor = "rgba(59, 130, 246, 0.1)";
    const envStroke = "#3b82f6";
    drawWbEnvelope(ctx, W, H, envelope, envColor, envStroke);
    drawWbThrustLine(ctx, W, H, thrustLine, limits.thrust);

    const isToOk = plotWbPoint(ctx, W, H, gwTo, cgTo, "#22c55e", "TO", thrustLine, true, envelope);
    const isLdgOk = plotWbPoint(ctx, W, H, gwLdg, cgLdg, "#f59e0b", "LDG", thrustLine, false, envelope);

    updateWbBars(rawGwTo, rawGwLdg, isToOk, isLdgOk, limits, rawRamp);
}

function getWbEnvelope(mode) {
    if (mode === 'DOM') {
        return [
            { wt: 80800,  fwd: 6.0,  aft: 31.5 },
            { wt: 105000, fwd: 5.6,  aft: 36.0 }, 
            { wt: 138500, fwd: 5.0,  aft: 35.3 }, 
            { wt: 143425, fwd: 6.0,  aft: 35.2 },
            { wt: 149900, fwd: 8.4,  aft: 35.0 } 
        ];
    } else {
        return [
            { wt: 80800,  fwd: 6.0,  aft: 31.5 },
            { wt: 105000, fwd: 5.6,  aft: 36.0 }, 
            { wt: 138500, fwd: 5.0,  aft: 35.3 }, 
            { wt: 143425, fwd: 6.0,  aft: 35.2 }, 
            { wt: 155500, fwd: 8.6,  aft: 34.9 }, 
            { wt: 174100, fwd: 8.6,  aft: 34.9 }  
        ];
    }
}

function updateWbBars(gwTo, gwLdg, isToOk, isLdgOk, limits, rampFuel) {
    updateSingleWbBar('to', gwTo, limits.MTOW, isToOk, rampFuel);
    updateSingleWbBar('ldg', gwLdg, limits.MLDW, isLdgOk, 0);

    const statusBox = document.getElementById('cg-status-box');
    if(isToOk && isLdgOk) {
        statusBox.innerText = "WITHIN LIMITS";
        statusBox.style.borderColor = "var(--success)";
        statusBox.style.color = "var(--success)";
        statusBox.style.background = "rgba(34, 197, 94, 0.1)";
    } else {
        statusBox.innerText = "LIMIT EXCEEDED";
        statusBox.style.borderColor = "var(--danger)";
        statusBox.style.color = "var(--danger)";
        statusBox.style.background = "rgba(239, 68, 68, 0.1)";
    }
}

function updateSingleWbBar(type, actual, limit, isChartOk, rampFuel) {
    const bar = document.getElementById(`bar-${type}`);
    const marginEl = document.getElementById(`margin-${type}`);
    const dispEl = document.getElementById(`disp-gw-${type}`);
    
    if(dispEl) dispEl.innerText = actual.toFixed(1);

    const margin = limit - actual;
    const pct = Math.min((actual / limit) * 100, 100);

    bar.style.width = pct + "%";
    if (margin < 0 || !isChartOk) bar.style.background = "#ef4444";
    else bar.style.background = type==='to' ? "#22c55e" : "#f59e0b";

    const sign = margin >= 0 ? "+" : "";
    marginEl.innerText = `${sign}${margin.toFixed(1)} T`;
    marginEl.style.color = margin >= 0 ? "var(--success)" : "var(--danger)";

    if (type === 'to') {
        const burnAlert = document.getElementById('burn-alert');
        const burnVal = document.getElementById('burn-val');
        const tofVal = document.getElementById('tof-val');
        
        if (margin < 0) {
            const neededBurn = Math.abs(margin); 
            const maxTof = rampFuel - neededBurn; 
            
            burnVal.innerText = `${neededBurn.toFixed(1)} T`;
            tofVal.innerText = `${maxTof.toFixed(1)} T`;
            
            burnAlert.style.display = 'block';
        } else {
            burnAlert.style.display = 'none';
        }
    }
}

function mapWbX(cg, W) { return WB_CHART_CFG.padding + (cg - WB_CHART_CFG.minCG) * ((W - WB_CHART_CFG.padding*2) / (WB_CHART_CFG.maxCG - WB_CHART_CFG.minCG)); }
function mapWbY(wt, H) { return (H - WB_CHART_CFG.padding) - (wt - WB_CHART_CFG.minWt) * ((H - WB_CHART_CFG.padding*2) / (WB_CHART_CFG.maxWt - WB_CHART_CFG.minWt)); }

function drawWbGrid(ctx, W, H) {
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.font = "10px Inter"; ctx.fillStyle = "#94a3b8"; ctx.textAlign = "center";
    for(let c=0; c<=40; c+=5) {
        let x = mapWbX(c, W); ctx.beginPath(); ctx.moveTo(x, WB_CHART_CFG.padding); ctx.lineTo(x, H-WB_CHART_CFG.padding); ctx.stroke();
        ctx.fillText(c+"%", x, H-10);
    }
    ctx.textAlign="right";
    for(let w=70000; w<=180000; w+=20000) {
        let y = mapWbY(w, H); ctx.beginPath(); ctx.moveTo(WB_CHART_CFG.padding, y); ctx.lineTo(W-WB_CHART_CFG.padding, y); ctx.stroke();
        ctx.fillText((w/1000)+"T", WB_CHART_CFG.padding-5, y+3);
    }
}

function drawWbEnvelope(ctx, W, H, pts, fill, stroke) {
    ctx.beginPath(); ctx.strokeStyle=stroke; ctx.lineWidth=2; ctx.fillStyle=fill;
    pts.forEach((p,i)=> { let x=mapWbX(p.fwd,W), y=mapWbY(p.wt,H); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    [...pts].reverse().forEach(p=>{ ctx.lineTo(mapWbX(p.aft,W), mapWbY(p.wt,H)); });
    ctx.closePath(); ctx.fill(); ctx.stroke();
}

function drawWbThrustLine(ctx, W, H, pts, label) {
    ctx.beginPath(); ctx.strokeStyle="#ef4444"; ctx.lineWidth=1; ctx.setLineDash([5,3]);
    pts.forEach((p,i)=>{ let x=mapWbX(p.cg,W), y=mapWbY(p.wt,H); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle="#ef4444"; ctx.textAlign="left";
    ctx.fillText(`THRUST LIM (${label})`, mapWbX(pts[0].cg,W)+5, mapWbY(pts[0].wt,H)-10);
}

function plotWbPoint(ctx, W, H, gw, cg, color, label, thrustPts, isTakeoff, envelope) {
    const x = mapWbX(cg, W), y = mapWbY(gw, H);
    let isOk = true;
    if(!checkWbEnvelope(gw, cg, envelope)) isOk = false;
    if(isTakeoff && isOk) {
        const p1 = thrustPts[0], p2 = thrustPts[1];
        if(gw >= p1.wt && gw <= p2.wt) {
            const r = (gw-p1.wt)/(p2.wt-p1.wt);
            const limCg = p1.cg + (p2.cg-p1.cg)*r;
            if(cg > limCg) isOk = false;
        }
    }
    const finalColor = isOk ? color : "#ef4444";
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fillStyle=finalColor; ctx.fill();
    ctx.strokeStyle="white"; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle=finalColor; ctx.textAlign="left"; ctx.fillText(label, x+8, y+3);
    return isOk;
}

function checkWbEnvelope(gw, cg, pts) {
    if(gw < pts[0].wt || gw > pts[pts.length-1].wt) return false;
    let lf=0, la=0;
    for(let i=0; i<pts.length-1; i++) {
        if(gw>=pts[i].wt && gw<=pts[i+1].wt) {
            const r = (gw-pts[i].wt)/(pts[i+1].wt-pts[i].wt);
            lf = pts[i].fwd + (pts[i+1].fwd-pts[i].fwd)*r;
            la = pts[i].aft + (pts[i+1].aft-pts[i].aft)*r;
            break;
        }
    }
    return (cg >= lf && cg <= la);
}

/* === WB DEDICATED NUMPAD LOGIC (Supports Decimals) === */
function openWbNumpad(k){ 
    wbNpKey = k; 
    wbNpVal = ""; // Reset
    let label = "VALUE";
    if(k.includes('gw')) label = "WEIGHT (T)";
    if(k.includes('cg')) label = "CG (%)";
    if(k.includes('ramp')) label = "RAMP FUEL (T)";
    document.getElementById('wb-np-label').innerText = label;
    document.getElementById('wb-np-val').innerText = wbNpVal;
    
    document.getElementById('modal-wb-numpad').classList.add('active'); 
}
function closeWbNumpad() {
    document.getElementById('modal-wb-numpad').classList.remove('active');
}

function wbNpInput(n){ 
    if(wbNpVal.length < 7) wbNpVal += n; 
    document.getElementById('wb-np-val').innerText = wbNpVal;
}
function wbNpClear(){
    wbNpVal = "";
    document.getElementById('wb-np-val').innerText = wbNpVal;
}
function wbNpBack(){
    wbNpVal = wbNpVal.slice(0, -1);
    document.getElementById('wb-np-val').innerText = wbNpVal;
}
function wbNpConfirm(){ 
    if(wbNpVal!=="") { 
        let floatVal = parseFloat(wbNpVal);
        if (!isNaN(floatVal)) {
             document.getElementById(wbNpKey).value = floatVal.toFixed(1);
             renderWbChart(); 
        }
    }
    closeWbNumpad();
}

/* ============================================================
   MODULE: HOLDING REFERENCE
   ============================================================ */
const HOLD_DATA = {
    station: { v1: "210 KT", v2: "220 KT", v3: "240 KT" },
    dme:     { v1: "200 KT", v2: "230 KT", v3: "265 KT" }
};

function initHold() {
    holdUpdate('station');
}

function holdUpdate(mode) {
    const isDme = (mode === 'dme');
    document.getElementById('tab-hold-st').classList.toggle('active', !isDme);
    document.getElementById('tab-hold-dme').classList.toggle('active', isDme);
    
    const set = HOLD_DATA[mode];
    document.getElementById('hold-v1').innerText = set.v1;
    document.getElementById('hold-v2').innerText = set.v2;
    document.getElementById('hold-v3').innerText = set.v3;
    
    document.getElementById('view-hold-st').style.display = isDme ? 'none' : 'grid';
    const dmeCalc = document.getElementById('view-hold-dme');
    if (isDme) {
        dmeCalc.classList.remove('hidden');
        holdCalcLeg();
    } else {
        dmeCalc.classList.add('hidden');
    }
}

function holdCalcLeg() {
    const inVal = document.getElementById('in-dme').value;
    const outVal = document.getElementById('out-dme').value;
    const resEl = document.getElementById('res-hold-dist');
    
    if (inVal === "" || outVal === "") {
        resEl.innerText = "0.0 NM";
        return;
    }
    const res = Math.abs(parseFloat(inVal) - parseFloat(outVal));
    resEl.innerText = res.toFixed(1) + " NM";
}

function holdResetCalc() {
    document.getElementById('in-dme').value = "";
    document.getElementById('out-dme').value = "";
    document.getElementById('res-hold-dist').innerText = "0.0 NM";
}

/* ============================================================
   MODULE: SPD/MACH CONVERTER (AERODYNAMIC MODEL)
   ============================================================ */

function initConverter() {
    calcConv('mach'); // 初期計算 (M0.74ベースで計算)
}

function adjConvAlt(delta) {
    const el = document.getElementById('conv-alt');
    let val = parseFloat(el.value) || 0;
    val += delta;
    if (val < 0) val = 0;
    if (val > 600) val = 600; // FL600上限
    el.value = val;
    calcConv('maintain');
}

// ▼▼▼ 修正: 入力値(FL)を Feet に変換して計算 ▼▼▼
function calcConv(mode = 'maintain') {
    // 入力値 (FL) を取得
    const flVal = parseFloat(document.getElementById('conv-alt').value) || 0;
    // 計算用高度 (ft) = FL * 100
    const altFt = flVal * 100;

    const inputIas = parseFloat(document.getElementById('conv-ias').value) || 0;
    const inputMach = parseFloat(document.getElementById('conv-mach').value) || 0;

    // --- 1. Atmosphere Model (ISA Standard) ---
    // (中略: 計算ロジック自体は変更なし。altFtを使うためそのままでOK)
    
    // ... 既存の計算ロジック (atmosphere model code) ...
    // Tropopause check (approx 36,089ft)
    let tempK, pressPa;
    const T0 = 288.15; // Sea Level Temp (K)
    const P0 = 1013.25; // Sea Level Press (hPa)
    const L = 0.0019812; // Temp Lapse Rate (K/ft)
    const H_trop = 36089; 

    if (altFt <= H_trop) {
        tempK = T0 - (L * altFt);
        pressPa = P0 * Math.pow((1 - (L * altFt) / T0), 5.25588);
    } else {
        const T_trop = T0 - (L * H_trop); 
        const P_trop = P0 * Math.pow((1 - (L * H_trop) / T0), 5.25588);
        tempK = T_trop;
        const R = 287.05; 
        const g = 9.80665;
        const h_diff_m = (altFt - H_trop) * 0.3048;
        pressPa = P_trop * Math.exp((-g * h_diff_m) / (R * T_trop));
    }
    const a = 38.9678 * Math.sqrt(tempK);

    // --- 2. Calculation Logic ---
    const P = pressPa; 
    const qc0 = 1013.25; 
    const a0 = 661.47; 

    let finalMach = inputMach;
    let finalIas = inputIas;

    if (mode === 'maintain') mode = 'mach';

    if (mode === 'ias') {
        const term1 = 1 + 0.2 * Math.pow(inputIas / a0, 2);
        const qc = P0 * (Math.pow(term1, 3.5) - 1); 
        const term2 = (qc / P) + 1;
        finalMach = Math.sqrt(5 * (Math.pow(term2, 2/7) - 1));
    } else if (mode === 'mach') {
        const term1 = 1 + 0.2 * Math.pow(inputMach, 2);
        const qc = P * (Math.pow(term1, 3.5) - 1);
        const term2 = (qc / P0) + 1;
        finalIas = a0 * Math.sqrt(5 * (Math.pow(term2, 2/7) - 1));
    }

    const tas = finalMach * a;

    // --- 3. Update UI ---
    if (mode === 'ias') {
        document.getElementById('conv-mach').value = finalMach.toFixed(3);
    } else {
        document.getElementById('conv-ias').value = Math.round(finalIas);
    }
    
    document.getElementById('conv-tas').innerText = Math.round(tas);
    document.getElementById('conv-sat').innerText = (tempK - 273.15).toFixed(1);
    document.getElementById('conv-sound').innerText = Math.round(a);
}

// ▼▼▼ 修正: テンキーのタイトルと桁数制限 ▼▼▼

function openConvNumpad(key) {
    convNpKey = key;
    convNpVal = ""; 
    
    let label = "VALUE";
    // ラベル変更
    if (key === 'conv-alt') label = "ALTITUDE (FL)";
    if (key === 'conv-ias') label = "CAS (KT)";
    if (key === 'conv-mach') label = "MACH No.";
    
    document.getElementById('conv-np-label').innerText = label;
    document.getElementById('conv-np-val').innerText = "";
    
    document.getElementById('modal-conv-numpad').classList.add('active');
}

function convNpInput(n) {
    // 文字数制限ロジック変更
    let maxLen = 6;
    if (convNpKey === 'conv-alt') maxLen = 3; // FLは3桁まで

    if (convNpVal.length < maxLen) convNpVal += n;
    document.getElementById('conv-np-val').innerText = convNpVal;
}

/* ============================================================
   MODULE: CONVERTER NUMPAD LOGIC
   ============================================================ */
let convNpKey = "";
let convNpVal = "";

function openConvNumpad(key) {
    convNpKey = key;
    convNpVal = ""; // Reset
    
    // ラベル設定
    let label = "VALUE";
    if (key === 'conv-alt') label = "ALTITUDE (FT)";
    if (key === 'conv-ias') label = "CAS (KT)";
    if (key === 'conv-mach') label = "MACH No.";
    
    document.getElementById('conv-np-label').innerText = label;
    document.getElementById('conv-np-val').innerText = "";
    
    document.getElementById('modal-conv-numpad').classList.add('active');
}

function closeConvNumpad() {
    document.getElementById('modal-conv-numpad').classList.remove('active');
}

function convNpInput(n) {
    // 文字数制限 (Machは小数点含め長くても5文字程度、Altは5桁)
    if (convNpVal.length < 6) convNpVal += n;
    document.getElementById('conv-np-val').innerText = convNpVal;
}

function convNpClear() {
    convNpVal = "";
    document.getElementById('conv-np-val').innerText = "";
}

function convNpBack() {
    convNpVal = convNpVal.slice(0, -1);
    document.getElementById('conv-np-val').innerText = convNpVal;
}

function convNpConfirm() {
    if (convNpVal !== "") {
        const floatVal = parseFloat(convNpVal);
        if (!isNaN(floatVal)) {
            // 値を入力欄にセット
            document.getElementById(convNpKey).value = convNpVal;
            
            // 入力された項目に応じて計算を実行
            if (convNpKey === 'conv-ias') {
                calcConv('ias');
            } else if (convNpKey === 'conv-mach') {
                calcConv('mach');
            } else {
                // Altitude変更時は関係維持で再計算
                calcConv('maintain');
            }
        }
    }
    closeConvNumpad();
}

// === DATA PERSISTENCE (AUTO SAVE/LOAD) ===
const STORAGE_KEY = "copilot_v2_data";

function saveData() {
    const dataToSave = {
        state: state,
        wxOthersCode: wxOthersCode,
        userLimits: userLimits // Wind Calculatorの設定など
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.state) {
                // 既存データとマージして復元
                state = { ...state, ...data.state };
                // 配列破損等のガード（念のため）
                if(!state.legs || state.legs.length === 0) {
                     state.legs = Array.from({length:4},()=>({/*defaults*/})); 
                }
            }
            if (data.wxOthersCode) wxOthersCode = data.wxOthersCode;
            if (data.userLimits) userLimits = data.userLimits;
        } catch (e) {
            console.error("Data Load Error:", e);
        }
    }
}

/* ============================================================
   JSファイル末尾などに以下を全て追記してください
   ============================================================ */

/* === SCENARIO ANALYZER MODULE === */

// B737 Total Fuel Flow Data (Interpolated)
const PERF_DATA = {
  41000: {90:3876, 100:3986, 110:4184, 120:4404, 130:4632, 140:4766, 150:null, 160:null, 170:null, 180:null, 190:null},
  40000: {90:3962, 100:4074, 110:4252, 120:4460, 130:4648, 140:4747, 150:null, 160:null, 170:null, 180:null, 190:null},
  39000: {90:4048, 100:4162, 110:4320, 120:4514, 130:4664, 140:4728, 150:5024, 160:null, 170:null, 180:null, 190:null},
  38000: {90:4222, 100:4336, 110:4494, 120:4684, 130:4790, 140:4896, 150:5164, 160:null, 170:null, 180:null, 190:null},
  37000: {90:4292, 100:4396, 110:4512, 120:4668, 130:4854, 140:5064, 150:5306, 160:5736, 170:null, 180:null, 190:null},
  36000: {90:4492, 100:4594, 110:4708, 120:4860, 130:5044, 140:5252, 150:5480, 160:5852, 170:null, 180:null, 190:null},
  35000: {90:4690, 100:4792, 110:4904, 120:5054, 130:5232, 140:5438, 150:5654, 160:5968, 170:6494, 180:null, 190:null},
  34000: {90:4816, 100:4904, 110:5012, 120:5140, 130:5284, 140:5460, 150:5652, 160:5908, 170:6278, 180:null, 190:null},
  33000: {90:4944, 100:5018, 110:5122, 120:5226, 130:5338, 140:5480, 150:5650, 160:5850, 170:6062, 180:6300, 190:6680},
  32000: {90:4920, 100:4990, 110:5088, 120:5192, 130:5304, 140:5442, 150:5604, 160:5792, 170:6002, 180:6234, 190:6548},
  31000: {90:4896, 100:4962, 110:5052, 120:5160, 130:5272, 140:5404, 150:5556, 160:5732, 170:5942, 180:6168, 190:6416},
  30000: {90:4892, 100:4956, 110:5044, 120:5149, 130:5256, 140:5380, 150:5520, 160:5696, 170:5897, 180:6120, 190:6378},
  29000: {90:4892, 100:4950, 110:5032, 120:5138, 130:5240, 140:5358, 150:5488, 160:5660, 170:5852, 180:6072, 190:6340},
  28000: {90:4890, 100:4944, 110:5025, 120:5131, 130:5240, 140:5364, 150:5500, 160:5664, 170:5848, 180:6056, 190:6310},
  27000: {90:4888, 100:4938, 110:5018, 120:5124, 130:5240, 140:5370, 150:5514, 160:5668, 170:5842, 180:6040, 190:6280},
  26000: {90:4886, 100:4937, 110:5012, 120:5115, 130:5240, 140:5358, 150:5503, 160:5657, 170:5829, 180:6024, 190:6258},
  25000: {90:4884, 100:4936, 110:5006, 120:5106, 130:5222, 140:5346, 150:5492, 160:5646, 170:5816, 180:6008, 190:6236},
  24000: {90:4900, 100:4953, 110:5019, 120:5115, 130:5226, 140:5347, 150:5489, 160:5640, 170:5812, 180:6004, 190:6230},
  23000: {90:4916, 100:4970, 110:5032, 120:5124, 130:5230, 140:5348, 150:5488, 160:5640, 170:5808, 180:6000, 190:6224},
  22000: {90:4952, 100:5006, 110:5067, 120:5156, 130:5256, 140:5368, 150:5500, 160:5650, 170:5812, 180:6002, 190:6223},
  21000: {90:4988, 100:5042, 110:5102, 120:5188, 130:5282, 140:5388, 150:5516, 160:5660, 170:5816, 180:6004, 190:6222},
  20000: {90:5024, 100:5081, 110:5141, 120:5226, 130:5320, 140:5422, 150:5547, 160:5684, 170:5835, 180:6013, 190:6241},
  19000: {90:5060, 100:5118, 110:5180, 120:5266, 130:5356, 140:5458, 150:5576, 160:5712, 170:5854, 180:6022, 190:6224},
  18000: {90:5088, 100:5148, 110:5210, 120:5296, 130:5390, 140:5490, 150:5612, 160:5748, 170:5896, 180:6050, 190:6244},
  17000: {90:5114, 100:5176, 110:5240, 120:5328, 130:5424, 140:5532, 150:5648, 160:5786, 170:5926, 180:6082, 190:6264},
  16000: {90:5136, 100:5202, 110:5262, 120:5348, 130:5446, 140:5556, 150:5672, 160:5814, 170:5960, 180:6116, 190:6304},
  15000: {90:5156, 100:5220, 110:5284, 120:5370, 130:5468, 140:5582, 150:5698, 160:5842, 170:5992, 180:6150, 190:6328},
  14000: {90:5172, 100:5236, 110:5300, 120:5384, 130:5480, 140:5594, 150:5711, 160:5856, 170:6008, 180:6168, 190:6350},
  13000: {90:5190, 100:5252, 110:5316, 120:5400, 130:5494, 140:5606, 150:5724, 160:5868, 170:6022, 180:6188, 190:6372},
  12000: {90:5212, 100:5272, 110:5336, 120:5416, 130:5508, 140:5617, 150:5736, 160:5876, 170:6028, 180:6196, 190:6380},
  11000: {90:5236, 100:5294, 110:5356, 120:5434, 130:5524, 140:5628, 150:5748, 160:5886, 170:6036, 180:6204, 190:6390}
};

let saMode = 'mach'; 
let saNpTargetId = null;
let saNpVal = "";

function initScenario() {
    initFlOptions();
    // デフォルト値の計算
    calcScenario();
}

function initFlOptions() {
    const opts = [];
    for (let fl = 410; fl >= 110; fl -= 10) {
        opts.push(`<option value="${fl}">FL${fl}</option>`);
    }
    const html = opts.join('');
    
    const elBase = document.getElementById('sa-base-fl');
    const elTgt = document.getElementById('sa-tgt-fl');
    
    if(elBase) {
        elBase.innerHTML = html;
        elBase.value = "370"; 
    }
    if(elTgt) {
        elTgt.innerHTML = html;
        elTgt.value = "250"; 
    }
}

function setSaMode(mode, e) {
    if(e) e.stopPropagation();
    saMode = mode;
    document.getElementById('btn-mode-mach').className = `mode-btn ${mode==='mach'?'active':''}`;
    document.getElementById('btn-mode-ias').className = `mode-btn ${mode==='ias'?'active':''}`;
    
    const el = document.getElementById('sa-tgt-val');
    if (mode === 'mach') {
        el.value = "0.78";
    } else {
        el.value = "280";
    }
    calcScenario();
}

function openScenarioSpdNumpad() {
    let label = (saMode === 'mach') ? "SCENARIO MACH" : "SCENARIO IAS (KT)";
    saOpenNumpad('sa-tgt-val', label);
}

function syncWind() {
    const baseW = document.getElementById('sa-base-wind').value;
    const tgtInput = document.getElementById('sa-tgt-wind');
    if (document.activeElement !== tgtInput) {
        tgtInput.value = baseW;
    }
}

function getFuelFlow(fl, weight) {
    const alt = fl * 100;
    const lookupAlt = Math.round(alt / 1000) * 1000;
    const row = PERF_DATA[lookupAlt];
    if (!row) return 5000;

    const wLow = Math.floor(weight / 10) * 10;
    const wHigh = wLow + 10;
    
    const ffLow = row[wLow];
    const ffHigh = row[wHigh];

    if (ffLow === undefined && ffHigh === undefined) return 5000;
    if (ffLow === undefined) return ffHigh;
    if (ffHigh === undefined || ffHigh === null) return ffLow;

    const ratio = (weight - wLow) / 10;
    return ffLow + (ffHigh - ffLow) * ratio;
}

function getIsaData(fl) {
    const altFt = fl * 100;
    let tempK = 0;
    let press = 0;
    // Standard Atmosphere Constants
    const T0 = 288.15; const P0 = 1013.25;

    if (altFt <= 36089) {
        tempK = T0 - 0.0019812 * altFt;
        let tempRatio = tempK / T0;
        press = P0 * Math.pow(tempRatio, 5.25588);
    } else {
        tempK = 216.65;
        let pressTrop = 226.32;
        let heightDiff = altFt - 36089;
        press = pressTrop * Math.exp(-0.00004815 * heightDiff);
    }

    const a = 38.9678 * Math.sqrt(tempK); 
    return { p: press, a: a, t: tempK };
}

function getAeroFromMach(fl, mach) {
    const isa = getIsaData(fl);
    const P0 = 1013.25; const A0 = 661.47;
    const tas = mach * isa.a;
    const term1 = 1 + 0.2 * Math.pow(mach, 2);
    const pTotal = isa.p * Math.pow(term1, 3.5);
    const qc = pTotal - isa.p; 
    const term2 = (qc / P0) + 1;
    const ias = A0 * Math.sqrt(5 * (Math.pow(term2, 2/7) - 1));
    return { tas: tas, ias: ias, mach: mach, tempK: isa.t }; 
}

function getAeroFromIas(fl, ias) {
    const isa = getIsaData(fl);
    const P0 = 1013.25;
    const term1 = 1 + 0.2 * Math.pow(ias / 661.47, 2);
    const qc = P0 * (Math.pow(term1, 3.5) - 1);
    const term2 = (qc / isa.p) + 1;
    const mach = Math.sqrt(5 * (Math.pow(term2, 2/7) - 1));
    const tas = mach * isa.a;
    return { tas: tas, mach: mach, ias: ias, tempK: isa.t }; 
}

function formatMinSec(mins) {
    const m = Math.floor(mins);
    const s = Math.round((mins - m) * 60);
    return String(m).padStart(2,'0') + ":" + String(s).padStart(2,'0');
}

function calcScenario() {
    const dist = parseFloat(document.getElementById('sa-dist').value) || 0;
    const wt = parseFloat(document.getElementById('sa-wt').value) || 120; 

    const baseFL = parseFloat(document.getElementById('sa-base-fl').value) || 370;
    const baseMach = parseFloat(document.getElementById('sa-base-mach').value) || 0.78;
    const baseWind = parseFloat(document.getElementById('sa-base-wind').value) || 0;

    const tgtFL = parseFloat(document.getElementById('sa-tgt-fl').value) || 370;
    const tgtVal = parseFloat(document.getElementById('sa-tgt-val').value) || 0;
    const tgtWind = parseFloat(document.getElementById('sa-tgt-wind').value) || 0;

    // --- PHYSICS CALCULATION ---
    const baseAero = getAeroFromMach(baseFL, baseMach);
    const baseTas = baseAero.tas;
    const baseIas = baseAero.ias;
    const baseTempC = Math.round(baseAero.tempK - 273.15);

    let tgtTas = 0;
    let tgtMach = 0;
    let tgtIas = 0;
    let tgtTempC = 0;

    if (saMode === 'mach') {
        tgtMach = tgtVal;
        const tgtAero = getAeroFromMach(tgtFL, tgtVal);
        tgtTas = tgtAero.tas;
        tgtIas = tgtAero.ias;
        tgtTempC = Math.round(tgtAero.tempK - 273.15);
    } else {
        tgtIas = tgtVal;
        const tgtAero = getAeroFromIas(tgtFL, tgtVal);
        tgtTas = tgtAero.tas;
        tgtMach = tgtAero.mach;
        tgtTempC = Math.round(tgtAero.tempK - 273.15);
    }

    // UPDATE DISPLAY
    document.getElementById('sa-base-tas').innerText = Math.round(baseTas);
    document.getElementById('sa-base-gs').innerText = Math.round(baseTas + baseWind);
    document.getElementById('sa-base-temp').innerText = baseTempC;
    document.getElementById('sa-base-conv').innerText = `IAS: ${Math.round(baseIas)} KT`;

    document.getElementById('sa-tgt-tas').innerText = Math.round(tgtTas);
    document.getElementById('sa-tgt-gs').innerText = Math.round(tgtTas + tgtWind);
    document.getElementById('sa-tgt-temp').innerText = tgtTempC;
    
    const elConv = document.getElementById('sa-tgt-conv');
    if (saMode === 'mach') {
        elConv.innerText = `IAS: ${Math.round(tgtIas)} KT`;
    } else {
        elConv.innerText = `MACH: .${Math.round(tgtMach * 100)}`; 
        if (tgtMach >= 1) elConv.innerText = `MACH: ${tgtMach.toFixed(2)}`;
    }

    // TIME CALCULATION
    const baseGs = baseTas + baseWind;
    const tgtGs = tgtTas + tgtWind;

    let baseTimeH = (baseGs > 0) ? dist / baseGs : 0;
    let tgtTimeH = (tgtGs > 0) ? dist / tgtGs : 0;
    
    const diffMin = (tgtTimeH - baseTimeH) * 60; 

    const elTime = document.getElementById('sa-res-time');
    if (Math.abs(diffMin) < 0.1) {
        elTime.innerText = "00:00";
        elTime.className = "sa-res-val res-neutral";
    } else if (diffMin < 0) {
        elTime.innerText = "-" + formatMinSec(Math.abs(diffMin)); // Negative is Faster
        elTime.className = "sa-res-val res-good";
    } else {
        elTime.innerText = "+" + formatMinSec(Math.abs(diffMin)); // Positive is Slower
        elTime.className = "sa-res-val res-bad";
    }
    
    const tgtH = Math.floor(tgtTimeH);
    const tgtM = Math.round((tgtTimeH - tgtH) * 60);
    document.getElementById('sa-time-sub').innerText = `TOTAL ${String(tgtH).padStart(2,'0')}:${String(tgtM).padStart(2,'0')}`;

    // --- FUEL CALCULATION ---
    let rawBaseFF = getFuelFlow(baseFL, wt);
    let baseRefMach = (baseFL >= 270) ? 0.79 : getAeroFromIas(baseFL, 280).mach;
    let baseSpdDiff = baseMach - baseRefMach;
    let baseFF = rawBaseFF * (1 + (baseSpdDiff / 0.01) * 0.02);

    let rawTgtFF = getFuelFlow(tgtFL, wt);
    let tgtRefMach = 0;
    if (tgtFL >= 270) {
        tgtRefMach = 0.79;
    } else {
        tgtRefMach = getAeroFromIas(tgtFL, 280).mach;
    }
    let tgtSpdDiff = tgtMach - tgtRefMach;
    let tgtFF = rawTgtFF * (1 + (tgtSpdDiff / 0.01) * 0.02);

    let baseBurn = baseFF * baseTimeH;
    let tgtBurn = tgtFF * tgtTimeH;
    
    let diffFuel = tgtBurn - baseBurn; 

    const elFuel = document.getElementById('sa-res-fuel');
    const elFuelPct = document.getElementById('sa-res-fuel-pct');
    
    if (diffFuel > 10) {
        elFuel.innerText = "+" + Math.round(diffFuel) + " LBS";
        elFuel.className = "sa-res-val res-bad";
    } else if (diffFuel < -10) {
        elFuel.innerText = Math.round(diffFuel) + " LBS";
        elFuel.className = "sa-res-val res-good";
    } else {
        elFuel.innerText = "0 LBS";
        elFuel.className = "sa-res-val res-neutral";
    }

    let diffPct = 0;
    if (baseBurn > 0) {
        diffPct = ((tgtBurn - baseBurn) / baseBurn) * 100;
    }
    let signPct = diffPct > 0 ? "+" : "";
    elFuelPct.innerText = `(${signPct}${diffPct.toFixed(1)}%)`;

    // --- JUDGMENT LOGIC (COST/MIN) ---
    const elJudge = document.getElementById('sa-judge-text');
    let costPerMin = 0;
    
    if (Math.abs(diffMin) > 0.1) {
        costPerMin = Math.abs(diffFuel / diffMin);
    }

    if (diffMin <= -0.1) { 
        // FASTER
        if (diffFuel > 0) {
            elJudge.innerText = `⚡ COST: ${Math.round(costPerMin)} LBS/MIN`;
            elJudge.className = "sa-judge res-cost";
        } else {
            elJudge.innerText = "✨ GREAT ADVANTAGE";
            elJudge.className = "sa-judge res-good";
        }
    } else if (diffMin >= 0.1) { 
        // SLOWER
        if (diffFuel < 0) {
            elJudge.innerText = `💰 SAVE: ${Math.round(costPerMin)} LBS/MIN`;
            elJudge.className = "sa-judge res-good";
        } else {
            elJudge.innerText = "👎 DISADVANTAGE";
            elJudge.className = "sa-judge res-bad";
        }
    } else {
        elJudge.innerText = "TIME UNCHANGED";
        elJudge.className = "sa-judge res-neutral";
    }
}

/* --- SCENARIO NUMPAD LOGIC --- */
function saOpenNumpad(id, label) {
    saNpTargetId = id;
    saNpVal = "";
    document.getElementById('sa-np-label').innerText = label;
    document.getElementById('sa-np-val').innerText = "";
    document.getElementById('modal-sa-numpad').classList.add('active');
}
function saCloseNumpad() {
    document.getElementById('modal-sa-numpad').classList.remove('active');
}
function saNpInput(n) {
    if(saNpVal.length < 7) saNpVal += n;
    document.getElementById('sa-np-val').innerText = saNpVal;
}
function saNpBack() {
    saNpVal = saNpVal.slice(0, -1);
    document.getElementById('sa-np-val').innerText = saNpVal;
}
function saNpClear() {
    saNpVal = "";
    document.getElementById('sa-np-val').innerText = "";
}
function saNpConfirm() {
    if(saNpTargetId) {
        const el = document.getElementById(saNpTargetId);
        if(saNpVal !== "") el.value = saNpVal;
        if(saNpTargetId === 'sa-base-wind') syncWind();
        calcScenario();
    }
    saCloseNumpad();
}

/* ============================================================
   PERSONAL LOG MODULE (Integrated v10)
   ============================================================ */

let logRole = 'CO';
let assign = { to: 'pf', ldg: 'pf' };
let cond = { to: 'day', ldg: 'day' };

let logNpTargetId = null;
let logNpVal = "";
let logNpMode = 'number';

function initLog() {
    // 1. 日付の自動セット (DD:MM)
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    document.getElementById('log-date').innerText = `${dd}:${mm}`;
    
    // 2. ダッシュボード情報の自動取得
    let fltNum = "----";
    let shipNum = "----";
    let depAp = "----";
    let arrAp = "----";

    if (typeof state !== 'undefined' && state.legs && state.legs[state.idx]) {
        const leg = state.legs[state.idx];
        if (leg.flightNo) fltNum = leg.flightNo;
        if (leg.ship) shipNum = leg.ship;
        if (leg.dep) depAp = leg.dep;
        if (leg.arr) arrAp = leg.arr;
    }

    // 3. 画面への反映
    document.getElementById('log-flt').innerText = "JL" + fltNum;
    // JA+数字形式で表示（データが空ならJA----）
    document.getElementById('log-ship').innerText = shipNum.length >= 2 ? "JA" + shipNum : "JA----";
    document.getElementById('log-dep').value = depAp;
    document.getElementById('log-arr').value = arrAp;
    
    // プレビュー更新
    updatePreview();
}

/* --- UI TOGGLES --- */
function setLogRole(role) {
    logRole = role;
    document.getElementById('btn-role-co').className = `toggle-btn ${role==='CO'?'active':''}`;
    document.getElementById('btn-role-pus').className = `toggle-btn ${role==='PUS'?'active':''}`;
    updatePreview();
}

function setAssign(phase, role) {
    assign[phase] = role;
    document.getElementById(`btn-${phase}-pf`).className = `toggle-btn ${role==='pf'?'active':''}`;
    document.getElementById(`btn-${phase}-pm`).className = `toggle-btn ${role==='pm'?'active':''}`;
    updatePreview();
}

function setCond(phase, c) {
    cond[phase] = c;
    const activeClass = (c === 'day') ? 'active-day' : 'active-ngt';
    document.getElementById(`btn-${phase}-day`).className = `toggle-btn ${c==='day'?activeClass:''}`;
    document.getElementById(`btn-${phase}-ngt`).className = `toggle-btn ${c==='ngt'?activeClass:''}`;
    updatePreview();
}

/* --- TIME & SHIP INPUT HELPERS --- */
function setLogTime(type) {
    const now = new Date();
    const hh = String(now.getUTCHours()).padStart(2, '0');
    const mm = String(now.getUTCMinutes()).padStart(2, '0');
    document.getElementById(`log-t-${type}`).value = `${hh}:${mm}`;
    calcLogStats();
}

function setNgtToBlock() {
    const blk = document.getElementById('log-res-blk').innerText;
    if (!blk || blk === "00:00") return;
    const [hh, mm] = blk.split(':');
    document.getElementById('log-t-ngt').value = `${hh}h${mm}m`;
    updatePreview();
}

function openShipInput() {
    // ログ用テンキーを「機番入力モード」で開く (ID: REG_UPDATE)
    openLogNumpad('REG_UPDATE', 'SHIP No. (4 digits)', 'number');
}

/* --- LOG NUMPAD CONTROLLER --- */
function openLogNumpad(id, label, mode) {
    logNpTargetId = id;
    logNpVal = "";
    logNpMode = mode || 'number';
    document.getElementById('log-np-label').innerText = label;
    document.getElementById('log-np-val').innerText = "";
    document.getElementById('modal-log-numpad').classList.add('active');
}

function closeLogNumpad() {
    document.getElementById('modal-log-numpad').classList.remove('active');
}

function logNpInput(n) {
    if (logNpMode === 'time' || logNpMode === 'duration') {
        if (logNpVal.length < 4) logNpVal += n;
    } else {
        if (logNpVal.length < 6) logNpVal += n;
    }
    document.getElementById('log-np-val').innerText = logNpVal;
}

function logNpBack() {
    logNpVal = logNpVal.slice(0, -1);
    document.getElementById('log-np-val').innerText = logNpVal;
}

function logNpClear() {
    logNpVal = "";
    document.getElementById('log-np-val').innerText = "";
}

function logNpConfirm() {
    if(logNpTargetId) {
        // ▼▼▼ 機番更新の特別処理 ▼▼▼
        if (logNpTargetId === 'REG_UPDATE') {
            if (logNpVal !== "") {
                const shipVal = logNpVal; // 入力された数字（例: 8001）
                
                // データ初期化
                if (typeof state === 'undefined') state = { legs: [], currentLegIndex: 0 };
                if (!state.legs) state.legs = [];

                // 現在のレグ以降すべてに機番を反映
                const startIdx = state.idx || 0;
                // レグデータが足りない場合は自動生成
                while (state.legs.length <= startIdx + 3) state.legs.push({});

                for (let i = startIdx; i < state.legs.length; i++) {
                    if (!state.legs[i]) state.legs[i] = {};
                    state.legs[i].ship = shipVal;
                }

                initLog(); // 画面更新
                if (typeof saveData === 'function') saveData(); // 保存
            }
            closeLogNumpad();
            return;
        }
        // ▲▲▲ 特別処理ここまで ▲▲▲

        let formatted = logNpVal;
        if (logNpVal !== "") {
            if (logNpMode === 'time') {
                const p = logNpVal.padStart(4, '0');
                formatted = `${p.slice(0,2)}:${p.slice(2,4)}`;
            } else if (logNpMode === 'duration') {
                const p = logNpVal.padStart(4, '0');
                formatted = `${p.slice(0,2)}h${p.slice(2,4)}m`;
            }
        }
        
        const el = document.getElementById(logNpTargetId);
        if(el) {
            el.value = formatted;
            calcLogStats();
        }
    }
    closeLogNumpad();
}

/* --- CALCULATIONS --- */
function calcLogStats() {
    const outT = document.getElementById('log-t-out').value;
    const inT = document.getElementById('log-t-in').value;
    const blk = calcTimeDiff(outT, inT);
    document.getElementById('log-res-blk').innerText = blk;
    updatePreview();
}

function calcTimeDiff(start, end) {
    if (!start || !end || !start.includes(':') || !end.includes(':')) return "00:00";
    let [h1, m1] = start.split(':').map(Number);
    let [h2, m2] = end.split(':').map(Number);
    let mStart = h1*60 + m1;
    let mEnd = h2*60 + m2;
    if (mEnd < mStart) mEnd += 24*60;
    let diff = mEnd - mStart;
    let h = Math.floor(diff/60);
    let m = diff%60;
    return String(h).padStart(2,'0') + ":" + String(m).padStart(2,'0');
}

/* --- PREVIEW GENERATION (Logbook Format) --- */
function updatePreview() {
    // 1. データ取得
    const date = document.getElementById('log-date').innerText; // DD:MM
    // REG: JAxxxx
    const shipDisp = document.getElementById('log-ship').innerText;
    const reg = shipDisp.includes("JA") ? shipDisp : "JA----";
    // SHIP: 機種 (B738固定)
    const type = "B738"; 
    
    // 便名 (JL + 数字)
    const fltDisp = document.getElementById('log-flt').innerText;
    const fltNum = fltDisp.replace("JL", "").trim();
    const flt = "JL" + fltNum;

    const dep = document.getElementById('log-dep').value.toUpperCase();
    const arr = document.getElementById('log-arr').value.toUpperCase();
    
    const outT = document.getElementById('log-t-out').value || "";
    const inT = document.getElementById('log-t-in').value || "";
    const blk = document.getElementById('log-res-blk').innerText;
    
    // 時間フォーマット整形 (01h30m -> 1:30)
    const formatDur = (val) => {
        if (!val) return "";
        let s = val.replace("h", ":").replace("m", "");
        // 先頭の0を取る
        if (s.startsWith("0") && s.length === 5) s = s.substring(1);
        return s;
    };

    const ngt = formatDur(document.getElementById('log-t-ngt').value);
    const inst = formatDur(document.getElementById('log-t-inst').value);
    const memo = document.getElementById('log-memo').value;
    
    // 時間の振り分け
    let picT = "", picXcT = "";
    let coT = "", coXcT = "";
    
    let blkFmt = blk;
    if (blkFmt.startsWith("0") && blkFmt.length === 5) blkFmt = blkFmt.substring(1);
    if (blkFmt === "0:00") blkFmt = "";

    if (logRole === 'PUS') {
        picT = blkFmt;
        picXcT = blkFmt; 
    } else {
        coT = blkFmt;
        coXcT = blkFmt;
    }

    // 2. パディング処理
    const pad = (str, len) => (str || "").padEnd(len, " ");
    
    const sDate   = pad(date, 6);
    const sShip   = pad(type, 5);
    const sReg    = pad(reg, 7);
    const sDep    = pad(dep, 5); 
    const sArr    = pad(arr, 5); 
    const sOut    = pad(outT, 6); 
    const sIn     = pad(inT, 6);  
    const sFlt    = pad(flt, 8); // JLxxxx
    const sPic    = pad(picT, 6);
    const sPicXc  = pad(picXcT, 6);
    const sCo     = pad(coT, 6);
    const sCoXc   = pad(coXcT, 6);
    const sNgt    = pad(ngt, 6);
    const sInst   = pad(inst, 6);

    // 3. ヘッダーとデータ (順序: DATE SHIP REG DEP ARR OUT IN FLT ...)
    const header = 
        pad("DATE",6) + pad("SHIP",5) + pad("REG",7) + 
        pad("DEP",5) + pad("ARR",5) + 
        pad("DEP",6) + pad("ARR",6) + 
        pad("FLT",8) + 
        pad("PIC",6) + pad("X/C",6) + 
        pad("CO",6) + pad("X/C",6) + 
        pad("NGT",6) + pad("INST",6);

    const data = 
        sDate + sShip + sReg + 
        sDep + sArr + 
        sOut + sIn + 
        sFlt + 
        sPic + sPicXc + 
        sCo + sCoXc + 
        sNgt + sInst;

    let output = header + "\n" + data;
    if(memo) output += "\nRMK: " + memo;

    document.getElementById('log-preview-text').innerText = output;
}

function copyLogbookFormat() {
    const text = document.getElementById('log-preview-text').innerText;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => alert("COPIED!"));
    } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        alert("COPIED!");
    }
}
