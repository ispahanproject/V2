/**
 * HOLDING_DB: AIP ENR 3.6 (Japan) に基づく全エンルート待機経路データ
 * * Data Structure:
 * - lat/lon: Decimal Degrees (converted from DMS)
 * - inbound: Inbound Track (Mag)
 * - turn: Turn Direction (RIGHT/LEFT)
 * - mha: Minimum Holding Altitude (ft or FL)
 * - max_ias: Max Indicated Airspeed (kt) - Optional info for ref
 * - time_dist: Outbound Time/Distance - Optional info for ref
 */
const HOLDING_DB = {
    // --- Hokkaido / Northern Japan ---
    "BOKSO": { lat: 42.8052, lon: 142.4652, inbound: 268, turn: "RIGHT", mha: 12000, max_ias: 280 },
    "MEKAB": { lat: 41.4575, lon: 141.0605, inbound: 029, turn: "LEFT", mha: "FL150", max_ias: 265 },
    "JYONA": { lat: 40.8089, lon: 141.1574, inbound: 020, turn: "RIGHT", mha: "FL210", max_ias: 265 },
    "MRE":   { lat: 40.7388, lon: 140.7053, inbound: 029, turn: "LEFT", mha: 10000, max_ias: 230 }, // AOMORI
    "ELBIT": { lat: 40.7388, lon: 140.9685, inbound: 010, turn: "RIGHT", mha: "FL250", max_ias: 265 },
    "SAMBO": { lat: 40.1878, lon: 140.9504, inbound: 010, turn: "RIGHT", mha: "FL210", max_ias: 265 },
    "NISIN": { lat: 40.0027, lon: 137.8317, inbound: 015, turn: "LEFT", mha: "FL200", max_ias: 280 },
    "GEPPA": { lat: 39.8929, lon: 139.4402, inbound: 056, turn: "LEFT", mha: "FL210", max_ias: 280 },
    "PEONY": { lat: 39.8406, lon: 140.8335, inbound: 022, turn: "RIGHT", mha: "FL210", max_ias: 280 },
    "LEKOL": { lat: 39.8404, lon: 140.9036, inbound: 020, turn: "RIGHT", mha: "FL210", max_ias: 280 },
    "NAMMY": { lat: 39.8100, lon: 139.8772, inbound: 041, turn: "RIGHT", mha: "FL210", max_ias: 280 },
    "AKITA": { lat: 39.7116, lon: 140.0623, inbound: 034, turn: "LEFT", mha: "FL210", max_ias: 280 },
    "UWE":   { lat: 39.6171, lon: 140.1869, inbound: 034, turn: "LEFT", mha: "FL210", max_ias: 280 },
    "HPE":   { lat: 39.4334, lon: 141.1335, inbound: 200, turn: "LEFT", mha: "FL220", max_ias: 280 }, // HANAMAKI
    "AKNED": { lat: 38.7228, lon: 139.9109, inbound: 142, turn: "LEFT", mha: "FL200", max_ias: 280 },
    "ZAHAN": { lat: 38.5592, lon: 140.8722, inbound: 201, turn: "LEFT", mha: "FL260", max_ias: 280 },
    "ENVAS": { lat: 38.5124, lon: 139.6255, inbound: 110, turn: "LEFT", mha: "FL230", max_ias: 280 },
    "YTE":   { lat: 38.3886, lon: 140.3580, inbound: 142, turn: "LEFT", mha: "FL200", max_ias: 280 }, // YAMAGATA
    "SDE":   { lat: 38.1386, lon: 140.9215, inbound: 200, turn: "LEFT", mha: "FL260", max_ias: 280 }, // SENDAI

    // --- Tohoku / Kanto ---
    "JUGEM": { lat: 37.9336, lon: 141.1628, inbound: 205, turn: "LEFT", mha: "FL200", max_ias: 280 },
    "OATIS": { lat: 37.8164, lon: 143.5397, inbound: 233, turn: "LEFT", mha: "FL280", max_ias: 265 },
    "GUGBI": { lat: 37.7754, lon: 141.1001, inbound: 205, turn: "LEFT", mha: "FL200", max_ias: 280 },
    "RUBIS": { lat: 37.7475, lon: 140.6354, inbound: 201, turn: "LEFT", mha: "FL200", max_ias: 280 },
    "VIKET": { lat: 37.7014, lon: 139.5707, inbound: 134, turn: "RIGHT", mha: "FL200", max_ias: 280 },
    "BONGO": { lat: 37.4125, lon: 140.9572, inbound: 205, turn: "LEFT", mha: "FL200", max_ias: 280 },
    "AKTIL": { lat: 37.3501, lon: 140.1841, inbound: 134, turn: "RIGHT", mha: "FL140", max_ias: 230 },
    "DANDY": { lat: 37.1738, lon: 139.5116, inbound: 116, turn: "LEFT", mha: "FL240", max_ias: 280 },
    "IXE":   { lat: 37.1489, lon: 140.9757, inbound: 185, turn: "RIGHT", mha: "FL150", max_ias: 240 }, // IWAKI
    "ESNIP": { lat: 37.1147, lon: 142.8372, inbound: 198, turn: "LEFT", mha: "FL260", max_ias: 280 },
    "SYOEN": { lat: 37.0385, lon: 140.0039, inbound: 089, turn: "LEFT", mha: "FL150", max_ias: 280 },
    "PABBA": { lat: 37.0032, lon: 143.9964, inbound: 237, turn: "LEFT", mha: "FL280", max_ias: 280 },
    "ENTAK": { lat: 36.9936, lon: 140.7949, inbound: 205, turn: "LEFT", mha: "FL140", max_ias: 230 },
    "GUSGI": { lat: 36.9271, lon: 140.4013, inbound: 201, turn: "LEFT", mha: "FL150", max_ias: 280 },
    "IKAHO": { lat: 36.9207, lon: 139.0753, inbound: 088, turn: "LEFT", mha: "FL240", max_ias: 280 },
    "BEKPO": { lat: 36.9099, lon: 142.4819, inbound: 204, turn: "LEFT", mha: "FL150", max_ias: 280 },
    "OTARI": { lat: 36.7902, lon: 138.0931, inbound: 087, turn: "LEFT", mha: "FL240", max_ias: 280 },
    "ENVOP": { lat: 36.6358, lon: 143.8267, inbound: 256, turn: "RIGHT", mha: "FL200", max_ias: 280 },
    "TEDIX": { lat: 36.6311, lon: 140.3271, inbound: 197, turn: "LEFT", mha: 11000, max_ias: 230 },
    "UGTAN": { lat: 36.5754, lon: 142.6854, inbound: 216, turn: "LEFT", mha: "FL200", max_ias: 280 },
    "GURIP": { lat: 36.5546, lon: 140.6268, inbound: 205, turn: "LEFT", mha: "FL140", max_ias: 230 },
    "LOSVA": { lat: 36.2914, lon: 142.2617, inbound: 217, turn: "LEFT", mha: "FL150", max_ias: 280 },
    "NOGIX": { lat: 36.1811, lon: 142.4208, inbound: 256, turn: "LEFT", mha: "FL150", max_ias: 280 },
    "MILIT": { lat: 35.9463, lon: 141.2191, inbound: 278, turn: "LEFT", mha: 9000, max_ias: 230 },
    "POROT": { lat: 35.9297, lon: 143.2282, inbound: 270, turn: "RIGHT", mha: "FL200", max_ias: 280 },
    "KAGIS": { lat: 35.8202, lon: 142.5635, inbound: 272, turn: "LEFT", mha: "FL200", max_ias: 280 },
    "OLDIV": { lat: 35.7939, lon: 141.9189, inbound: 270, turn: "RIGHT", mha: 13000, max_ias: 230 },
    "TRE":   { lat: 35.5273, lon: 134.1649, inbound: 195, turn: "RIGHT", mha: 13000, max_ias: 220 }, // TOTTORI
    "KCC":   { lat: 35.2653, lon: 136.9149, inbound: 137, turn: "LEFT", mha: "FL160", max_ias: 280 }, // NAGOYA
    "VACKY": { lat: 35.2401, lon: 143.8115, inbound: 298, turn: "LEFT", mha: "FL280", max_ias: 280 },

    // --- Kansai / Chubu ---
    "MIDER": { lat: 35.0170, lon: 135.8260, inbound: 111, turn: "LEFT", mha: "FL170", max_ias: 280 },
    "MENIX": { lat: 34.9784, lon: 141.9939, inbound: 290, turn: "LEFT", mha: "FL150", max_ias: 280 },
    "UBNET": { lat: 34.8600, lon: 134.8494, inbound: 208, turn: "RIGHT", mha: 5000, max_ias: 230 },
    "SHTLE": { lat: 34.8308, lon: 136.9483, inbound: 108, turn: "RIGHT", mha: "FL160", max_ias: 280 },
    "BESMU": { lat: 34.8126, lon: 131.9644, inbound: 240, turn: "LEFT", mha: "FL240", max_ias: 280 },
    "TOKAT": { lat: 34.7984, lon: 142.9238, inbound: 291, turn: "LEFT", mha: "FL200", max_ias: 280 },
    "ARTIC": { lat: 34.7156, lon: 138.8046, inbound: 097, turn: "RIGHT", mha: "FL150", max_ias: 280 },
    "SHOOT": { lat: 34.7144, lon: 138.0306, inbound: 097, turn: "RIGHT", mha: "FL150", max_ias: 280 },
    "KOHWA": { lat: 34.7046, lon: 136.9579, inbound: 357, turn: "RIGHT", mha: 5000, max_ias: 230 },
    "ANSAD": { lat: 34.6966, lon: 141.7123, inbound: 278, turn: "LEFT", mha: "FL240", max_ias: 280 },
    "UPLOV": { lat: 34.6884, lon: 134.1063, inbound: 181, turn: "LEFT", mha: 12000, max_ias: 230 },
    "OLVEK": { lat: 34.6864, lon: 142.2275, inbound: 360, turn: "RIGHT", mha: "FL150", max_ias: 280 },
    "SMOLT": { lat: 34.5801, lon: 143.5165, inbound: 315, turn: "LEFT", mha: "FL280", max_ias: 280 },
    "ENSYU": { lat: 34.5433, lon: 138.0340, inbound: 097, turn: "RIGHT", mha: "FL150", max_ias: 280 },
    "BOKJO": { lat: 34.5423, lon: 138.3849, inbound: 071, turn: "RIGHT", mha: "FL150", max_ias: 280 },
    "FLUTE": { lat: 34.5386, lon: 136.9637, inbound: 096, turn: "LEFT", mha: "FL160", max_ias: 280 },
    "OHDAI": { lat: 34.5165, lon: 136.3179, inbound: 258, turn: "LEFT", mha: 13000, max_ias: 230 },
    "RUNSO": { lat: 34.4880, lon: 139.7180, inbound: 074, turn: "RIGHT", mha: 10000, max_ias: 280 },
    "GEMBU": { lat: 34.4837, lon: 139.6065, inbound: 177, turn: "LEFT", mha: 5000, max_ias: 230 },
    "SUNPI": { lat: 34.4595, lon: 132.1789, inbound: 263, turn: "RIGHT", mha: "FL240", max_ias: 280 },
    "LOVGI": { lat: 34.3748, lon: 133.9777, inbound: 032, turn: "LEFT", mha: 9000, max_ias: 230 },
    "BAFFY": { lat: 34.3451, lon: 139.9753, inbound: 065, turn: "RIGHT", mha: 13000, max_ias: 280 },
    "KTE":   { lat: 34.2125, lon: 134.0226, inbound: 084, turn: "RIGHT", mha: "FL210", max_ias: 280 }, // KOWA
    "PAMVI": { lat: 34.2066, lon: 138.9467, inbound: 069, turn: "RIGHT", mha: "FL150", max_ias: 280 },
    "STOUT": { lat: 34.1907, lon: 131.0162, inbound: 284, turn: "RIGHT", mha: 12000, max_ias: 280 },
    "EMSIG": { lat: 34.0975, lon: 134.3095, inbound: 086, turn: "RIGHT", mha: "FL250", max_ias: 280 },
    "MOE":   { lat: 34.0710, lon: 139.5613, inbound: 058, turn: "RIGHT", mha: "FL210", max_ias: 280 }, // OYAMA
    "IGLAN": { lat: 34.0663, lon: 142.3134, inbound: 360, turn: "RIGHT", mha: "FL260", max_ias: 280 },
    "FIATO": { lat: 34.0104, lon: 133.0652, inbound: 083, turn: "RIGHT", mha: "FL160", max_ias: 280 },

    // --- Western Japan / Kyushu / Okinawa ---
    "MENUR": { lat: 33.9114, lon: 138.2790, inbound: 069, turn: "RIGHT", mha: "FL250", max_ias: 280 },
    "SALTY": { lat: 33.8527, lon: 132.9252, inbound: 080, turn: "RIGHT", mha: "FL160", max_ias: 280 },
    "GUPER": { lat: 33.7442, lon: 138.9058, inbound: 066, turn: "RIGHT", mha: "FL210", max_ias: 280 },
    "OBKAG": { lat: 33.7292, lon: 133.9046, inbound: 013, turn: "RIGHT", mha: 9000, max_ias: 230 },
    "KINME": { lat: 33.7137, lon: 139.7732, inbound: 177, turn: "LEFT", mha: 5000, max_ias: 230 },
    "ISEBI": { lat: 33.7007, lon: 137.1139, inbound: 085, turn: "RIGHT", mha: "FL250", max_ias: 280 },
    "DGC":   { lat: 33.6762, lon: 130.3896, inbound: 262, turn: "RIGHT", mha: "FL240", max_ias: 280 }, // DAIGO
    "SPIDE": { lat: 33.6445, lon: 132.9717, inbound: 076, turn: "RIGHT", mha: "FL160", max_ias: 280 },
    "BILLY": { lat: 33.6111, lon: 137.6198, inbound: 068, turn: "RIGHT", mha: "FL250", max_ias: 280 },
    "CHINU": { lat: 33.5153, lon: 130.4412, inbound: 263, turn: "LEFT", mha: "FL240", max_ias: 280 },
    "OLBUG": { lat: 33.4687, lon: 134.2122, inbound: 063, turn: "LEFT", mha: 9000, max_ias: 230 },
    "KEC":   { lat: 33.4477, lon: 135.7945, inbound: 091, turn: "RIGHT", mha: "FL150", max_ias: 280 }, // KUSHIMOTO
    "AGIMO": { lat: 33.4434, lon: 138.3129, inbound: 065, turn: "RIGHT", mha: "FL250", max_ias: 280 },
    "RISBI": { lat: 33.4247, lon: 131.3749, inbound: 079, turn: "RIGHT", mha: "FL150", max_ias: 280 },
    "IDLUP": { lat: 33.4152, lon: 133.7286, inbound: 049, turn: "RIGHT", mha: 9000, max_ias: 230 },
    "ENKOV": { lat: 33.3046, lon: 133.9288, inbound: 063, turn: "RIGHT", mha: 9000, max_ias: 230 },
    "PIPED": { lat: 33.2515, lon: 130.7713, inbound: 079, turn: "LEFT", mha: "FL150", max_ias: 280 },
    "OTOWA": { lat: 33.2485, lon: 135.8813, inbound: 081, turn: "RIGHT", mha: "FL210", max_ias: 280 },
    "AILEY": { lat: 33.2344, lon: 132.6018, inbound: 089, turn: "LEFT", mha: "FL170", max_ias: 280 },
    "YOSHI": { lat: 33.1707, lon: 138.9575, inbound: 036, turn: "RIGHT", mha: "FL220", max_ias: 280 },
    "EKABU": { lat: 33.0868, lon: 130.2087, inbound: 078, turn: "RIGHT", mha: "FL150", max_ias: 280 },
    "NUMKO": { lat: 32.9096, lon: 136.6582, inbound: 056, turn: "RIGHT", mha: "FL250", max_ias: 280 },
    "GULEG": { lat: 32.8760, lon: 138.1673, inbound: 037, turn: "RIGHT", mha: "FL250", max_ias: 280 },
    "TAIME": { lat: 32.8631, lon: 130.4710, inbound: 282, turn: "LEFT", mha: 6000, max_ias: 230 },
    "SHIMIZU":{ lat: 32.7559, lon: 132.9966, inbound: 047, turn: "LEFT", mha: "FL200", max_ias: 280 }, // SUC
    "MEXIR": { lat: 32.8222, lon: 134.0730, inbound: 080, turn: "LEFT", mha: "FL150", max_ias: 280 },
    "SABRI": { lat: 32.7702, lon: 139.7205, inbound: 359, turn: "LEFT", mha: "FL150", max_ias: 280 },
    "NOBEP": { lat: 32.5132, lon: 135.2517, inbound: 002, turn: "RIGHT", mha: "FL210", max_ias: 280 },
    "SUKBO": { lat: 32.4293, lon: 136.0136, inbound: 055, turn: "RIGHT", mha: "FL250", max_ias: 280 },
    "TAPOP": { lat: 32.3381, lon: 136.2727, inbound: 333, turn: "LEFT", mha: "FL210", max_ias: 280 },
    "MEVOL": { lat: 32.2746, lon: 136.0929, inbound: 064, turn: "RIGHT", mha: "FL250", max_ias: 280 },
    "SAILS": { lat: 31.7545, lon: 130.2255, inbound: 212, turn: "RIGHT", mha: "FL160", max_ias: 265 },
    "MIDAI": { lat: 31.6058, lon: 131.3702, inbound: 066, turn: "LEFT", mha: "FL210", max_ias: 280 },
    "OMUSU": { lat: 31.2958, lon: 131.7394, inbound: 041, turn: "LEFT", mha: "FL270", max_ias: 280 },
    "SAPET": { lat: 28.6371, lon: 126.1315, inbound: 237, turn: "RIGHT", mha: "FL160", max_ias: 280 },
    "POMAS": { lat: 28.5041, lon: 130.1442, inbound: 235, turn: "LEFT", mha: "FL240", max_ias: 265 },
    "AME":   { lat: 28.4347, lon: 129.7114, inbound: 213, turn: "RIGHT", mha: "FL240", max_ias: 240 }, // AMAMI
    "ONC":   { lat: 27.4329, lon: 128.6990, inbound: 223, turn: "RIGHT", mha: 10000, max_ias: 220 }, // OKINOERABU
    "NANJO": { lat: 26.1276, lon: 128.2861, inbound: 283, turn: "RIGHT", mha: 8000, max_ias: 230 },
    "RYOSA": { lat: 25.5199, lon: 126.5058, inbound: 061, turn: "RIGHT", mha: 10000, max_ias: 280 },
    "FREED": { lat: 25.4778, lon: 126.5424, inbound: 064, turn: "RIGHT", mha: 8000, max_ias: 230 },
    "SHIMO": { lat: 25.2671, lon: 125.5970, inbound: 234, turn: "LEFT", mha: "FL260", max_ias: 280 },
    "LILRA": { lat: 24.8296, lon: 124.8710, inbound: 227, turn: "LEFT", mha: "FL260", max_ias: 280 },
    "TELMA": { lat: 24.0607, lon: 123.8034, inbound: 054, turn: "RIGHT", mha: 4000, max_ias: 230 }
};