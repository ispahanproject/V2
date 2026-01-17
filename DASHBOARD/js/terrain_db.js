/**
 * TERRAIN_DB: 日本の地形・火山・河川データベース (完全版)
 * * Categories:
 * 1. TERRAIN_DB: Volcanoes (55+) & Major Peaks
 * 2. LAKE_DB: Major Lakes
 * 3. RIVER_DB: Major Rivers
 */

// --- 1. MOUNTAINS & VOLCANOES (All Active Volcanoes + Major Peaks) ---
const TERRAIN_DB = {
    // === HOKKAIDO (北海道) ===
    // [Active Volcanoes]
    "SHIRETOKO-IOZAN": { lat: 44.1333, lon: 145.1614, alt: 5125, type: 'VOLCANO', min_zoom: 8 },
    "RAUSUDAKE":       { lat: 44.0758, lon: 145.1222, alt: 5449, type: 'VOLCANO', min_zoom: 7 },
    "MASHU":           { lat: 43.5722, lon: 144.5608, alt: 2812, type: 'VOLCANO', min_zoom: 9 },
    "ATOSANUPURI":     { lat: 43.6103, lon: 144.4386, alt: 1667, type: 'VOLCANO', min_zoom: 9 },
    "MEAKANDAKE":      { lat: 43.3864, lon: 144.0086, alt: 4918, type: 'VOLCANO', min_zoom: 7, remark: "AKAN" },
    "TAISETSUZAN":     { lat: 43.6636, lon: 142.8542, alt: 7516, type: 'VOLCANO', min_zoom: 6, remark: "ASAHIDAKE" },
    "TOKACHIDAKE":     { lat: 43.4178, lon: 142.6864, alt: 6814, type: 'VOLCANO', min_zoom: 6 },
    "TARUMAESAN":      { lat: 42.6906, lon: 141.3767, alt: 3415, type: 'VOLCANO', min_zoom: 7 },
    "ENIWADAKE":       { lat: 42.7933, lon: 141.2853, alt: 4331, type: 'VOLCANO', min_zoom: 8 },
    "USUZAN":          { lat: 42.5439, lon: 140.8392, alt: 2405, type: 'VOLCANO', min_zoom: 8 },
    "YOTEIZAN":        { lat: 42.8267, lon: 140.8114, alt: 6227, type: 'VOLCANO', min_zoom: 6, remark: "EZO-FUJI" },
    "KOMAGATAKE":      { lat: 42.0633, lon: 140.6772, alt: 3711, type: 'VOLCANO', min_zoom: 7, remark: "HOKKAIDO" },
    "ESAN":            { lat: 41.8047, lon: 141.1661, alt: 2028, type: 'VOLCANO', min_zoom: 8 },
    "RISHIRIZAN":      { lat: 45.1786, lon: 141.2419, alt: 5646, type: 'VOLCANO', min_zoom: 7, remark: "ISLAND" },

    // === TOHOKU (東北) ===
    // [Active Volcanoes]
    "IWAKISAN":        { lat: 40.6558, lon: 140.3031, alt: 5331, type: 'VOLCANO', min_zoom: 7 },
    "HAKKODASAN":      { lat: 40.6589, lon: 140.8772, alt: 5200, type: 'VOLCANO', min_zoom: 7 },
    "TOWADA":          { lat: 40.4594, lon: 140.9100, alt: 3317, type: 'VOLCANO', min_zoom: 8 },
    "AKITA-YAKEYAMA":  { lat: 39.9639, lon: 140.7569, alt: 4482, type: 'VOLCANO', min_zoom: 8 },
    "HACHIMANTAI":     { lat: 39.9578, lon: 140.8542, alt: 5292, type: 'VOLCANO', min_zoom: 8 },
    "IWATESAN":        { lat: 39.8525, lon: 141.0011, alt: 6686, type: 'VOLCANO', min_zoom: 7 },
    "AKITA-KOMAGATAKE":{ lat: 39.7611, lon: 140.7994, alt: 5371, type: 'VOLCANO', min_zoom: 8 },
    "CHOKAISAN":       { lat: 39.0992, lon: 140.0489, alt: 7336, type: 'VOLCANO', min_zoom: 6 },
    "KURIKOMAYAMA":    { lat: 38.9608, lon: 140.7883, alt: 5335, type: 'VOLCANO', min_zoom: 8 },
    "ZAOZAN":          { lat: 38.1436, lon: 140.4400, alt: 6040, type: 'VOLCANO', min_zoom: 7 },
    "AZUMAYAMA":       { lat: 37.7353, lon: 140.2444, alt: 6394, type: 'VOLCANO', min_zoom: 7 },
    "ADATARAYAMA":     { lat: 37.6331, lon: 140.2831, alt: 5607, type: 'VOLCANO', min_zoom: 8 },
    "BANDAISAN":       { lat: 37.6011, lon: 140.0722, alt: 5958, type: 'VOLCANO', min_zoom: 7 },
    "HIUCHIGATAKE":    { lat: 36.9550, lon: 139.2853, alt: 7720, type: 'VOLCANO', min_zoom: 7 },
    // [Major Peaks]
    "MT.GASSAN":       { lat: 38.5489, lon: 140.0272, alt: 6496, type: 'PEAK',    min_zoom: 8, remark: "DEWA" },

    // === KANTO / CHUBU (関東・中部) ===
    // [Active Volcanoes]
    "NASUDAKE":        { lat: 37.1247, lon: 139.9628, alt: 6283, type: 'VOLCANO', min_zoom: 7 },
    "NIKKO-SHIRANESAN":{ lat: 36.7986, lon: 139.3758, alt: 8458, type: 'VOLCANO', min_zoom: 7 },
    "AKAGISAN":        { lat: 36.5603, lon: 139.1933, alt: 5997, type: 'VOLCANO', min_zoom: 8 },
    "KUSATSU-SHIRANE": { lat: 36.6439, lon: 138.5278, alt: 7087, type: 'VOLCANO', min_zoom: 7 },
    "ASAMAYAMA":       { lat: 36.4064, lon: 138.5231, alt: 8425, type: 'VOLCANO', min_zoom: 6 },
    "MYOKOSAN":        { lat: 36.8914, lon: 138.1136, alt: 8051, type: 'VOLCANO', min_zoom: 7 },
    "YAKEDAKE":        { lat: 36.2269, lon: 137.5869, alt: 8054, type: 'VOLCANO', min_zoom: 7 },
    "ONTAKESAN":       { lat: 35.8928, lon: 137.4803, alt: 10062,type: 'VOLCANO', min_zoom: 6 },
    "HAKUSAN":         { lat: 36.1550, lon: 136.7714, alt: 8865, type: 'VOLCANO', min_zoom: 7 },
    "FUJISAN":         { lat: 35.3608, lon: 138.7275, alt: 12388,type: 'VOLCANO', min_zoom: 6, remark: "HIGHEST" },
    "HAKONEYAMA":      { lat: 35.2333, lon: 139.0208, alt: 4718, type: 'VOLCANO', min_zoom: 7 },
    "IZU-OSHIMA":      { lat: 34.7244, lon: 139.3944, alt: 2487, type: 'VOLCANO', min_zoom: 7, remark: "MIHARA" },
    // [Major Peaks]
    "MT.KITA":         { lat: 35.6745, lon: 138.2367, alt: 10476, type: 'PEAK', min_zoom: 6, remark: "S.ALPS" },
    "MT.AINO":         { lat: 35.6461, lon: 138.2258, alt: 10463, type: 'PEAK', min_zoom: 7 },
    "MT.OKU-HOTAKA":   { lat: 36.2892, lon: 137.6480, alt: 10466, type: 'PEAK', min_zoom: 6, remark: "N.ALPS" },
    "MT.YARI":         { lat: 36.3420, lon: 137.6477, alt: 10433, type: 'PEAK', min_zoom: 7 },
    "MT.KISOKOMA":     { lat: 35.7895, lon: 137.8045, alt: 9698,  type: 'PEAK', min_zoom: 7, remark: "C.ALPS" },
    "MT.MASU":         { lat: 36.4350, lon: 137.8572, alt: 9442,  type: 'PEAK', min_zoom: 7, remark: "TOYAMA" },
    "MT.TSUKUBA":      { lat: 36.2253, lon: 140.1067, alt: 2877,  type: 'PEAK', min_zoom: 8, remark: "IBARAKI" },
    "MT.ATAGO":        { lat: 35.1056, lon: 140.0125, alt: 1339,  type: 'PEAK', min_zoom: 8, remark: "CHIBA" },
    "MT.SANPO":        { lat: 35.9069, lon: 138.9467, alt: 8146,  type: 'PEAK', min_zoom: 8, remark: "SAITAMA" },
    "MT.KUMOTORI":     { lat: 35.8556, lon: 138.9436, alt: 6617,  type: 'PEAK', min_zoom: 8, remark: "TOKYO" },
    "MT.HIRU":         { lat: 35.4883, lon: 139.1492, alt: 5492,  type: 'PEAK', min_zoom: 8, remark: "KANAGAWA" },
    "MT.CHAUSU":       { lat: 35.2253, lon: 137.7600, alt: 4642,  type: 'PEAK', min_zoom: 8, remark: "AICHI" },

    // === IZU / OGASAWARA (伊豆諸島・小笠原) ===
    "MIYAKEJIMA":      { lat: 34.0936, lon: 139.5261, alt: 2543, type: 'VOLCANO', min_zoom: 8 },
    "HACHIJOJIMA":     { lat: 33.1369, lon: 139.7661, alt: 2802, type: 'VOLCANO', min_zoom: 8 },
    "AOGASHIMA":       { lat: 32.4583, lon: 139.7592, alt: 1388, type: 'VOLCANO', min_zoom: 9 },
    "IZU-TORISHIMA":   { lat: 30.4839, lon: 140.3031, alt: 1293, type: 'VOLCANO', min_zoom: 8 },
    "NISHINOSHIMA":    { lat: 27.2469, lon: 140.8744, alt: 82,   type: 'VOLCANO', min_zoom: 8, remark: "ACTV" },
    "IOTO":            { lat: 24.7506, lon: 141.2892, alt: 558,  type: 'VOLCANO', min_zoom: 8, remark: "IWO-JIMA" },

    // === KINKI / CHUGOKU / SHIKOKU (近畿・中国・四国) ===
    // [Active Volcanoes]
    "SANBESAN":        { lat: 35.1406, lon: 132.6217, alt: 3694, type: 'VOLCANO', min_zoom: 8 },
    "ABU-VOLCANOES":   { lat: 34.4494, lon: 131.4019, alt: 367,  type: 'VOLCANO', min_zoom: 9, remark: "HAGI" },
    "TSURUMIDAKE":     { lat: 33.2867, lon: 131.4297, alt: 4511, type: 'VOLCANO', min_zoom: 8, remark: "BEPPU" },
    "YUFUDAKE":        { lat: 33.2822, lon: 131.3903, alt: 5194, type: 'VOLCANO', min_zoom: 7 },
    // [Major Peaks]
    "MT.IBUKI":        { lat: 35.4181, lon: 136.4058, alt: 4521, type: 'PEAK', min_zoom: 8, remark: "SHIGA" },
    "MT.ODAIGAHARA":   { lat: 34.1853, lon: 136.1103, alt: 5561, type: 'PEAK', min_zoom: 8, remark: "MIE" },
    "MT.HAKKYO":       { lat: 34.1726, lon: 135.9082, alt: 6283, type: 'PEAK', min_zoom: 7, remark: "KINKI HIGH" },
    "MT.HYONOSEN":     { lat: 35.3528, lon: 134.5122, alt: 4954, type: 'PEAK', min_zoom: 8, remark: "HYOGO" },
    "MT.DAISEN":       { lat: 35.3722, lon: 133.5350, alt: 5673, type: 'PEAK', min_zoom: 7, remark: "CHUGOKU HIGH" },
    "MT.OSORA":        { lat: 35.0592, lon: 133.1092, alt: 4409, type: 'PEAK', min_zoom: 8, remark: "OKAYAMA" },
    "MT.ISHIZUCHI":    { lat: 33.7711, lon: 133.1153, alt: 6503, type: 'PEAK', min_zoom: 7, remark: "SHIKOKU HIGH" },
    "MT.TSURUGI":      { lat: 33.8546, lon: 134.0952, alt: 6414, type: 'PEAK', min_zoom: 7, remark: "TOKUSHIMA" },

    // === KYUSHU / OKINAWA (九州・沖縄) ===
    // [Active Volcanoes]
    "KUJUSAN":         { lat: 33.0858, lon: 131.2489, alt: 5876, type: 'VOLCANO', min_zoom: 7, remark: "KYUSHU HIGH" },
    "ASOSAN":          { lat: 32.8844, lon: 131.1039, alt: 5223, type: 'VOLCANO', min_zoom: 6, remark: "ACTV" },
    "UNZENDAKE":       { lat: 32.7614, lon: 130.2989, alt: 4865, type: 'VOLCANO', min_zoom: 7, remark: "FUGEN" },
    "KIRISHIMAYAMA":   { lat: 31.9342, lon: 130.8617, alt: 5577, type: 'VOLCANO', min_zoom: 7 },
    "SAKURAJIMA":      { lat: 31.5925, lon: 130.6567, alt: 3665, type: 'VOLCANO', min_zoom: 6, remark: "ACTV" },
    "KAIMONDAKE":      { lat: 31.1800, lon: 130.5283, alt: 3031, type: 'VOLCANO', min_zoom: 8 },
    "SATSUMA-IOJIMA":  { lat: 30.7931, lon: 130.3053, alt: 2310, type: 'VOLCANO', min_zoom: 8 },
    "KUCHINOERABU":    { lat: 30.4433, lon: 130.2172, alt: 2156, type: 'VOLCANO', min_zoom: 8 },
    "SUWANOSEJIMA":    { lat: 29.6383, lon: 129.7139, alt: 2612, type: 'VOLCANO', min_zoom: 8, remark: "ACTV" },
    // [Major Peaks]
    "MT.SOBO":         { lat: 32.8286, lon: 131.3478, alt: 5761, type: 'PEAK', min_zoom: 8 },
    "MT.TARA":         { lat: 32.9733, lon: 130.0694, alt: 3241, type: 'PEAK', min_zoom: 8, remark: "NAGASAKI" },
    "MT.MIYANOURA":    { lat: 30.3358, lon: 130.5097, alt: 6348, type: 'PEAK', min_zoom: 7, remark: "YAKUSHIMA" },
    "MT.OMOTO":        { lat: 24.4283, lon: 124.1831, alt: 1726, type: 'PEAK', min_zoom: 9, remark: "OKINAWA" }
};

// --- 2. MAJOR LAKES ---
const LAKE_DB = {
    // 北海道・東北
    "L.SAROMA":      { lat: 44.1667, lon: 143.7333, elev: 0,    min_zoom: 7, remark: "HOKKAIDO" },
    "L.KUSSHARO":    { lat: 43.6333, lon: 144.3333, elev: 397,  min_zoom: 7 },
    "L.SHIKOTSU":    { lat: 42.7500, lon: 141.3333, elev: 814,  min_zoom: 7 },
    "L.TOYA":        { lat: 42.6000, lon: 140.8333, elev: 276,  min_zoom: 7 },
    "L.TOWADA":      { lat: 40.4500, lon: 140.9000, elev: 1312, min_zoom: 7, remark: "AOMORI/AKITA" },
    "L.OGAWARA":     { lat: 40.7500, lon: 141.3333, elev: 0,    min_zoom: 8, remark: "AOMORI" },
    "L.TAZAWA":      { lat: 39.7236, lon: 140.6631, elev: 817,  min_zoom: 8, remark: "AKITA/DEEP" },
    "L.INAWASHIRO":  { lat: 37.5000, lon: 140.1000, elev: 1686, min_zoom: 6, remark: "FUKUSHIMA" },
    // 関東・中部
    "L.KASUMIGAURA": { lat: 36.0333, lon: 140.4000, elev: 0,    min_zoom: 6, remark: "IBARAKI" },
    "L.CHUZENJI":    { lat: 36.7333, lon: 139.4833, elev: 4163, min_zoom: 7, remark: "TOCHIGI" },
    "L.ASHI":        { lat: 35.2000, lon: 139.0000, elev: 2375, min_zoom: 7, remark: "KANAGAWA" },
    "L.SUWA":        { lat: 36.0492, lon: 138.0858, elev: 2490, min_zoom: 8, remark: "NAGANO" },
    "L.HAMANA":      { lat: 34.7333, lon: 137.6000, elev: 0,    min_zoom: 7, remark: "SHIZUOKA" },
    "L.BIWA":        { lat: 35.3000, lon: 136.1000, elev: 279,  min_zoom: 6, remark: "SHIGA/LARGEST" },
    // 西日本
    "L.SHINJI":      { lat: 35.4333, lon: 132.9667, elev: 0,    min_zoom: 7, remark: "SHIMANE" },
    "L.IKEDA":       { lat: 31.2333, lon: 130.5667, elev: 217,  min_zoom: 8, remark: "KAGOSHIMA" }
};

// --- 3. MAJOR RIVERS (Points: Mouth or Key Confluence) ---
const RIVER_DB = {
    // 北海道
    "R.ISHIKARI":    { lat: 43.2389, lon: 141.3653, remark: "MOUTH (HOKKAIDO)", min_zoom: 7 },
    "R.TOKACHI":     { lat: 42.8550, lon: 143.6630, remark: "MOUTH (TOKACHI)", min_zoom: 7 },
    // 東北
    "R.KITAKAMI":    { lat: 38.5719, lon: 141.4589, remark: "MOUTH (MIYAGI)", min_zoom: 7 },
    "R.MOGAMI":      { lat: 38.9308, lon: 139.8164, remark: "MOUTH (YAMAGATA)", min_zoom: 7 },
    // 関東・中部
    "R.TONE":        { lat: 35.8361, lon: 140.7633, remark: "MOUTH (CHIBA/IBARAKI)", min_zoom: 6 },
    "R.ARAKAWA":     { lat: 35.6339, lon: 139.8450, remark: "MOUTH (TOKYO)", min_zoom: 8 },
    "R.SHINANO":     { lat: 37.9467, lon: 139.0669, remark: "MOUTH (NIIGATA)", min_zoom: 6 },
    "R.KISO":        { lat: 35.0331, lon: 136.7375, remark: "MOUTH (MIE)", min_zoom: 7 },
    "R.TENRYU":      { lat: 34.6467, lon: 137.7950, remark: "MOUTH (SHIZUOKA)", min_zoom: 7 },
    // 近畿・中国・四国
    "R.YODO":        { lat: 34.6750, lon: 135.4208, remark: "MOUTH (OSAKA)", min_zoom: 7 },
    "R.GONOKAW":     { lat: 35.0167, lon: 132.2333, remark: "MOUTH (SHIMANE)", min_zoom: 7 },
    "R.YOSHINO":     { lat: 34.0833, lon: 134.5833, remark: "MOUTH (TOKUSHIMA)", min_zoom: 7 },
    "R.SHIMANTO":    { lat: 32.9333, lon: 132.9333, remark: "MOUTH (KOCHI)", min_zoom: 8 },
    // 九州
    "R.CHIKUGO":     { lat: 33.1500, lon: 130.3500, remark: "MOUTH (ARIAKE)", min_zoom: 7 },
    "R.OYODO":       { lat: 31.8967, lon: 131.4650, remark: "MOUTH (MIYAZAKI)", min_zoom: 8 }
};