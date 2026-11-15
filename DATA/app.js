import L from "leaflet";
import "leaflet/dist/leaflet.css";

(() => {
  "use strict";

  /* ================= Config ================= */
  const EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=150";
  const ONI_URL = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt";
  const REFRESH_NORMAL = 10 * 60 * 1000; // 10 minutes
  const REFRESH_ECO = 30 * 60 * 1000;    // 30 minutes
  const reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const COLORS = {
    wildfires: "#ff7a1a",
    severeStorms: "#5cc8ff",
    volcanoes: "#ff4d4d",
    floods: "#3b82f6",
    seaLakeIce: "#b8f0ff",
    earthquakes: "#c084fc",
    drought: "#d9a441",
    dustHaze: "#c2a878",
    landslides: "#8b6b4a",
    snow: "#d6e8ff",
    temperatureExtremes: "#ff9f70",
    waterColor: "#69d8c6",
    manmade: "#c5a6ff",
    default: "#9aa6d6",
  };

  const INSTRUMENTS = {
    wildfires: { name: "Marimba", style: "plucked percussion", wave: "triangle", base: 392, scale: [0, 3, 7, 10], pattern: [0, 2, 1, 3, 2, 1], step: 290, length: 0.28, peak: 0.1, harmonic: 2 },
    severeStorms: { name: "French horn", style: "warm brass", wave: "sawtooth", base: 196, scale: [0, 5, 7, 10], pattern: [0, 2, 3, 1, 2], step: 480, length: 0.44, peak: 0.045, harmonic: 1.5 },
    volcanoes: { name: "Pipe organ", style: "low sustained tones", wave: "sine", base: 174.6, scale: [0, 3, 7, 10], pattern: [0, 1, 3, 2], step: 520, length: 0.62, peak: 0.075, harmonic: 2 },
    floods: { name: "Piano", style: "flowing notes", wave: "triangle", base: 261.6, scale: [0, 2, 4, 7], pattern: [0, 2, 1, 3, 2, 1], step: 300, length: 0.34, peak: 0.09, harmonic: 3 },
    seaLakeIce: { name: "Glockenspiel", style: "bright glass bells", wave: "sine", base: 523.3, scale: [0, 2, 4, 7], pattern: [0, 2, 1, 3, 2], step: 430, length: 0.8, peak: 0.07, harmonic: 2 },
    earthquakes: { name: "Timpani", style: "deep struck drum", wave: "sine", base: 98, scale: [0, 7, 5], pattern: [0, 2, 1, 2], step: 560, length: 0.42, peak: 0.11, harmonic: 1.5 },
    drought: { name: "Flute", style: "airy melody", wave: "sine", base: 349.2, scale: [0, 2, 5, 7], pattern: [0, 1, 3, 2], step: 470, length: 0.56, peak: 0.065, harmonic: 2 },
    dustHaze: { name: "Clarinet", style: "reedy, measured notes", wave: "triangle", base: 293.7, scale: [0, 3, 5, 8], pattern: [0, 1, 2, 1, 3], step: 390, length: 0.4, peak: 0.07, harmonic: 3 },
    landslides: { name: "Cello", style: "low bowed phrase", wave: "sawtooth", base: 146.8, scale: [0, 3, 5, 7], pattern: [0, 1, 3, 2], step: 520, length: 0.58, peak: 0.04, harmonic: 2 },
    snow: { name: "Celesta", style: "soft, crystalline notes", wave: "sine", base: 587.3, scale: [0, 2, 5, 9], pattern: [0, 2, 3, 1], step: 510, length: 0.72, peak: 0.06, harmonic: 2 },
    temperatureExtremes: { name: "Muted trumpet", style: "bright rising phrase", wave: "triangle", base: 311.1, scale: [0, 4, 7, 9], pattern: [0, 1, 3, 2, 3], step: 330, length: 0.36, peak: 0.065, harmonic: 3 },
    waterColor: { name: "Harp", style: "flowing plucked notes", wave: "sine", base: 440, scale: [0, 2, 7, 9], pattern: [0, 2, 1, 3, 2], step: 360, length: 0.62, peak: 0.065, harmonic: 2 },
    manmade: { name: "Synth bass", style: "steady electronic pulse", wave: "square", base: 130.8, scale: [0, 3, 7, 10], pattern: [0, 2, 0, 3], step: 420, length: 0.3, peak: 0.035, harmonic: 2 },
    default: { name: "Chimes", style: "clear bell notes", wave: "sine", base: 440, scale: [0, 4, 7, 11], pattern: [0, 2, 1, 3], step: 390, length: 0.58, peak: 0.07, harmonic: 2 },
  };

  const AUDIO_TRACKS = {
    wildfires: new URL("./audio/wildfires.wav", import.meta.url).href,
    severeStorms: new URL("./audio/severe-storms.wav", import.meta.url).href,
    volcanoes: new URL("./audio/volcanoes.wav", import.meta.url).href,
    floods: new URL("./audio/floods.wav", import.meta.url).href,
    seaLakeIce: new URL("./audio/sea-lake-ice.wav", import.meta.url).href,
    earthquakes: new URL("./audio/earthquakes.wav", import.meta.url).href,
    drought: new URL("./audio/drought.wav", import.meta.url).href,
    dustHaze: new URL("./audio/dust-haze.wav", import.meta.url).href,
    landslides: new URL("./audio/landslides.wav", import.meta.url).href,
    snow: new URL("./audio/snow.wav", import.meta.url).href,
    temperatureExtremes: new URL("./audio/temperature-extremes.wav", import.meta.url).href,
    waterColor: new URL("./audio/water-color.wav", import.meta.url).href,
    manmade: new URL("./audio/manmade.wav", import.meta.url).href,
    default: new URL("./audio/chimes.wav", import.meta.url).href,
  };

  // Plain safety tips spoken with guidance. Short on purpose.
  const TIPS = {
    wildfires: "Move upwind and away from smoke. Cover nose and mouth if smoke is heavy.",
    severeStorms: "Go to a sturdy building and stay indoors. Do not travel unless told to.",
    floods: "Move to higher ground. Never walk or drive through flood water.",
    volcanoes: "Stay away from the area. Cover nose and mouth against ash.",
    earthquakes: "If shaking, drop, cover and hold on. Stay away from damaged buildings.",
    landslides: "Move away from steep slopes and stay off roads near them.",
    default: "Stay informed and follow local authorities.",
  };

  // Backup data so the app still works if the NASA request fails on first load.
  const DEMO_EVENTS = [
    { id: "demo1", title: "Demo wildfire", categories: [{ id: "wildfires", title: "Wildfires" }],
      geometry: [{ date: "2026-11-14T00:00:00Z", type: "Point", coordinates: [78.0, 22.0], magnitudeValue: 5000, magnitudeUnit: "acres" }] },
    { id: "demo2", title: "Demo cyclone", categories: [{ id: "severeStorms", title: "Severe Storms" }],
      geometry: [
        { date: "2026-11-13T00:00:00Z", type: "Point", coordinates: [88.0, 12.0], magnitudeValue: 90, magnitudeUnit: "kts" },
        { date: "2026-11-14T00:00:00Z", type: "Point", coordinates: [86.0, 14.0], magnitudeValue: 90, magnitudeUnit: "kts" },
      ] },
    { id: "demo3", title: "Demo volcano", categories: [{ id: "volcanoes", title: "Volcanoes" }],
      geometry: [{ date: "2026-11-14T00:00:00Z", type: "Point", coordinates: [110.4, -7.5] }] },
  ];

  /* ================= Elements & state ================= */
  const $ = (id) => document.getElementById(id);
  const els = {
    start: $("start"), mic: $("mic"), nearby: $("nearby"), guide: $("guide"),
    predict: $("predict"), stop: $("stop"), say: $("say"), live: $("live"),
    radius: $("radius"), cat: $("cat"), india: $("india"),
    eco: $("eco"), enso: $("enso"), status: $("status"), detail: $("detail"), list: $("list"),
    modeInstrumental: $("mode-instrumental"), modeVocal: $("mode-vocal"),
    modeDescription: $("mode-description"), playerMode: $("player-mode"),
    instrumentLabel: $("instrument-label"), playSelected: $("play-selected"),
    playLabel: $("play-label"), eventCount: $("event-count"),
    listCount: $("list-count"), updatedTime: $("updated-time"), emptyEvents: $("empty-events"),
  };

  let events = [];
  let selectedEvent = null;
  let soundMode = "instrumental";
  let user = null;            // { lat, lon } once GPS works
  let watchId = null;
  let userMarker = null;
  let updatedAt = "";
  let refreshTimer = null;
  const seen = new Set();     // event ids already known
  const alerted = new Set();  // alert keys already sent
  let ensoState = null;

  /* ================= Map ================= */
  const map = L.map("map", { worldCopyJump: true, minZoom: 2 }).setView([20, 30], 2);

  const blueMarble = L.tileLayer(
    "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg",
    { maxNativeZoom: 8, maxZoom: 10, attribution: "Imagery: NASA EOSDIS GIBS" }
  ).addTo(map);

  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const trueColor = L.tileLayer(
    "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/" +
      yesterday + "/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
    { maxNativeZoom: 9, maxZoom: 10, attribution: "Imagery: NASA EOSDIS GIBS / MODIS" }
  );
  L.control.layers({ "Blue Marble": blueMarble, "Today's satellite view": trueColor }).addTo(map);

  const markerLayer = L.layerGroup().addTo(map);

  /* ================= Event helpers ================= */
  const latest = (ev) => ev.geometry[ev.geometry.length - 1];
  const catId = (ev) => (ev.categories && ev.categories[0] ? ev.categories[0].id : "default");
  const catTitle = (ev) => (ev.categories && ev.categories[0] ? ev.categories[0].title : "Event");
  const radius = () => parseInt(els.radius.value, 10) || 500;

  function position(ev) {
    const g = latest(ev);
    if (!g) return null;
    let c = g.coordinates;
    while (Array.isArray(c) && Array.isArray(c[0])) c = c[0]; // polygon -> first point
    if (!Array.isArray(c) || c.length < 2) return null;
    return { lat: c[1], lon: c[0] };
  }

  // Event size/strength -> 0..1, used to shape the sound.
  function intensityOf(ev) {
    const g = latest(ev);
    const v = g && typeof g.magnitudeValue === "number" ? g.magnitudeValue : null;
    if (v === null) return 0.5;
    const unit = (g.magnitudeUnit || "").toLowerCase();
    const k = unit.includes("kts") ? v / 130 : Math.log10(Math.abs(v) + 1) / 5;
    return Math.max(0.1, Math.min(1, k));
  }

  const inIndia = (p) => p.lat >= 6 && p.lat <= 37 && p.lon >= 68 && p.lon <= 98;

  /* ================= Geography ================= */
  const rad = (d) => (d * Math.PI) / 180;

  function distKm(a, b) {
    const dLat = rad(b.lat - a.lat);
    const dLon = rad(b.lon - a.lon);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(s)));
  }

  function bearing(a, b) {
    const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat));
    const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
      Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  }

  const DIRS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
  const compass = (deg) => DIRS[Math.round(deg / 45) % 8];

  // Events sorted by distance from the user: [{ ev, p, d, b }]
  function withDistance(list) {
    if (!user) return [];
    return list
      .map((ev) => {
        const p = position(ev);
        return p ? { ev, p, d: distKm(user, p), b: bearing(user, p) } : null;
      })
      .filter(Boolean)
      .sort((x, y) => x.d - y.d);
  }

  const phrase = (x) =>
    catTitle(x.ev) + ": " + x.ev.title + ", " + Math.round(x.d) + " kilometres " + compass(x.b);

  /* ================= Sound engine (Web Audio API) ================= */
  let audioCtx = null;
  let currentSound = null;

  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(c, out, freq, dur, type, peak) {
    const o = c.createOscillator();
    o.type = type || "sine";
    o.frequency.value = freq;
    const g = c.createGain();
    const now = c.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak || 0.3, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g).connect(out);
    o.start(now);
    o.stop(now + dur + 0.05);
  }

  // Short two-tone alert sound so a blind user knows something new arrived.
  function earcon() {
    try {
      const c = getCtx();
      tone(c, c.destination, 880, 0.22, "square", 0.12);
      setTimeout(() => tone(c, c.destination, 660, 0.32, "square", 0.12), 240);
    } catch (e) { /* audio not available */ }
  }

  function listenBeep() {
    try {
      const c = getCtx();
      tone(c, c.destination, 1000, 0.1, "sine", 0.15);
    } catch (e) { /* audio not available */ }
  }

  function stopSound() {
    if (!currentSound) return;
    const { audio, timer } = currentSound;
    currentSound = null;
    clearTimeout(timer);
    audio.pause();
    audio.currentTime = 0;
    els.playSelected.classList.remove("is-playing");
    els.playLabel.textContent = soundMode === "instrumental" ? "Play selected signal" : "Speak selected event";
    els.playerMode.closest(".player-panel").classList.remove("is-playing");
  }

  function playSound(category, k) {
    if (soundMode !== "instrumental") return;
    stopSound();
    const instrument = INSTRUMENTS[category] || INSTRUMENTS.default;
    const audio = new Audio(AUDIO_TRACKS[category] || AUDIO_TRACKS.default);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.65;
    audio.playbackRate = 0.85 + Math.max(0, Math.min(1, k)) * 0.3;
    const playback = { audio, timer: null };
    currentSound = playback;
    els.playLabel.textContent = "Loading " + instrument.name + "…";
    els.playSelected.classList.add("is-playing");
    els.playerMode.closest(".player-panel").classList.add("is-playing");
    playback.timer = setTimeout(stopSound, els.eco.checked ? 6000 : 15000);
    audio.addEventListener("playing", () => {
      if (currentSound === playback) els.playLabel.textContent = instrument.name + " playing";
    });

    const result = audio.play();
    if (result && typeof result.catch === "function") {
      result.catch((error) => {
        if (currentSound !== playback) return;
        stopSound();
        console.error("Could not play the local instrument track:", error);
        const message = "Audio could not start. Check your device volume, then try Play again.";
        els.say.textContent = message;
        els.live.textContent = message;
      });
    }
  }

  /* ================= Voice output & alerts ================= */
  // Speaks the text (and always shows it as a caption). With "Spoken voice" off,
  // it goes to an ARIA live region so a screen reader reads it instead.
  function announce(text, opts) {
    const o = opts || {};
    els.say.textContent = text;
    if (soundMode === "vocal" && "speechSynthesis" in window) {
      if (!o.queue) window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } else {
      els.live.textContent = "";
      setTimeout(() => { els.live.textContent = text; }, 60);
    }
  }

  function instrumentFor(ev) {
    return INSTRUMENTS[catId(ev)] || INSTRUMENTS.default;
  }

  function eventNarration(ev) {
    const g = latest(ev);
    const date = g && g.date ? g.date.slice(0, 10) : "date unavailable";
    const magnitude = g && typeof g.magnitudeValue === "number"
      ? " Reported magnitude: " + g.magnitudeValue + " " + (g.magnitudeUnit || "") + "."
      : "";
    const distance = user && position(ev)
      ? " It is about " + Math.round(distKm(user, position(ev))) + " kilometres from your selected location."
      : "";
    return catTitle(ev) + " signal. " + ev.title + ". Last reported " + date + "." + magnitude + distance +
      " This is informational data, not an official warning.";
  }

  function updateModeUI() {
    const isInstrumental = soundMode === "instrumental";
    els.modeInstrumental.classList.toggle("is-active", isInstrumental);
    els.modeInstrumental.setAttribute("aria-pressed", String(isInstrumental));
    els.modeVocal.classList.toggle("is-active", !isInstrumental);
    els.modeVocal.setAttribute("aria-pressed", String(!isInstrumental));
    els.playerMode.textContent = isInstrumental ? "INSTRUMENTAL" : "VOCAL AGENT";
    els.playLabel.textContent = isInstrumental ? "Play selected signal" : "Speak selected event";
    els.modeDescription.textContent = isInstrumental
      ? "Every event type has its own synthesized instrument and musical phrase."
      : "The speaking agent describes the event, latest update, and any reported magnitude.";
    els.instrumentLabel.textContent = selectedEvent
      ? (isInstrumental
        ? instrumentFor(selectedEvent).name + " · " + instrumentFor(selectedEvent).style
        : "Speaking agent · " + catTitle(selectedEvent))
      : (isInstrumental ? "Choose an event to see its instrument" : "Select an event to hear the agent describe it");
  }

  function setSoundMode(mode) {
    if (soundMode === mode) return;
    stopSound();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    soundMode = mode;
    updateModeUI();
    if (mode === "vocal" && selectedEvent) {
      announce(eventNarration(selectedEvent));
      return;
    }
    announce(mode === "instrumental"
      ? (selectedEvent
        ? "Instrumental mode selected. Press Play selected signal to hear the " + instrumentFor(selectedEvent).name + "."
        : "Instrumental mode selected. Choose an event to hear its instrument.")
      : "Vocal mode selected. Choose an event to hear the speaking agent describe it.");
  }

  function notify(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      try { new Notification(title, { body }); } catch (e) { /* not allowed here */ }
    }
  }

  function alertUser(title, body, ev) {
    notify(title, body);
    if (soundMode === "instrumental") {
      if (ev) playSound(catId(ev), intensityOf(ev));
      else earcon();
    }
    announce(body);
  }

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
  }

  /* ================= Assistant answers ================= */
  function nearbyText() {
    if (!user) return "Your location is off. Press Start assistant and allow location access.";
    const r = radius();
    const near = withDistance(events).filter((x) => x.d <= r);
    if (!near.length) return "No NASA-tracked hazards within " + r + " kilometres of you right now.";
    const parts = near.slice(0, 3).map(phrase);
    return near.length + " tracked hazard" + (near.length > 1 ? "s" : "") + " within " + r +
      " kilometres. Nearest: " + parts[0] + (parts.length > 1 ? ". Also: " + parts.slice(1).join(". ") : "") + ".";
  }

  function guidanceText() {
    if (!user) return "Your location is off. Press Start assistant and allow location access.";
    const r = radius();
    const near = withDistance(events).filter((x) => x.d <= r);
    if (!near.length) {
      return "You are not near any tracked hazard. Stay aware, and keep this app open for alerts.";
    }
    const n = near[0];
    const away = compass((n.b + 180) % 360);
    let t = "Nearest hazard is " + phrase(n) + ". " + (TIPS[catId(n.ev)] || TIPS.default) +
      " To increase distance from it, head " + away + ". ";
    if (n.d < 50) t += "It is very close. Call your local emergency number now, 112 in India. ";
    t += "This is a rough guide from satellite data, not an official warning. Follow local authorities.";
    return t;
  }

  // Simple trend prediction: extend a storm's last movement forward in a straight line.
  function predictStorm(ev) {
    const pts = (ev.geometry || [])
      .filter((g) => g.type === "Point" && g.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    if (pts.length < 2) return null;
    const a = pts[pts.length - 2];
    const b = pts[pts.length - 1];
    const hrs = (new Date(b.date) - new Date(a.date)) / 36e5;
    if (!(hrs > 0) || hrs > 72) return null;
    const pa = { lat: a.coordinates[1], lon: a.coordinates[0] };
    const pb = { lat: b.coordinates[1], lon: b.coordinates[0] };
    const speed = distKm(pa, pb) / hrs;
    if (speed < 3 || speed > 120) return null; // stationary or unrealistic
    const vLat = (pb.lat - pa.lat) / hrs;
    const vLon = (pb.lon - pa.lon) / hrs;
    return { speed, at: (h) => ({ lat: pb.lat + vLat * h, lon: pb.lon + vLon * h }) };
  }

  function stormThreats() {
    if (!user) return [];
    const r = radius();
    const out = [];
    events.filter((e) => catId(e) === "severeStorms").forEach((ev) => {
      const pr = predictStorm(ev);
      if (!pr) return;
      for (const h of [24, 48, 72]) {
        const d = distKm(user, pr.at(h));
        if (d <= r) { out.push({ ev, h, d, speed: pr.speed }); break; }
      }
    });
    return out.sort((x, y) => x.h - y.h);
  }

  function predictionText() {
    if (!user) return "Your location is off. Press Start assistant and allow location access.";
    const th = stormThreats();
    if (!th.length) {
      return "No tracked storm is projected to approach you in the next three days. " +
        "This is a simple trend estimate, not an official forecast.";
    }
    const t = th[0];
    return "Rough estimate: " + t.ev.title + " is moving at about " + Math.round(t.speed) +
      " kilometres per hour and may pass within " + Math.round(t.d) + " kilometres of you in about " +
      t.h + " hours. This is a simple trend estimate, not an official forecast.";
  }

  function ensoText() {
    return els.enso.textContent;
  }

  function readLatestText() {
    const sorted = events.slice().sort((a, b) => new Date(latest(b).date || 0) - new Date(latest(a).date || 0));
    if (!sorted.length) return "No events loaded yet.";
    return "Latest events: " + sorted.slice(0, 5).map((e) => catTitle(e) + ", " + e.title).join(". ") + ".";
  }

  const HELP_TEXT =
    "Keys: V to speak a command, N for nearby hazards, G for guidance, P for predictions, S to stop. " +
    "You can say: what's near me, guide me, any storms coming, El Niño status, read latest, refresh, " +
    "or name a hazard such as wildfire, storm, volcano, flood, ice or earthquake.";

  /* ================= Auto alerts ================= */
  function checkThreats() {
    stormThreats().forEach((t) => {
      const key = "storm:" + t.ev.id + ":" + Math.ceil(t.h / 24);
      if (alerted.has(key)) return;
      alerted.add(key);
      alertUser(
        "Storm may approach",
        "Rough estimate: " + t.ev.title + " may pass within " + Math.round(t.d) +
          " kilometres of you in about " + t.h + " hours. Not an official forecast.",
        t.ev
      );
    });
  }

  function alertFresh(fresh) {
    if (!user) return;
    withDistance(fresh)
      .filter((x) => x.d <= radius())
      .slice(0, 3)
      .forEach((x) => alertUser("New hazard near you", "New alert. " + phrase(x) + ".", x.ev));
  }

  /* ================= El Niño / La Niña watch (NOAA ONI) ================= */
  async function loadEnso() {
    try {
      const res = await fetch(ONI_URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const rows = (await res.text())
        .trim()
        .split("\n")
        .map((l) => l.trim().split(/\s+/))
        .filter((c) => c.length >= 4 && !isNaN(parseFloat(c[3])));
      const last = rows[rows.length - 1];
      const anom = parseFloat(last[3]);
      const state = anom >= 0.5 ? "El Niño" : anom <= -0.5 ? "La Niña" : "Neutral";
      els.enso.textContent = "Climate watch (NOAA ONI) " + last[0] + " " + last[1] + ": " +
        anom.toFixed(1) + " degrees Celsius, " + state + " conditions.";
      const prev = safeGet("coxmox_enso");
      if (prev && prev !== state) {
        alertUser("Climate change alert", "Climate alert: the ENSO phase changed from " + prev + " to " + state + ".");
      }
      safeSet("coxmox_enso", state);
      ensoState = state;
    } catch (err) {
      console.warn("ENSO data unavailable:", err);
      els.enso.textContent =
        "Climate watch: live El Niño data could not be loaded in this browser. Check NOAA Climate Prediction Center for ENSO status.";
    }
  }

  /* ================= Select an event ================= */
  function selectEvent(ev) {
    selectedEvent = ev;
    const p = position(ev);
    const g = latest(ev);
    const date = g && g.date ? g.date.slice(0, 10) : "unknown date";
    const size = g && typeof g.magnitudeValue === "number"
      ? "Size: " + g.magnitudeValue + " " + (g.magnitudeUnit || "") : "";
    let away = "";
    if (user && p) {
      away = Math.round(distKm(user, p)) + " kilometres " + compass(bearing(user, p)) + " of you";
    }

    els.detail.textContent = "";
    const accent = document.createElement("span");
    accent.className = "detail-accent";
    accent.setAttribute("aria-hidden", "true");
    const content = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = ev.title;
    content.appendChild(heading);
    [catTitle(ev), "Last update: " + date, size, away].filter(Boolean).forEach((t) => {
      const para = document.createElement("p");
      para.textContent = t;
      content.appendChild(para);
    });
    els.detail.append(accent, content);

    if (p) map.flyTo([p.lat, p.lon], Math.max(map.getZoom(), 4), { animate: !reduceMotion });
    updateModeUI();
    Array.from(els.list.querySelectorAll("button")).forEach((button) => {
      if (button.dataset.eventId === String(ev.id)) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    announce(eventNarration(ev));
    if (soundMode === "instrumental") playSound(catId(ev), intensityOf(ev));
  }

  /* ================= Render ================= */
  function render() {
    markerLayer.clearLayers();
    els.list.textContent = "";

    const wantCat = els.cat.value;
    const onlyIndia = els.india.checked;

    const shown = events.filter((ev) => {
      const p = position(ev);
      if (!p) return false;
      if (wantCat !== "all" && catId(ev) !== wantCat) return false;
      if (onlyIndia && !inIndia(p)) return false;
      return true;
    });

    shown.forEach((ev) => {
      const p = position(ev);
      const color = COLORS[catId(ev)] || COLORS.default;

      const m = L.circleMarker([p.lat, p.lon], {
        radius: 7, color: "#fff", weight: 1, fillColor: color, fillOpacity: 0.9,
        bubblingMouseEvents: false, // clicking an event must not set your location
      }).addTo(markerLayer);
      m.bindTooltip(ev.title);
      m.on("click", () => selectEvent(ev));

      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.background = color;
      const label = document.createElement("span");
      label.textContent = ev.title;
      const category = document.createElement("small");
      category.textContent = catTitle(ev);
      btn.dataset.eventId = String(ev.id);
      if (selectedEvent && selectedEvent.id === ev.id) btn.setAttribute("aria-current", "true");
      btn.append(dot, label, category);
      btn.addEventListener("click", () => selectEvent(ev));
      li.appendChild(btn);
      els.list.appendChild(li);
    });

    els.eventCount.textContent = String(shown.length).padStart(2, "0");
    els.listCount.textContent = String(shown.length);
    els.emptyEvents.hidden = shown.length > 0;
    els.updatedTime.textContent = updatedAt || (events.length ? "Demo data" : "Waiting for data");
    els.status.textContent = shown.length + " events shown" + (updatedAt ? " · updated " + updatedAt : "");
  }

  function fillCategories() {
    const keep = els.cat.value;
    const seenCats = new Map();
    events.forEach((ev) => seenCats.set(catId(ev), catTitle(ev)));
    els.cat.length = 1;
    seenCats.forEach((title, id) => {
      const o = document.createElement("option");
      o.value = id;
      o.textContent = title;
      els.cat.appendChild(o);
    });
    if ([...els.cat.options].some((o) => o.value === keep)) els.cat.value = keep;
  }

  /* ================= Live NASA data (auto-refresh) ================= */
  function schedule() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => load(false), els.eco.checked ? REFRESH_ECO : REFRESH_NORMAL);
  }

  async function load(initial) {
    let incoming = null;
    try {
      const res = await fetch(EONET_URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      incoming = (data.events || []).filter((e) => e.geometry && e.geometry.length);
      if (!incoming.length) throw new Error("No events returned");
    } catch (err) {
      console.warn("NASA EONET request failed:", err);
      if (initial) {
        events = DEMO_EVENTS;
        fillCategories();
        render();
        els.status.textContent = "Could not reach NASA EONET. Showing demo data.";
      } else {
        els.status.textContent = "Update failed. Showing the last known data. Will retry.";
      }
      schedule();
      return;
    }

    const fresh = incoming.filter((e) => !seen.has(e.id));
    incoming.forEach((e) => seen.add(e.id));
    events = incoming;
    updatedAt = new Date().toLocaleTimeString();
    fillCategories();
    render();
    if (!initial) alertFresh(fresh); // no alert flood on the very first load
    checkThreats();
    schedule();
  }

  /* ================= GPS ================= */
  function drawUser() {
    if (!user) return;
    if (!userMarker) {
      userMarker = L.circleMarker([user.lat, user.lon], {
        radius: 9, color: "#ffffff", weight: 2, fillColor: "#2dd4bf", fillOpacity: 1,
      }).addTo(map).bindTooltip("You are here");
    } else {
      userMarker.setLatLng([user.lat, user.lon]);
    }
  }

  let gpsActive = false;

  // Fallback when GPS is blocked: click the map to set where you are.
  map.on("click", (e) => {
    if (gpsActive) return;
    user = { lat: e.latlng.lat, lon: e.latlng.lng };
    drawUser();
    announce("Location set from the map. " + nearbyText());
    checkThreats();
  });

  function startLocation() {
    if (window.isSecureContext === false) {
      announce(
        "Location only works on localhost or https. Open this page with Live Server, not by double-clicking the file.",
        { queue: true }
      );
      return;
    }
    if (!("geolocation" in navigator)) {
      announce("This device does not support location.", { queue: true });
      return;
    }
    if (watchId !== null) return;
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        gpsActive = true;
        const first = !user;
        user = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        drawUser();
        if (first) {
          map.setView([user.lat, user.lon], 5, { animate: !reduceMotion });
          announce("Location found. " + nearbyText(), { queue: true });
          checkThreats();
        }
      },
      (err) => {
        if (gpsActive) return; // a later timeout is harmless once we have a fix
        watchId = null;
        const why =
          err.code === 1
            ? "Permission was denied. Allow location for this site in your browser, then press Start assistant again."
            : err.code === 2
            ? "Your device could not find its position. Turn on location services."
            : "Location timed out.";
        announce(
          "I could not get your location. " + why + " You can also click on the map to set your location.",
          { queue: true }
        );
      },
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 30000 }
    );
  }

  /* ================= Voice commands ================= */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let listening = false;

  function listen() {
    if (!SR) {
      announce("Voice commands are not supported in this browser. Try Chrome or Edge, or use the buttons and keys.");
      return;
    }
    if (listening) return;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    listenBeep();
    rec = new SR();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => {
      listening = true;
      els.mic.setAttribute("aria-pressed", "true");
      els.mic.textContent = "🎤 Listening…";
    };
    rec.onend = () => {
      listening = false;
      els.mic.setAttribute("aria-pressed", "false");
      els.mic.textContent = "🎤 Voice command (V)";
    };
    rec.onerror = (e) => {
      announce(
        e.error === "not-allowed"
          ? "Microphone permission was denied."
          : "I did not catch that. Press V and try again."
      );
    };
    rec.onresult = (e) => handleCommand(e.results[0][0].transcript);
    try { rec.start(); } catch (err) { /* already started */ }
  }

  const CAT_WORDS = [
    [/\b(fire|wildfire)s?\b/, "wildfires", "wildfires"],
    [/\b(storm|cyclone|hurricane|typhoon)s?\b/, "severeStorms", "severe storms"],
    [/\b(volcano|volcanoes|volcanic)\b/, "volcanoes", "volcanoes"],
    [/\bfloods?\b/, "floods", "floods"],
    [/\b(ice|iceberg)s?\b/, "seaLakeIce", "sea and lake ice"],
    [/\b(earthquake|quake)s?\b/, "earthquakes", "earthquakes"],
  ];

  function handleCommand(raw) {
    const t = raw.toLowerCase();
    els.say.textContent = "Heard: " + raw;

    if (/\b(stop|quiet|silence|cancel)\b/.test(t)) return stopAll();
    if (/(what should i do|guide|safe|escape|evacuat|help me)/.test(t)) return announce(guidanceText());
    if (/(predict|forecast|will|coming|approach)/.test(t)) return announce(predictionText());
    if (/(el ?ni[nñ]o|la ?ni[nñ]a|climate|enso)/.test(t)) return announce(ensoText());
    if (/(near|around|close to me|my area)/.test(t)) return announce(nearbyText());
    if (/(refresh|update)/.test(t)) { announce("Refreshing NASA data."); return load(false); }
    if (/(read|latest|news|alerts)/.test(t)) return announce(readLatestText());

    for (const [re, id, label] of CAT_WORDS) {
      if (re.test(t)) {
        if ([...els.cat.options].some((o) => o.value === id)) {
          els.cat.value = id;
          render();
          const n = events.filter((e) => catId(e) === id).length;
          return announce(n + " active " + label + " events. They are shown on the map and in the list.");
        }
        return announce("No active " + label + " events right now.");
      }
    }
    if (/\b(all|everything|reset)\b/.test(t)) {
      els.cat.value = "all";
      render();
      return announce("Showing all events.");
    }
    if (/(help|command|what can i say)/.test(t)) return announce(HELP_TEXT);
    return announce("Sorry, I did not understand. Say help to hear what I can do.");
  }

  /* ================= Controls ================= */
  function stopAll() {
    stopSound();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    els.say.textContent = "Playback stopped.";
    els.live.textContent = "Playback stopped.";
  }

  function playSelectedEvent() {
    if (!selectedEvent) {
      announce("Select an event from the map or list first.");
      return;
    }
    const description = eventNarration(selectedEvent);
    if (soundMode === "vocal") {
      announce(description);
      return;
    }
    announce(description);
    playSound(catId(selectedEvent), intensityOf(selectedEvent));
  }

  async function startAssistant() {
    if ("Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch (e) { /* ignore */ }
    }
    announce(
      "The Coxmox assistant is on. I will watch NASA data and alert you about hazards near you while this page stays open. " +
        "Press V and speak a command, or press H for help.",
      { queue: true }
    );
    startLocation();
  }

  els.modeInstrumental.addEventListener("click", () => setSoundMode("instrumental"));
  els.modeVocal.addEventListener("click", () => setSoundMode("vocal"));
  els.playSelected.addEventListener("click", playSelectedEvent);
  els.start.addEventListener("click", startAssistant);
  els.mic.addEventListener("click", listen);
  els.nearby.addEventListener("click", () => announce(nearbyText()));
  els.guide.addEventListener("click", () => announce(guidanceText()));
  els.predict.addEventListener("click", () => announce(predictionText()));
  els.stop.addEventListener("click", stopAll);
  els.cat.addEventListener("change", render);
  els.india.addEventListener("change", render);
  els.radius.addEventListener("change", () => announce("Alert radius set to " + radius() + " kilometres."));
  els.eco.addEventListener("change", () => {
    schedule();
    announce(els.eco.checked
      ? "Eco mode on. Updates every 30 minutes, shorter sounds, lower power location."
      : "Eco mode off. Updates every 10 minutes.");
  });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.matches && e.target.matches("input, select, textarea")) return;
    switch (e.key.toLowerCase()) {
      case "v": listen(); break;
      case "n": announce(nearbyText()); break;
      case "g": announce(guidanceText()); break;
      case "p": announce(predictionText()); break;
      case "h": announce(HELP_TEXT); break;
      case "s": stopAll(); break;
      default: break;
    }
  });

  /* ================= Go ================= */
  updateModeUI();
  load(true);
  loadEnso();
  setInterval(loadEnso, 12 * 60 * 60 * 1000);
})();
