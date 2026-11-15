const EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events";
const GDACS_URL = "https://www.gdacs.org/gdacsapi/api/AdaptiveCard/geteventlist/data";
const EONET_LIMIT = 1000;
const MAX_GDACS_PAGES = 8;
const GDACS_EVENT_TYPES = ["EQ", "TC", "FL", "VO", "DR", "WF", "TS", "MH", "ET"];

const elements = {
  period: document.querySelector("#archive-period"),
  date: document.querySelector("#archive-date"),
  load: document.querySelector("#archive-load"),
  range: document.querySelector("#archive-range"),
  status: document.querySelector("#archive-status"),
  count: document.querySelector("#archive-count"),
  list: document.querySelector("#archive-list"),
  empty: document.querySelector("#archive-empty"),
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function dateInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function shiftDate(date, days) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

function getRange(period, dateValue) {
  const selected = new Date(`${dateValue}T12:00:00`);
  let start;
  let end;

  if (period === "weekly") {
    const daysSinceMonday = (selected.getDay() + 6) % 7;
    start = shiftDate(selected, -daysSinceMonday);
    end = shiftDate(start, 6);
  } else if (period === "yearly") {
    start = new Date(selected.getFullYear(), 0, 1, 12);
    end = new Date(selected.getFullYear(), 11, 31, 12);
  } else {
    start = new Date(selected.getFullYear(), selected.getMonth(), 1, 12);
    end = new Date(selected.getFullYear(), selected.getMonth() + 1, 0, 12);
  }

  return { start: dateInputValue(start), end: dateInputValue(end) };
}

function formatDate(value) {
  if (!value) return "Date not reported";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })
    .format(date);
}

function addSafeLink(container, label, href) {
  const link = document.createElement("a");
  link.textContent = label;
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  container.appendChild(link);
}

function objectFromSummary(summary) {
  return Object.fromEntries((Array.isArray(summary) ? summary : [])
    .filter((entry) => entry && typeof entry.key === "string")
    .map((entry) => [entry.key.trim(), String(entry.value ?? "").trim()]));
}

function valueFor(summary, pattern) {
  const match = Object.entries(summary).find(([key, value]) => pattern.test(key) && value && value !== "-");
  return match ? match[1] : "";
}

function eonetRecords(payload, start, end) {
  const startTime = Date.parse(`${start}T00:00:00Z`);
  const endTime = Date.parse(`${end}T23:59:59Z`);
  return (Array.isArray(payload.events) ? payload.events : []).map((event) => {
    const geometries = (Array.isArray(event.geometry) ? event.geometry : [])
      .filter((item) => item && item.date && Date.parse(item.date) >= startTime && Date.parse(item.date) <= endTime);
    if (!geometries.length) return null;

    const latest = geometries[geometries.length - 1];
    const category = Array.isArray(event.categories) && event.categories[0] ? event.categories[0].title : "";
    const magnitude = typeof latest.magnitudeValue === "number"
      ? `${latest.magnitudeValue} ${latest.magnitudeUnit || ""}`.trim()
      : "Not reported by NASA EONET";

    return {
      id: `eonet-${event.id}`,
      source: "NASA EONET",
      title: event.title || "Untitled NASA event",
      date: latest.date,
      description: event.description || "",
      category,
      intensity: magnitude,
      effects: "Not reported by NASA EONET",
      cause: "Not reported by NASA EONET",
      affected: "Not reported by NASA EONET",
      severity: "",
      sourceUrl: event.link || "https://eonet.gsfc.nasa.gov/",
    };
  }).filter(Boolean);
}

function gdacsRecord(item) {
  const summary = objectFromSummary(item.summarytable);
  const eventDate = valueFor(summary, /^(event date|start date|from - to)$/i);
  const alertMatch = (item.title || "").match(/\b(red|orange|green)\s+alert\b/i);
  const alert = alertMatch ? `${alertMatch[1]} alert` : "";
  const intensityParts = [
    alert,
    valueFor(summary, /magnitude|maximum wind speed|maximum wave height/i),
  ].filter(Boolean);
  const deaths = valueFor(summary, /^death(s)?$/i);
  const displaced = valueFor(summary, /^displaced/i);
  const exposure = valueFor(summary, /exposed population/i);
  const affected = [
    deaths && `Deaths: ${deaths}`,
    displaced && `Displaced: ${displaced}`,
    exposure && `Population exposure estimate: ${exposure}`,
  ].filter(Boolean);

  return {
    id: `gdacs-${item.link || item.title}`,
    source: "GDACS",
    title: item.title || "Untitled GDACS report",
    date: eventDate,
    description: item.description || "",
    category: valueFor(summary, /^event type$/i),
    intensity: intensityParts.join(" · ") || "Not reported by GDACS",
    effects: valueFor(summary, /^impact$/i) || "Not reported by GDACS",
    cause: valueFor(summary, /cause|reason|trigger/i) || "Not reported by GDACS",
    affected: affected.join(" · ") || "Not reported by GDACS",
    severity: alert,
    sourceUrl: item.link || "https://www.gdacs.org/",
    wikiQuery: item.title || "",
    summary,
  };
}

function isMajor(record) {
  if (record.source !== "GDACS") return false;
  if (/red alert/i.test(record.severity)) return true;
  const magnitude = valueFor(record.summary, /magnitude/i);
  const numericMagnitude = magnitude.match(/-?\d+(?:\.\d+)?/);
  if (numericMagnitude && Number(numericMagnitude[0]) >= 6.5) return true;
  const deaths = valueFor(record.summary, /^death(s)?$/i);
  return Boolean(deaths && Number(deaths.replace(/[^\d.]/g, "")) > 0);
}

async function fetchEonet(start, end) {
  const url = new URL(EONET_URL);
  url.search = new URLSearchParams({ status: "all", start, end, limit: String(EONET_LIMIT) }).toString();
  const response = await fetch(url);
  if (!response.ok) throw new Error(`NASA EONET returned HTTP ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload.events)) throw new Error("NASA EONET returned an unexpected response");
  return {
    records: eonetRecords(payload, start, end),
    capped: payload.events.length >= EONET_LIMIT,
  };
}

async function fetchGdacs(start, end) {
  const records = [];
  let capped = false;
  for (let pageNumber = 1; pageNumber <= MAX_GDACS_PAGES; pageNumber += 1) {
    const url = new URL(GDACS_URL);
    url.search = new URLSearchParams({
      eventlist: GDACS_EVENT_TYPES.join(";"),
      fromDate: start,
      toDate: end,
      pageSize: "100",
      pageNumber: String(pageNumber),
    }).toString();
    const response = await fetch(url);
    if (!response.ok) throw new Error(`GDACS returned HTTP ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.items)) throw new Error("GDACS returned an unexpected response");
    const items = payload.items;
    records.push(...items.map(gdacsRecord));
    if (items.length < 100) return { records, capped: false };
    if (pageNumber === MAX_GDACS_PAGES) capped = true;
  }
  return { records, capped };
}

function renderRecord(record) {
  const card = document.createElement("article");
  card.className = "archive-card";

  const header = document.createElement("div");
  header.className = "archive-card-header";
  const titleGroup = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = record.title;
  titleGroup.appendChild(title);

  const meta = document.createElement("p");
  meta.className = "archive-card-meta";
  meta.textContent = [record.source, record.category, formatDate(record.date)].filter(Boolean).join(" · ");
  titleGroup.appendChild(meta);
  header.appendChild(titleGroup);

  if (record.severity) {
    const badge = document.createElement("span");
    badge.className = `archive-alert${/red/i.test(record.severity) ? " is-red" : ""}`;
    badge.textContent = record.severity;
    header.appendChild(badge);
  }
  card.appendChild(header);

  if (record.description) {
    const description = document.createElement("p");
    description.className = "archive-description";
    description.textContent = record.description;
    card.appendChild(description);
  }

  const facts = document.createElement("dl");
  facts.className = "archive-facts";
  [
    ["Intensity", record.intensity],
    ["Effects / impact", record.effects],
    ["Cause", record.cause],
    ["People affected", record.affected],
  ].forEach(([label, value]) => {
    const group = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = value;
    group.append(term, detail);
    facts.appendChild(group);
  });
  card.appendChild(facts);

  const links = document.createElement("div");
  links.className = "archive-card-links";
  addSafeLink(links, `Open ${record.source} report`, record.sourceUrl);
  if (isMajor(record)) {
    const query = record.wikiQuery.replace(/^(overall\s+)?(red|orange|green)\s+alert\s+/i, "").trim();
    addSafeLink(
      links,
      "Wikipedia search (background only)",
      `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
    );
  }
  card.appendChild(links);
  return card;
}

function render(records) {
  elements.list.replaceChildren(...records.map(renderRecord));
  elements.count.textContent = `${records.length} reports · ${records.filter((record) => record.source === "NASA EONET").length} NASA EONET · ${records.filter((record) => record.source === "GDACS").length} GDACS`;
  elements.empty.hidden = records.length > 0;
}

async function loadArchive() {
  if (!elements.date.value) elements.date.value = dateInputValue(new Date());
  const { start, end } = getRange(elements.period.value, elements.date.value);
  elements.range.textContent = `Inclusive dates: ${formatDate(start)} – ${formatDate(end)}. Multi-year GDACS reports may overlap this range.`;
  elements.status.textContent = "Loading NASA EONET and GDACS records…";
  elements.count.textContent = "";
  elements.list.replaceChildren();
  elements.empty.hidden = true;
  elements.load.disabled = true;

  const [nasaResult, gdacsResult] = await Promise.allSettled([
    fetchEonet(start, end),
    fetchGdacs(start, end),
  ]);
  const records = [];
  const failures = [];
  let eonetCapped = false;
  let gdacsCapped = false;

  if (nasaResult.status === "fulfilled") {
    records.push(...nasaResult.value.records);
    eonetCapped = nasaResult.value.capped;
  } else {
    const reason = nasaResult.reason instanceof Error ? nasaResult.reason.message : String(nasaResult.reason);
    failures.push(`NASA EONET: ${reason}`);
  }
  if (gdacsResult.status === "fulfilled") {
    records.push(...gdacsResult.value.records);
    gdacsCapped = gdacsResult.value.capped;
  } else {
    const reason = gdacsResult.reason instanceof Error ? gdacsResult.reason.message : String(gdacsResult.reason);
    failures.push(`GDACS: ${reason}`);
  }

  records.sort((first, second) => {
    const firstDate = Date.parse(first.date) || 0;
    const secondDate = Date.parse(second.date) || 0;
    return secondDate - firstDate;
  });
  render(records);
  if (failures.length) elements.empty.hidden = true;

  if (failures.length === 2) {
    elements.status.textContent = `Could not load archive records. ${failures.join(" ")}`;
  } else if (failures.length) {
    elements.status.textContent = `Showing available source data. ${failures.join(" ")}`;
  } else {
    const limits = [];
    if (eonetCapped) limits.push(`NASA EONET reached its ${EONET_LIMIT}-record limit`);
    if (gdacsCapped) limits.push(`GDACS reached its ${MAX_GDACS_PAGES * 100}-record limit`);
    elements.status.textContent = limits.length
      ? `Loaded records from both sources; ${limits.join(" and ")}. Narrow the date range for more complete results.`
      : "Loaded records from NASA EONET and GDACS. Missing fields are not inferred.";
  }
  elements.load.disabled = false;
}

const params = new URLSearchParams(window.location.search);
if (["weekly", "monthly", "yearly"].includes(params.get("period"))) {
  elements.period.value = params.get("period");
}
elements.date.value = dateInputValue(new Date());
elements.load.addEventListener("click", loadArchive);
elements.period.addEventListener("change", loadArchive);
loadArchive();
