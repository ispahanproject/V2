/* ============================================================
   QUICK REFERENCE : DATA FILE
   Edit Modeで書き出されたコードをここに上書きしてください
   ============================================================ */

const REF_DATA = [
  {
    "id": "lim-wind",
    "category": "LIMIT",
    "tag": "WIND LIMITS",
    "title": "Takeoff & Landing Wind Limits",
    "content": "HEADWIND: 25 KT\nCROSSWIND (WET/DRY): 33 KT (Winglet)\nTAILWIND: 10 KT (or 15 KT if authorized)\n\n<span class=\"hlt-amber\">AUTOLAND LIMITS:</span>\nHEADWIND: 25 KT\nCROSSWIND: 20 KT / 25 KT(CAT I)\nTAILWIND: 10 KT / 0 KT(CAT II/III)\n\n<span class=\"hlt-red\">TURBULENT AIR PENETRATION:</span>\n280 KIAS / .76 MACH"
  },
  {
    "id": "lim-alt",
    "category": "LIMIT",
    "tag": "ALTITUDE LIMITS",
    "title": "Operating Altitudes",
    "content": "MAX OPERATING ALT: 41,000 ft\nMAX T/O & LDG ALT: 8,400 ft\n\n<span class=\"hlt-amber\">CABIN DIFF PRESS:</span>\nMAX DIFF: 9.1 psi\nT/O & LDG: 0.125 psi"
  },
  {
    "id": "mem-airspeed",
    "category": "MEMORY",
    "tag": "EMERGENCY",
    "title": "Airspeed Unreliable",
    "content": "<span class=\"hlt-red\">1. AUTOPILOT ............ DISENGAGE</span>\n<span class=\"hlt-red\">2. AUTOTHROTTLE ......... DISENGAGE</span>\n<span class=\"hlt-red\">3. F/D SWITCHES (Both) .. OFF</span>\n4. Set following gear up pitch attitude and thrust:\n   Flaps extended ....... 10° / 80% N1\n   Flaps up ............. 4° / 75% N1"
  },
  {
    "id": "mem-eng-fail",
    "category": "MEMORY",
    "tag": "EMERGENCY",
    "title": "Loss of Thrust on Both Engines",
    "content": "<span class=\"hlt-red\">1. ENGINE START SWITCHES (Both) ... FLT</span>\n<span class=\"hlt-red\">2. ENGINE START LEVERS (Both) ..... CUTOFF</span>\n3. When EGT decreases:\n<span class=\"hlt-red\">4. ENGINE START LEVERS (Both) ..... IDLE DETENT</span>\n5. If EGT reaches 950°C or no increase:\n   ENGINE START LEVERS ..... CONFIRM/CUTOFF"
  },
  {
    "id": "perf-fuel",
    "category": "PERF",
    "tag": "CONVERSION",
    "title": "Fuel Weight Conversion",
    "content": "Specific Gravity: 0.8 (Standard)\n\nLBS  = KG x 2.2046\nKG   = LBS x 0.4536\n\n<span class=\"hlt-cyan\">QUICK RULE:</span>\n1000 KG ≈ 2200 LBS\n1000 LBS ≈ 450 KG"
  }
];