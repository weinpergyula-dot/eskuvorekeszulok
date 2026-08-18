const pptxgen = require('pptxgenjs');

const NAVY = "1E2761";
const ICE  = "CADCFC";
const INK  = "2B3245";
const MUTE = "6B7280";
const PANEL= "F3F6FC";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
const s = pres.addSlide();
s.background = { color: "FFFFFF" };

// ---- Title -------------------------------------------------------------
s.addText("GRIP – Scope", {
  x: 0.5, y: 0.28, w: 7.5, h: 0.55, margin: 0,
  fontFace: "Cambria", fontSize: 32, bold: true, color: NAVY, valign: "middle"
});
s.addText("STEP 2 és STEP 3 fejlesztési tételek", {
  x: 0.5, y: 0.84, w: 7.5, h: 0.32, margin: 0,
  fontFace: "Calibri", fontSize: 13, color: MUTE, valign: "middle"
});
s.addText([
  { text: "17", options: { fontSize: 30, bold: true, color: NAVY, fontFace: "Cambria" } },
  { text: "  tétel", options: { fontSize: 13, color: MUTE, fontFace: "Calibri" } }
], { x: 10.0, y: 0.42, w: 2.83, h: 0.6, margin: 0, align: "right", valign: "middle" });

const L = 0.5, R = 12.83, W = R - L;      // 12.33
const COL_W = (W - 0.2) / 2;              // 6.065
const COLX  = [L + 0.25, L + 0.25 + COL_W + 0.2];
const CHIP_W = 1.62, GAP = 0.12;
const DESC_X = CHIP_W + GAP + 0.06;
const DESC_W = COL_W - DESC_X - 0.35;
const PITCH = 0.47;

function panel(y, h) {
  s.addShape(pres.ShapeType.roundRect, {
    x: L, y: y, w: W, h: h, rectRadius: 0.08, fill: { color: PANEL }, line: { color: "E3E9F5", width: 0.75 }
  });
}
function pill(text, x, y) {
  s.addShape(pres.ShapeType.roundRect, {
    x: x, y: y, w: 1.05, h: 0.32, rectRadius: 0.16, fill: { color: NAVY }, line: { color: NAVY, width: 0 }
  });
  s.addText(text, {
    x: x, y: y, w: 1.05, h: 0.32, margin: 0,
    fontFace: "Calibri", fontSize: 11.5, bold: true, color: "FFFFFF", align: "center", valign: "middle"
  });
}
function row(cat, desc, x, y) {
  s.addShape(pres.ShapeType.roundRect, {
    x: x, y: y, w: CHIP_W, h: 0.34, rectRadius: 0.07, fill: { color: ICE }, line: { color: ICE, width: 0 }
  });
  s.addText(cat, {
    x: x, y: y, w: CHIP_W, h: 0.34, margin: 0,
    fontFace: "Calibri", fontSize: 8.5, bold: true, color: NAVY, align: "center", valign: "middle", shrinkText: true
  });
  s.addText(desc, {
    x: x + DESC_X, y: y - 0.04, w: DESC_W, h: 0.42, margin: 0,
    fontFace: "Calibri", fontSize: 10.5, color: INK, valign: "middle", lineSpacingMultiple: 0.9
  });
}

// ---- STEP 2 ------------------------------------------------------------
panel(1.32, 1.10);
pill("STEP 2", L + 0.25, 1.47);
s.addText("2 tétel", { x: L + 1.4, y: 1.47, w: 1.6, h: 0.32, margin: 0,
  fontFace: "Calibri", fontSize: 10, color: MUTE, valign: "middle" });

const step2 = [
  ["TV SALES", "TV new sales (+riporting cr)"],
  ["BILLING",  "New bill display and payment features in the app"],
];
step2.forEach((r, i) => row(r[0], r[1], COLX[i], 1.93));

// ---- STEP 3 ------------------------------------------------------------
panel(2.62, 4.43);
pill("STEP 3", L + 0.25, 2.77);
s.addText("15 tétel", { x: L + 1.4, y: 2.77, w: 1.6, h: 0.32, margin: 0,
  fontFace: "Calibri", fontSize: 10, color: MUTE, valign: "middle" });

const step3 = [
  ["TV ADDON",            "TV add-on manipuláció (+riporting cr)"],
  ["ISP CHANGE",          "Fixed internet sales with ISP change (from ONE only)"],
  ["NETPAJZS",            "Netpajzs – GPON"],
  ["GYERMEKVÉDELEM",      "Gyermekvédelmi tartalomszűrő add-on manipuláció App-on"],
  ["IDŐPONTMÓDOSÍTÁS",    "Install date / details / contact modification on App native"],
  ["BILLING",             "Collection"],
  ["BILLING",             "Electronic call detailer (Hívásrészletező)"],
  ["BILLING",             "Non telco (SAP) bills"],
  ["CUSTOMER DATA MOD.",  "Személyes és lakcím adatok módosítása az Appon"],
  ["CUSTOMER COMM.",      "Negatív ágas üzenetek optimalizálása és chat indítás kiterjesztése"],
  ["CAMPAIGN",            "Termékkatalógus integráció"],
  ["CAMPAIGN",            "Web service worker bekötése – Kampány management rendszer"],
  ["LEAD KEZELÉS",        "Digital lead kezelés – keress, amikor"],
  ["LEAD KEZELÉS",        "Digital lead kezelés – keress hamar"],
  ["LEAD KEZELÉS",        "Digital lead kezelés – nem található cím"],
];
const TOP = 3.20, SPLIT = 8;
step3.forEach((r, i) => {
  const col = i < SPLIT ? 0 : 1;
  const idx = i < SPLIT ? i : i - SPLIT;
  row(r[0], r[1], COLX[col], TOP + idx * PITCH);
});

s.addNotes("GRIP scope áttekintő: STEP 2 (2 tétel) és STEP 3 (15 tétel) fejlesztési elemek.");

pres.writeFile({ fileName: process.argv[2] }).then(f => console.log("wrote", f));
