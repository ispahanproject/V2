/**
 * AIRWAY_DB: RNAV Route Definitions & Waypoints
 * Source: AIP Japan ENR 3.3 (RNAVRTE.pdf)
 * * 1. WAYPOINTS: Intersections/Points not in NAV_DB
 * 2. AIRWAYS: Sequence of points (VORs + Waypoints)
 */

const WAYPOINTS = {
    // --- Y10 (Hokkaido - Kanto) ---
    "LUMIN": { lat: 45.7500, lon: 141.8383 },
    "YOROI": { lat: 45.0086, lon: 141.7856 },
    "RUMOI": { lat: 43.6994, lon: 141.7292 },
    "LARCH": { lat: 41.5031, lon: 141.7986 },
    "PANSY": { lat: 40.0039, lon: 141.3200 },
    "VINAR": { lat: 38.7606, lon: 140.9319 },
    "ZAHAN": { lat: 38.5592, lon: 140.8722 },
    "ORORI": { lat: 38.2344, lon: 140.7769 },
    "RUBIS": { lat: 37.7475, lon: 140.6356 },
    "ASHRA": { lat: 37.2544, lon: 140.4942 },
    "SASAP": { lat: 37.1819, lon: 140.4733 },
    "GUSGI": { lat: 36.9272, lon: 140.4014 },
    "DAIGO": { lat: 36.7444, lon: 140.3497 },
    "TEDIX": { lat: 36.6311, lon: 140.3269 },
    "GODIN": { lat: 36.4069, lon: 140.2822 },

    // --- Y11 (Hokkaido - Kanto Inland) ---
    "NAVER": { lat: 42.1289, lon: 141.5247 },
    "IBURI": { lat: 41.9331, lon: 141.4697 },
    "NONUT": { lat: 41.8514, lon: 141.4467 },
    "CAPLY": { lat: 41.2981, lon: 141.2919 },
    "JYONA": { lat: 40.8089, lon: 141.1575 },
    "SAMBO": { lat: 40.1878, lon: 140.9503 },
    "PEONY": { lat: 39.8406, lon: 140.8333 },
    "VARSU": { lat: 39.5011, lon: 140.7203 },
    "HANKA": { lat: 39.0183, lon: 140.5614 },
    "SHIRO": { lat: 37.6133, lon: 140.1531 },
    "SADVO": { lat: 37.5314, lon: 140.1317 },
    "SYOEN": { lat: 37.0386, lon: 140.0039 },
    "YAITA": { lat: 36.8753, lon: 139.9619 },
    "AGRIS": { lat: 36.4208, lon: 139.9425 },

    // --- Y13 (Hokkaido East) ---
    "SIRAO": { lat: 41.9661, lon: 141.3156 },
    "IDEMI": { lat: 41.8881, lon: 141.2761 },
    "TIKYU": { lat: 41.6842, lon: 141.1725 },
    "MEKAB": { lat: 41.4575, lon: 141.0606 },
    "OHMAR": { lat: 41.3094, lon: 140.9878 },
    "SMELT": { lat: 40.8950, lon: 140.7817 },
    "BENNY": { lat: 39.0289, lon: 139.6922 },
    "BASIN": { lat: 38.1211, lon: 138.9419 },
    "KROBE": { lat: 36.5536, lon: 137.6978 },
    "GOHEI": { lat: 36.1978, lon: 137.3578 },
    "GUJYO": { lat: 35.3642, lon: 136.5772 },

    // --- Y20 (Tokai - West) ---
    "GUSRO": { lat: 35.6625, lon: 139.1369 },
    "LEBOS": { lat: 35.6411, lon: 138.6697 },
    "MADEG": { lat: 35.6161, lon: 138.1992 },
    "SUGAL": { lat: 35.5931, lon: 137.7947 },
    "TOLUM": { lat: 35.5733, lon: 137.5289 },
    "ENDAG": { lat: 35.5131, lon: 137.2531 },
    "MORVA": { lat: 35.3272, lon: 136.4261 },
    "ARASI": { lat: 35.1819, lon: 135.7983 },
    "GINJI": { lat: 35.0944, lon: 135.2808 },
    
    // --- Y28 (West - Setouchi) ---
    "NINOX": { lat: 35.4981, lon: 139.1647 },
    "BIVET": { lat: 35.4739, lon: 138.6769 },
    "ISPOR": { lat: 35.4467, lon: 138.1694 },
    "KIDAX": { lat: 35.4242, lon: 137.7833 },
    "IPLES": { lat: 35.4078, lon: 137.5628 },
    "IDNIL": { lat: 35.3056, lon: 137.0969 },
    "BIWWA": { lat: 35.1161, lon: 136.2561 },
    "ADGUN": { lat: 35.0625, lon: 136.0214 },
    "MIDER": { lat: 35.0169, lon: 135.8261 },
    "SANDA": { lat: 34.9306, lon: 135.3622 },
    "HYOGO": { lat: 34.8586, lon: 134.9956 },
    "ASANO": { lat: 34.7928, lon: 134.6467 },
    "OLIVE": { lat: 34.7550, lon: 134.4500 },
    "BIZEN": { lat: 34.7100, lon: 134.2150 },
    "PIONE": { lat: 34.6714, lon: 134.0150 },
    "DANGO": { lat: 34.5478, lon: 133.6150 },
    "WASYU": { lat: 34.4717, lon: 133.3836 },
    "BINGO": { lat: 34.4072, lon: 133.1781 },
    "BAMBO": { lat: 34.3133, lon: 132.8839 },
    "ONDOC": { lat: 34.2094, lon: 132.5556 },
    "MARCO": { lat: 34.0794, lon: 132.1472 },
    "CLIPA": { lat: 33.9931, lon: 131.7600 },
    "HIZET": { lat: 33.8717, lon: 131.2258 },
    "ACTIE": { lat: 33.6994, lon: 130.4872 },

    // --- Y23 (Tokai - South Coast) ---
    "ARTIC": { lat: 34.7156, lon: 138.8044 },
    "BOKJO": { lat: 34.5422, lon: 138.3850 },
    "ENSYU": { lat: 34.5433, lon: 138.0342 },
    "BOGON": { lat: 34.5425, lon: 137.5956 },
    "GAKKI": { lat: 34.7478, lon: 137.6806 },
    "FLUTE": { lat: 34.5386, lon: 136.9636 },
    "ELMIR": { lat: 34.3628, lon: 136.1233 },
    "ANSUM": { lat: 34.1164, lon: 134.9953 },
    "UKAKO": { lat: 33.9472, lon: 134.2514 },
    "AVNUT": { lat: 33.7822, lon: 133.5458 },
    "SPIDE": { lat: 33.6444, lon: 132.9717 },
    "BEGOP": { lat: 33.4383, lon: 132.3489 },
    "OOITA": { lat: 33.2203, lon: 131.7033 }
};

const AIRWAYS = {
    "Y10": ["WKE", "YOROI", "RUMOI", "CHE", "TOBBY", "LARCH", "PANSY", "HPE", "VINAR", "ZAHAN", "ORORI", "RUBIS", "ASHRA", "SASAP", "GUSGI", "DAIGO", "TEDIX", "GODIN"],
    "Y11": ["CHE", "NAVER", "IBURI", "NONUT", "CAPLY", "HWE", "TAXIR", "HIBAR", "BYOBU", "MRE", "YACHI", "HINAI", "ORUMU", "WAPPA", "MEMEB", "YTE", "SHIRO", "SADVO", "SYOEN", "YAITA", "AGRIS", "TNT"],
    "Y12": ["CHE", "HWE", "TAPPI", "ARIKA", "OTOME", "GTC", "IPKIL", "FINGA", "ISDAM", "KIBOM", "MBE", "MATPI", "IPNUN", "TOLUM", "NAKTU", "POTEB", "KOHWA", "SHIMA", "AYANO", "RAYJO", "KEC", "OSTOD", "LAXEL"],
    "Y13": ["CHE", "SIRAO", "IDEMI", "TIKYU", "MEKAB", "OHMAR", "SMELT", "MRE", "AKITA", "BENNY", "BASIN", "GTC", "KROBE", "GOHEI", "GUJYO"],
    "Y14": ["TCE", "OLDUS", "NODUK", "BOKSO", "MKE", "HWE", "ARIKA", "NYUDO", "GOLDO", "TATAM", "HOTAL", "SAMON", "SUGNO", "MIHOU", "BESMU", "OLTUN", "STOUT", "DGC"],
    "Y20": ["GUSRO", "LEBOS", "MADEG", "SUGAL", "TOLUM", "ENDAG", "MORVA", "ARASI", "GINJI", "KCE", "WAKIT", "KAMMY", "CLOVE", "BASIL", "SUNPI", "RUVEK", "STOUT", "KIRIN", "EBISU", "IKE"],
    "Y28": ["NINOX", "BIVET", "ISPOR", "KIDAX", "IPLES", "IDNIL", "KCC", "BIWWA", "ADGUN", "MIDER", "SANDA", "HYOGO", "ASANO", "OLIVE", "BIZEN", "PIONE", "DANGO", "WASYU", "BINGO", "BAMBO", "ONDOC", "MARCO", "CLIPA", "HIZET", "ACTIE", "DGC", "ISAKY"],
    "Y23": ["ARTIC", "BOKJO", "ENSYU", "BOGON", "GAKKI", "FLUTE", "ELMIR", "ANSUM", "UKAKO", "AVNUT", "SPIDE", "BEGOP", "OOITA"]
};