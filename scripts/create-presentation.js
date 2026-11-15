const path = require("node:path");
const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "The Coxmox Project";
pptx.subject = "Accessible Earth event exploration through sound and speech";
pptx.title = "The Coxmox - Earth Signals Made Audible";
pptx.company = "The Coxmox";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US",
};
pptx.defineSlideMaster({
  title: "COXMOX",
  background: { color: "101A22" },
  objects: [
    { rect: { x: 0.55, y: 0.55, w: 0.28, h: 0.28, rectRadius: 0.08, line: { color: "B7EFC5", transparency: 100 }, fill: { color: "B7EFC5" } } },
    { text: { text: "THE COXMOX  /  EARTH SIGNALS", options: { x: 0.94, y: 0.56, w: 4.2, h: 0.22, fontFace: "Aptos", fontSize: 9, bold: true, charSpacing: 1.4, color: "B7EFC5", margin: 0 } } },
    { line: { x: 0.6, y: 0.98, w: 12.1, h: 0, line: { color: "2A3A43", width: 0.7 } } },
    { line: { x: 0.6, y: 7.03, w: 12.1, h: 0, line: { color: "2A3A43", width: 0.7 } } },
    { text: { text: "EDUCATIONAL PROTOTYPE  /  NOT AN OFFICIAL NASA PRODUCT", options: { x: 0.62, y: 7.11, w: 7.3, h: 0.16, fontFace: "Aptos", fontSize: 7, charSpacing: 0.8, color: "738583", margin: 0 } } },
  ],
  slideNumber: { x: 12.25, y: 7.1, w: 0.48, h: 0.18, color: "9CAAA8", fontFace: "Aptos", fontSize: 8, align: "right", margin: 0 },
});

const W = 13.333;
const H = 7.5;
const C = {
  bg: "101A22",
  deep: "0C141B",
  panel: "16232C",
  panel2: "1B2A34",
  edge: "2A3A43",
  text: "EEF4ED",
  muted: "9CAAA8",
  quiet: "71817F",
  mint: "B7EFC5",
  green: "4A9D77",
  citrus: "E0EFAE",
  gold: "F0C879",
  cyan: "73C7D3",
  coral: "F18176",
  lilac: "C5A6FF",
  blue: "7AA8F5",
};
const FONT = "Aptos";
const HEAD = "Aptos Display";

function text(slide, value, x, y, w, h, style = {}) {
  slide.addText(value, {
    x, y, w, h,
    margin: 0,
    fontFace: FONT,
    fontSize: 14,
    color: C.text,
    breakLine: false,
    fit: "shrink",
    valign: "mid",
    ...style,
  });
}

function box(slide, x, y, w, h, fill = C.panel, line = C.edge, radius = true) {
  slide.addShape(radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, {
    x, y, w, h,
    rectRadius: 0.12,
    line: { color: line, width: 0.8 },
    fill: { color: fill },
  });
}

function rule(slide, x1, y1, x2, y2, color = C.edge, width = 1) {
  slide.addShape(pptx.ShapeType.line, {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color, width },
  });
}

function dot(slide, x, y, size, color) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x, y, w: size, h: size,
    line: { color, transparency: 100 },
    fill: { color },
  });
}

function pill(slide, label, x, y, w, color = C.mint, fill = "1B342D") {
  box(slide, x, y, w, 0.3, fill, fill, true);
  text(slide, label, x + 0.1, y + 0.025, w - 0.2, 0.23, {
    fontSize: 8,
    bold: true,
    charSpacing: 1.1,
    color,
    align: "center",
  });
}

function section(slide, eyebrow, title, subtitle) {
  text(slide, eyebrow.toUpperCase(), 0.68, 1.18, 8.5, 0.22, {
    fontSize: 9,
    bold: true,
    charSpacing: 1.6,
    color: C.mint,
  });
  text(slide, title, 0.68, 1.47, 11.9, 0.58, {
    fontFace: HEAD,
    fontSize: 29,
    bold: true,
    charSpacing: -0.5,
  });
  if (subtitle) text(slide, subtitle, 0.7, 2.08, 11.8, 0.36, { fontSize: 12, color: C.muted });
}

function addMiniWave(slide, x, y, color, heights, gap = 0.11, barW = 0.055) {
  heights.forEach((height, i) => {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + i * gap,
      y: y + (0.46 - height) / 2,
      w: barW,
      h: height,
      rectRadius: 0.025,
      line: { color, transparency: 100 },
      fill: { color },
    });
  });
}

function addMapMock(slide, x, y, w, h) {
  box(slide, x, y, w, h, "0E1B22", "30424A", true);
  for (let i = 1; i < 6; i++) rule(slide, x + 0.08, y + (h / 6) * i, x + w - 0.08, y + (h / 6) * i, "20333A", 0.5);
  for (let i = 1; i < 8; i++) rule(slide, x + (w / 8) * i, y + 0.08, x + (w / 8) * i, y + h - 0.08, "20333A", 0.5);
  const land = [
    [0.12, 0.2, 0.23, 0.21, "263D37"],
    [0.26, 0.52, 0.16, 0.29, "243B36"],
    [0.46, 0.21, 0.32, 0.2, "263D37"],
    [0.52, 0.47, 0.18, 0.3, "293F37"],
    [0.79, 0.61, 0.12, 0.13, "263D37"],
  ];
  land.forEach(([lx, ly, lw, lh, color]) => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + w * lx, y: y + h * ly, w: w * lw, h: h * lh,
      line: { color, transparency: 100 }, fill: { color },
    });
  });
  [
    [0.19, 0.34, C.coral], [0.3, 0.58, C.gold], [0.57, 0.38, C.cyan],
    [0.65, 0.55, C.lilac], [0.82, 0.7, C.mint], [0.43, 0.28, C.coral],
  ].forEach(([px, py, color]) => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + w * px - 0.055, y: y + h * py - 0.055, w: 0.11, h: 0.11,
      line: { color: "F2F4EF", width: 1 }, fill: { color },
    });
  });
}

// 1. Cover
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, line: { color: C.bg, transparency: 100 }, fill: { color: C.bg } });
  dot(slide, 10.1, 0.85, 2.5, "14272A");
  [2.1, 1.65, 1.2, 0.72].forEach((size, i) => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 11.05 - size / 2, y: 2.1 - size / 2, w: size, h: size,
      line: { color: i % 2 ? "35594D" : "2B4943", width: 1.2 },
      fill: { color: C.bg, transparency: 100 },
    });
  });
  addMiniWave(slide, 8.5, 4.2, C.mint, [0.14, 0.25, 0.36, 0.22, 0.46, 0.31, 0.18, 0.39, 0.26, 0.44, 0.16, 0.3, 0.2, 0.38, 0.24, 0.14], 0.2, 0.08);
  [0, 1, 2, 3].forEach((i) => dot(slide, 9.0 + i * 0.55, 5.2 + (i % 2) * 0.25, 0.07, [C.coral, C.cyan, C.gold, C.lilac][i]));
  pill(slide, "PROJECT PRESENTATION  /  2026", 0.78, 0.75, 2.65);
  text(slide, "THE COXMOX", 0.78, 1.58, 7.0, 0.85, { fontFace: HEAD, fontSize: 47, bold: true, charSpacing: -1.7 });
  text(slide, "Earth signals,\nmade audible.", 0.82, 2.55, 6.4, 1.5, {
    fontFace: HEAD, fontSize: 33, color: C.mint, bold: true, breakLine: false, valign: "mid",
  });
  text(slide, "An accessible Earth events experience through a map,\ninstrumental sound, and a speaking agent.", 0.82, 4.27, 6.4, 0.78, {
    fontSize: 17, color: C.muted, breakLine: false, valign: "top",
  });
  rule(slide, 0.82, 5.46, 5.75, 5.46, "38524F", 1);
  text(slide, "NASA EONET  ·  2 LISTENING MODES  ·  LOCAL INSTRUMENT TRACKS", 0.82, 5.68, 7.05, 0.28, {
    fontSize: 9, bold: true, charSpacing: 0.8, color: C.citrus,
  });
  text(slide, "See Earth change. Hear Earth change.", 0.82, 6.62, 5.5, 0.28, {
    fontSize: 11, bold: true, color: C.text,
  });
  text(slide, "Educational prototype · not an official NASA product", 8.25, 6.65, 4.4, 0.22, {
    fontSize: 8, color: C.quiet, align: "right",
  });
}

// 2. The challenge
{
  const slide = pptx.addSlide("COXMOX");
  section(slide, "01  /  The opportunity", "Earth data is visual. Access should be multi-sensory.", "Maps and imagery reveal change, but a visual-only experience can leave listeners out.");

  const cards = [
    { x: 0.72, color: C.cyan, num: "01", title: "Visuals alone exclude", body: "Blind and low-vision people may not be able to access the central story in a map or animation." },
    { x: 4.82, color: C.gold, num: "02", title: "Science can feel distant", body: "A complex image does not always explain what changed, why it matters, or where to focus." },
    { x: 8.92, color: C.lilac, num: "03", title: "One channel is limiting", body: "Students and curious audiences learn in different ways. Sound can make patterns easier to explore." },
  ];
  cards.forEach((c) => {
    box(slide, c.x, 2.83, 3.68, 2.5, C.panel, C.edge, true);
    pill(slide, c.num, c.x + 0.22, 3.08, 0.55, c.color, "202F37");
    text(slide, c.title, c.x + 0.22, 3.62, 3.2, 0.42, { fontFace: HEAD, fontSize: 17, bold: true });
    text(slide, c.body, c.x + 0.22, 4.14, 3.17, 0.84, { fontSize: 12, color: C.muted, valign: "top", breakLine: false });
  });
  box(slide, 0.72, 5.64, 11.88, 0.9, "1A302A", "315448", true);
  text(slide, "THE COXMOX RESPONSE", 0.98, 5.83, 2.0, 0.2, { fontSize: 8, bold: true, charSpacing: 1.2, color: C.mint });
  text(slide, "Pair an event map with two choices: a unique instrumental soundscape or a speaking agent.", 3.0, 5.75, 9.05, 0.43, { fontSize: 15, bold: true });
  text(slide, "Challenge description is summarized from the project brief; verify final wording against the official challenge page.", 0.76, 6.67, 11.8, 0.18, { fontSize: 8, color: C.quiet });
}

// 3. Product flow
{
  const slide = pptx.addSlide("COXMOX");
  section(slide, "02  /  The idea", "From Earth event to personal listening experience", "The visitor chooses a signal. The app turns event information into either music or spoken context.");

  const stages = [
    { x: 0.72, n: "1", accent: C.cyan, title: "Earth data", body: "NASA EONET open events\nNASA GIBS map imagery\nNOAA ONI climate context" },
    { x: 3.83, n: "2", accent: C.gold, title: "Explore", body: "Browse the global map\nFilter by event category\nSelect a reported event" },
    { x: 6.94, n: "3", accent: C.mint, title: "Translate", body: "Category selects an instrument\nMagnitude influences pitch / rate\nSpeech builds a plain-language summary" },
    { x: 10.05, n: "4", accent: C.lilac, title: "Experience", body: "Instrumental: local WAV loop\nVocal: browser speaking agent\nText remains available" },
  ];
  stages.forEach((s, i) => {
    box(slide, s.x, 2.92, 2.55, 2.63, C.panel, C.edge, true);
    dot(slide, s.x + 0.22, 3.18, 0.35, s.accent);
    text(slide, s.n, s.x + 0.22, 3.18, 0.35, 0.35, { fontSize: 12, bold: true, color: C.bg, align: "center" });
    text(slide, s.title, s.x + 0.22, 3.75, 2.12, 0.35, { fontFace: HEAD, fontSize: 17, bold: true });
    text(slide, s.body, s.x + 0.22, 4.22, 2.13, 1.02, { fontSize: 11, color: C.muted, valign: "top", breakLine: false });
    if (i < stages.length - 1) {
      rule(slide, s.x + 2.68, 4.22, s.x + 3.02, 4.22, "49635C", 1.2);
      dot(slide, s.x + 2.96, 4.16, 0.12, C.mint);
    }
  });
  text(slide, "Important distinction", 0.76, 5.98, 1.55, 0.22, { fontSize: 9, bold: true, color: C.gold });
  text(slide, "EONET drives event markers and descriptions; the NOAA ONI number is separate climate context, not a local hazard signal.", 2.32, 5.94, 9.9, 0.32, { fontSize: 11, color: C.muted });
}

// 4. Interface tour
{
  const slide = pptx.addSlide("COXMOX");
  section(slide, "03  /  Product experience", "A calm dashboard for exploring live Earth events", "A responsive map, focused player, and readable event list keep the next action clear.");
  addMapMock(slide, 0.72, 2.67, 7.25, 3.65);
  pill(slide, "GLOBAL EVENT MAP", 0.98, 2.9, 1.65);
  text(slide, "NASA imagery · selectable event markers", 1.0, 5.92, 4.9, 0.2, { fontSize: 9, color: C.muted });

  box(slide, 8.22, 2.67, 4.36, 1.26, C.panel, C.edge, true);
  text(slide, "CHOOSE HOW TO LISTEN", 8.48, 2.88, 2.6, 0.18, { fontSize: 8, bold: true, charSpacing: 1, color: C.quiet });
  pill(slide, "INSTRUMENTAL", 8.48, 3.18, 1.45, C.mint, "1B342D");
  pill(slide, "VOCAL AGENT", 10.1, 3.18, 1.5, C.citrus, "302F25");
  box(slide, 8.22, 4.13, 4.36, 1.06, "1A302A", "315448", true);
  text(slide, "NOW EXPLORING", 8.48, 4.34, 1.8, 0.18, { fontSize: 8, bold: true, charSpacing: 1, color: C.mint });
  text(slide, "Wildfire Red Hill", 8.48, 4.61, 3.65, 0.28, { fontSize: 15, bold: true });
  text(slide, "Marimba · plucked percussion", 8.48, 4.91, 3.65, 0.18, { fontSize: 9, color: C.muted });
  box(slide, 8.22, 5.4, 4.36, 0.92, C.panel, C.edge, true);
  text(slide, "EVENT LIST", 8.48, 5.58, 1.3, 0.18, { fontSize: 8, bold: true, charSpacing: 1, color: C.quiet });
  dot(slide, 8.5, 5.93, 0.1, C.coral);
  text(slide, "Wildfires · select to play", 8.72, 5.86, 2.7, 0.23, { fontSize: 10, color: C.text });
  text(slide, "Filters · optional location · stop control", 0.75, 6.57, 7.8, 0.2, { fontSize: 9, color: C.muted });
}

// 5. Instrumental mappings
{
  const slide = pptx.addSlide("COXMOX");
  section(slide, "04  /  Instrumental mode", "Each event category has its own musical identity", "Fourteen original local WAV loops: thirteen category mappings plus fallback chimes.");
  const left = [
    ["Wildfires", "Marimba", C.coral],
    ["Severe storms", "French horn", C.cyan],
    ["Volcanoes", "Pipe organ", C.coral],
    ["Floods", "Piano", C.blue],
    ["Sea and lake ice", "Glockenspiel", C.cyan],
    ["Earthquakes", "Timpani", C.lilac],
    ["Drought", "Flute", C.gold],
  ];
  const right = [
    ["Dust and haze", "Clarinet", C.gold],
    ["Landslides", "Cello", C.coral],
    ["Snow", "Celesta", C.cyan],
    ["Temperature extremes", "Muted trumpet", C.gold],
    ["Water color", "Harp", C.mint],
    ["Human-caused events", "Synth bass", C.lilac],
    ["Other / unknown", "Chimes (fallback)", C.muted],
  ];
  function mappingColumn(items, x) {
    items.forEach((item, i) => {
      const y = 2.75 + i * 0.48;
      box(slide, x, y, 5.72, 0.39, i % 2 ? "14212A" : C.panel, "26363E", true);
      dot(slide, x + 0.15, y + 0.14, 0.1, item[2]);
      text(slide, item[0], x + 0.38, y + 0.08, 2.55, 0.22, { fontSize: 10, color: C.text });
      text(slide, item[1], x + 3.15, y + 0.08, 2.27, 0.22, { fontSize: 10, bold: true, color: C.mint });
    });
  }
  mappingColumn(left, 0.73);
  mappingColumn(right, 6.88);
  box(slide, 0.73, 6.25, 11.87, 0.48, "1A302A", "315448", true);
  text(slide, "Design rule", 0.96, 6.38, 0.92, 0.18, { fontSize: 9, bold: true, color: C.mint });
  text(slide, "Reported magnitude changes pitch / playback rate slightly; loudness is not used to encode severity.", 1.95, 6.36, 10.1, 0.2, { fontSize: 10, color: C.text });
}

// 6. Vocal agent and accessibility
{
  const slide = pptx.addSlide("COXMOX");
  section(slide, "05  /  Vocal mode", "A speaking agent turns event details into plain language", "The app speaks after a visitor chooses Vocal mode and selects an event.");
  box(slide, 0.72, 2.72, 5.7, 3.3, C.panel, C.edge, true);
  text(slide, "SAMPLE VOCAL DESCRIPTION", 1.02, 3.0, 3.8, 0.2, { fontSize: 9, bold: true, charSpacing: 1.1, color: C.citrus });
  text(slide, "\"Wildfires signal. Wildfire Red Hill, Perry, Mississippi. Last reported November 12. Reported magnitude: 519 acres. This is informational data, not an official warning.\"", 1.02, 3.42, 4.95, 1.32, {
    fontFace: HEAD, fontSize: 19, bold: true, color: C.text, valign: "top", breakLine: false,
  });
  rule(slide, 1.02, 5.13, 5.95, 5.13, C.edge, 0.9);
  text(slide, "Browser speech synthesis · on-demand event narration", 1.02, 5.37, 4.98, 0.26, { fontSize: 10, color: C.muted });

  const features = [
    ["Voice input", "Supported browsers can recognize spoken commands."],
    ["Keyboard", "V voice · N nearby · G guidance · P storm trend · S stop."],
    ["Text stays visible", "Descriptions and state remain on screen for non-audio use."],
    ["Location is optional", "Share a location or click the map to set one manually."],
  ];
  features.forEach((f, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 6.8 + col * 2.98, y = 2.78 + row * 1.58;
    box(slide, x, y, 2.75, 1.38, C.panel, C.edge, true);
    text(slide, f[0], x + 0.2, y + 0.22, 2.32, 0.26, { fontSize: 13, bold: true, color: i === 0 ? C.citrus : C.mint });
    text(slide, f[1], x + 0.2, y + 0.59, 2.32, 0.58, { fontSize: 9, color: C.muted, valign: "top" });
  });
  text(slide, "Voice commands require microphone permission and compatible browser support.", 6.83, 6.18, 5.5, 0.22, { fontSize: 9, color: C.quiet });
}

// 7. Accessibility and resilience
{
  const slide = pptx.addSlide("COXMOX");
  section(slide, "06  /  Inclusive by design", "More than one way to explore, listen, and navigate", "Accessibility is a product goal; formal screen-reader and WCAG testing remains a next step.");
  const items = [
    ["Keyboard-ready", "Visible focus, skip link, labeled controls, and shortcuts."],
    ["Screen-reader context", "Live announcements and event descriptions accompany map changes."],
    ["Reduced motion", "Map movement respects the operating-system preference."],
    ["No autoplay", "Sound starts only after a visitor chooses an event or Play."],
    ["Offline-safe events", "Bundled demo events appear when the initial EONET request fails."],
    ["Clear boundaries", "Location permission is optional; reports are not official alerts."],
  ];
  items.forEach((it, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.72 + col * 4.08, y = 2.77 + row * 1.62;
    box(slide, x, y, 3.75, 1.38, C.panel, C.edge, true);
    dot(slide, x + 0.22, y + 0.24, 0.13, [C.mint, C.cyan, C.gold, C.lilac, C.green, C.coral][i]);
    text(slide, it[0], x + 0.48, y + 0.18, 2.95, 0.28, { fontFace: HEAD, fontSize: 14, bold: true });
    text(slide, it[1], x + 0.22, y + 0.62, 3.2, 0.54, { fontSize: 10, color: C.muted, valign: "top" });
  });
  box(slide, 0.72, 6.2, 11.9, 0.5, "30251F", "614B32", true);
  text(slide, "SAFETY", 0.96, 6.34, 0.7, 0.16, { fontSize: 8, bold: true, charSpacing: 1.1, color: C.gold });
  text(slide, "Storm movement is a simple trend estimate, not a forecast. Always follow local emergency authorities.", 1.75, 6.3, 10.4, 0.22, { fontSize: 10, color: C.text });
}

// 8. Technology
{
  const slide = pptx.addSlide("COXMOX");
  section(slide, "07  /  How it is built", "A lightweight browser app with live sources and local sound", "The shipped prototype uses Vite, vanilla JavaScript, Leaflet, and browser speech/audio capabilities.");

  const columns = [
    { x: 0.73, w: 3.4, color: C.cyan, tag: "PUBLIC DATA", title: "Earth sources", lines: "NASA EONET  /  open natural events\nNASA GIBS  /  map imagery\nNOAA CPC ONI  /  climate context" },
    { x: 4.97, w: 3.4, color: C.mint, tag: "THE COXMOX APP", title: "Explore + translate", lines: "Vite-served browser interface\nLeaflet map + category filters\n13 instrument mappings + WAV files" },
    { x: 9.2, w: 3.4, color: C.citrus, tag: "USER EXPERIENCE", title: "Two outputs", lines: "Local instrumental loops\nSpeechSynthesis event narration\nOptional voice input / location" },
  ];
  columns.forEach((c, i) => {
    box(slide, c.x, 2.9, c.w, 2.65, C.panel, C.edge, true);
    pill(slide, c.tag, c.x + 0.22, 3.13, 1.55, c.color, "202F37");
    text(slide, c.title, c.x + 0.22, 3.65, c.w - 0.42, 0.35, { fontFace: HEAD, fontSize: 19, bold: true });
    text(slide, c.lines, c.x + 0.22, 4.17, c.w - 0.42, 1.0, { fontSize: 11, color: C.muted, valign: "top" });
    if (i < 2) {
      rule(slide, c.x + c.w + 0.13, 4.19, c.x + c.w + 0.65, 4.19, "49635C", 1.3);
      dot(slide, c.x + c.w + 0.58, 4.13, 0.12, C.mint);
    }
  });
  text(slide, "Reliability note", 0.77, 5.94, 1.4, 0.2, { fontSize: 9, bold: true, color: C.gold });
  text(slide, "NASA event demo data is bundled for initial-load failure; live services and map tiles still need internet access.", 2.13, 5.9, 9.9, 0.3, { fontSize: 10, color: C.muted });
}

// 9. Demo script
{
  const slide = pptx.addSlide("COXMOX");
  section(slide, "08  /  Live demo", "A two-minute story: choose, listen, understand", "Keep the demo focused on one event and show the two modes back-to-back.");
  const beats = [
    ["00:00", "Orient", "Show the event map and live-data status."],
    ["00:20", "Select", "Choose a wildfire marker or event in the list."],
    ["00:40", "Listen", "Play its marimba track; point out the category mapping."],
    ["01:00", "Switch", "Select Vocal agent; hear the event details spoken."],
    ["01:25", "Explain", "Show the optional controls and state the safety limits."],
  ];
  beats.forEach((b, i) => {
    const y = 2.74 + i * 0.67;
    pill(slide, b[0], 0.78, y + 0.03, 0.78, C.mint, "1B342D");
    text(slide, b[1], 1.85, y, 1.35, 0.3, { fontFace: HEAD, fontSize: 15, bold: true });
    text(slide, b[2], 3.23, y + 0.02, 8.55, 0.29, { fontSize: 12, color: C.muted });
    if (i < beats.length - 1) rule(slide, 1.17, y + 0.37, 1.17, y + 0.65, "35554B", 1);
  });
  box(slide, 0.78, 6.27, 11.78, 0.48, "192A31", C.edge, true);
  text(slide, "CLOSING LINE", 1.0, 6.39, 1.25, 0.16, { fontSize: 8, bold: true, charSpacing: 1, color: C.citrus });
  text(slide, "\"This is an educational interpretation of Earth data, not an official warning or forecast.\"", 2.34, 6.35, 9.85, 0.23, { fontSize: 11, italic: true, color: C.text });
}

// 10. Boundaries, next steps, and references
{
  const slide = pptx.addSlide("COXMOX");
  section(slide, "09  /  Responsible use", "Make the signal clearer. Keep the limits clear too.", "The project is a learning and accessibility prototype, not an emergency service.");
  box(slide, 0.72, 2.76, 5.72, 2.65, "30251F", "614B32", true);
  text(slide, "WHAT IT DOES NOT CLAIM", 1.02, 3.02, 3.4, 0.22, { fontSize: 9, bold: true, charSpacing: 1.1, color: C.gold });
  text(slide, "Not an official NASA product\nNot a warning or forecasting system\nNot a substitute for local authorities\nNot a scientific measurement of sound", 1.02, 3.46, 4.95, 1.36, { fontSize: 15, bold: true, color: C.text, breakLine: false, valign: "top" });

  box(slide, 6.83, 2.76, 5.76, 2.65, C.panel, C.edge, true);
  text(slide, "NEXT VALIDATION STEPS", 7.13, 3.02, 3.35, 0.22, { fontSize: 9, bold: true, charSpacing: 1.1, color: C.mint });
  text(slide, "Test with blind and low-vision listeners\nRun NVDA / VoiceOver keyboard walkthroughs\nVerify challenge brief and image-use terms\nDeploy the demo and measure load / access", 7.13, 3.46, 4.98, 1.36, { fontSize: 14, color: C.text, breakLine: false, valign: "top" });

  rule(slide, 0.78, 5.72, 12.55, 5.72, C.edge, 0.8);
  text(slide, "REFERENCE STARTING POINTS", 0.8, 5.91, 2.4, 0.18, { fontSize: 8, bold: true, charSpacing: 1.1, color: C.quiet });
  text(slide, "NASA EONET  ·  eonet.gsfc.nasa.gov/docs/v3     NASA GIBS  ·  gibs.earthdata.nasa.gov     NOAA CPC ONI  ·  cpc.ncep.noaa.gov", 0.8, 6.18, 11.7, 0.24, { fontSize: 9, color: C.muted });
  text(slide, "Verify the current official challenge brief, judging criteria, and reuse guidance before submission.", 0.8, 6.55, 11.7, 0.2, { fontSize: 8, color: C.gold });
  text(slide, "See Earth change. Hear Earth change.", 8.35, 6.78, 4.0, 0.16, { fontFace: HEAD, fontSize: 9, bold: true, color: C.mint, align: "right" });
}

const output = path.resolve(__dirname, "..", "THE_COXMOX_PROJECT_PRESENTATION.pptx");
pptx.writeFile({ fileName: output })
  .then(() => console.log(`Created ${output}`))
  .catch((error) => {
    console.error("Could not create the presentation:", error);
    process.exitCode = 1;
  });
