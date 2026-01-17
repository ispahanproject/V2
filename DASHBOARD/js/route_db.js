/**
 * ROUTE_DB: JAL Standard Routing
 * Source: CRS.pdf
 */
const ROUTE_DB = {
    // --- FROM HND (RJTT) ---
    "RJTT-RJCC": [
        { id: "1", dist: "447nm", path: "BRUCE AGRIS Y11 SAMBO Y119 OHMAR Y13 SIRAO Y139 NAVER" },
        { id: "1(CDR)", dist: "491nm", path: "TIARA GUSRO Y20 KIRIN" }
    ],
    "RJTT-RJOO": [
        { id: "1", dist: "240nm", path: "LAXAS Y56 TOHME Y54 KOHWA Y546 AGPUK MIRAI ABENO IKOMA" }
    ],
    "RJTT-RJBB": [
        { id: "1", dist: "255nm", path: "LAXAS Y56 TOHME Y54 KOHWA Y544 DUBKA" }
    ],
    "RJTT-RJFF": [
        { id: "2", dist: "491nm", path: "GUSRO Y20 KIRIN" },
        { id: "3", dist: "492nm", path: "LAYER TIARA GUSRO Y20 KIRIN" }
    ],
    "RJTT-ROAH": [
        { id: "1(CDR)", dist: "876nm", path: "LAXAS Y56 TOHME Y54 KOHWA Y12 AYANO Y128 LAXEL Y52 TONAR Y525 IHEYA" }
    ],

    // --- FROM ITM (RJOO) ---
    "RJOO-RJTT": [
        { id: "1", dist: "251nm", path: "ASUKA SHTLE Y71 XAC" }
    ],
    "RJOO-RJCC": [
        { id: "1", dist: "581nm", path: "MINAC GUJYO Y13 SIRAO Y139 NAVER" }
    ],
    "RJOO-RJFF": [
        { id: "1", dist: "273nm", path: "TIGER SUMAR AYAME SETOH SOUJA Y281 STOUT Y20 KIRIN" }
    ],
    "RJOO-ROAH": [
        { id: "1", dist: "672nm", path: "TIGER MAIKO Y75 ONC Y525 IHEYA" }
    ],

    // --- FROM CTS (RJCC) ---
    "RJCC-RJTT": [
        { id: "1", dist: "447nm", path: "TOBBY Y10 GODIN" },
        { id: "9N", dist: "517nm", path: "CHE MKE TOBBY Y10 DAIGO Y108 MESSE" }
    ],
    "RJCC-RJOO": [
        { id: "1", dist: "619nm", path: "DALBI Y120 TAPPI Y12 ARIKA Y14 GOLDO Y381 KMC Y384 ROKKO KAMEO OTABE ABENO IKOMA" }
    ],

    // --- FROM FUK (RJFF) ---
    "RJFF-RJTT": [
        { id: "1", dist: "512nm", path: "IPRIR Y231 OMKAT Y235 FLUTE Y23 ARTIC Y71 XAC" }
    ],
    "RJFF-RJOO": [
        { id: "1", dist: "285nm", path: "IPRIR Y231 MIRIO Y401 KAINA Y753 IZUMI" }
    ],

    // --- FROM OKA (ROAH) ---
    "ROAH-RJTT": [
        { id: "1(CDR)", dist: "876nm", path: "AMAMI Y574 SHIBK Y57 SUKBO Y571 BILLY Y21 AKSEL" }
    ]
};