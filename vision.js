const supabaseUrl = "https://fcajhwkmsyztkvyzjhkl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYWpod2ttc3l6dGt2eXpqaGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTE0ODIsImV4cCI6MjA5MzU2NzQ4Mn0.fbdUZmZbDCi5IhTvtg1AwjIxXefetuk912YEwjJNqbI";

const db = window.supabase.createClient(supabaseUrl, supabaseKey);
const widget = document.getElementById("widget");

const grid = document.getElementById("visionGrid");
const titleDisplay = document.getElementById("visionTitle");

const titleInput = document.getElementById("boardTitle");
const imageUpload = document.getElementById("imageUpload");
const gridSizeSelect = document.getElementById("gridSizeSelect");

const editBtn = document.getElementById("editBtn");
const editOptions = document.getElementById("editOptions");

const themeBtn = document.getElementById("themeBtn");
const themeOptions = document.getElementById("themeOptions");

const fontBtn = document.getElementById("fontToggle");
const fontOptions = document.getElementById("fontOptions");

const copyBtn = document.getElementById("copyLinkBtn");
const widgetSizeSelect = document.getElementById("widgetSizeSelect");
const gridOptions = document.querySelectorAll(".pill-option[data-grid]");

function setGridSize(size) {
  state.gridSize = Number(size);
  updateGrid();

  gridOptions.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.grid == size);
  });
}

gridOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    setGridSize(btn.dataset.grid);
  });
});


/* WIDGET SIZE PILLS */
const widgetOptions = document.querySelectorAll(".pill-option[data-size]");

function setWidgetSize(size) {
  state.widgetSize = size;

  widget.classList.remove("size-small", "size-medium", "size-large");
  widget.classList.add(`size-${size}`);

  widgetOptions.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.size === size);
  });
}

widgetOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    setWidgetSize(btn.dataset.size);
  });
});

/* ---------------- URL PARAMS ---------------- */
const params = new URLSearchParams(window.location.search);
const isEmbed = params.get("embed") === "true";

/* ---------------- STATE ---------------- */
let state = {
  title: params.get("title") || "my vision board",
  theme: params.get("theme") || "beige",
  font: params.get("font") || "default",
  gridSize: parseInt(params.get("gridSize")) || 3,
  tiles: [],
  widgetSize: params.get("widgetSize") || "medium",
  titleStyle: params.get("titleStyle") || "plain",
  titlePosition: params.get("titlePosition") || "top-center",
};

async function uploadImage(file) {
  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await db.storage
    .from("vision-images")
    .upload(fileName, file);

  if (error) {
    console.error("upload error:", error);
    return null;
  }

  const { data } = db.storage
    .from("vision-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
function setTitlePosition(pos) {
  state.titlePosition = pos;

  titleDisplay.classList.remove(
    "title-pos-top-left",
    "title-pos-top-center",
    "title-pos-center",
    "title-pos-floating"
  );

  titleDisplay.classList.add(`title-pos-${pos}`);

  // if not floating → disable dragging
  if (pos !== "floating") {
    titleDisplay.style.cursor = "default";
  } else {
    titleDisplay.style.cursor = "grab";
  }
}

function setTitleStyle(style) {
  state.titleStyle = style;

  titleDisplay.classList.remove(
    "title-plain",
    "title-pill",
    "title-outline",
    "title-soft"
  );

  titleDisplay.classList.add(`title-${style}`);
}

function setWidgetSize(size) {
  state.widgetSize = size;

  widget.classList.remove("size-small", "size-medium", "size-large");
  widget.classList.add(`size-${size}`);
}


if (params.get("tiles")) {
  try {
    state.tiles = JSON.parse(decodeURIComponent(params.get("tiles")));
  } catch (e) {
    state.tiles = [];
  }
}

/* ---------------- EMBED MODE ---------------- */
if (isEmbed) {
  const builder = document.querySelector(".builder-ui");
  if (builder) builder.style.display = "none";
}

/* ---------------- GRID ---------------- */
function updateGrid() {
  if (!grid) return;
  grid.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
}

/* ---------------- RENDER ---------------- */
function renderBoard() {
  if (!grid) return;

  grid.innerHTML = "";

  state.tiles.forEach(tile => {
    const div = document.createElement("div");
    div.classList.add("vision-tile");

    const img = document.createElement("img");
    img.src = tile.src;

    div.appendChild(img);
    grid.appendChild(div);
  });
}

/* ---------------- TITLE ---------------- */
function updateTitle() {
  if (!titleDisplay) return;
  titleDisplay.textContent = state.title.toLowerCase();
}

/* ---------------- IMAGE UPLOAD (SUPABASE) ---------------- */
imageUpload?.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);

  for (let file of files) {
    const url = await uploadImage(file);

    if (url) {
      state.tiles.push({
        id: Date.now() + Math.random(),
        src: url
      });
    }
  }

  renderBoard();
});

/* ---------------- GRID SIZE ---------------- */

document.querySelectorAll("#titlePositionOptions .pill-option").forEach(el => {
  el.addEventListener("click", () => {
    setTitlePosition(el.dataset.pos);
  });
});
/* ---------------- TITLE INPUT ---------------- */
titleInput?.addEventListener("input", (e) => {
  state.title = e.target.value || "my vision board";
  updateTitle();
});

/* ---------------- THEME ---------------- */
function setTheme(theme) {
  state.theme = theme;

  widget.classList.remove("beige", "pink", "blue", "green");
  widget.classList.add(theme);
}

/* ---------------- FONT ---------------- */
function setFont(font) {
  state.font = font;

  widget.classList.remove("font-default", "font-serif", "font-mono");
  widget.classList.add(`font-${font}`);
}

/* ---------------- POPUPS ---------------- */
editBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  editOptions.classList.toggle("hidden");
});

themeBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  themeOptions.classList.toggle("hidden");
});

fontBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  fontOptions.classList.toggle("hidden");
});

/* ---------------- OPTIONS ---------------- */
document.querySelectorAll(".theme-circle").forEach(el => {
  el.addEventListener("click", () => {
    setTheme(el.dataset.theme);
    themeOptions.classList.add("hidden");
  });
});

document.querySelectorAll(".font-option").forEach(el => {
  el.addEventListener("click", () => {
    setFont(el.dataset.font);
    fontOptions.classList.add("hidden");
  });
});

/* ---------------- OUTSIDE CLICK ---------------- */
document.addEventListener("click", (e) => {
  if (!editBtn?.contains(e.target) && !editOptions?.contains(e.target)) {
    editOptions?.classList.add("hidden");
  }

  if (!themeBtn?.contains(e.target) && !themeOptions?.contains(e.target)) {
    themeOptions?.classList.add("hidden");
  }

  if (!fontBtn?.contains(e.target) && !fontOptions?.contains(e.target)) {
    fontOptions?.classList.add("hidden");
  }
});

/* ---------------- EMBED LINK ---------------- */
function buildEmbedURL() {
  const base = window.location.origin + window.location.pathname;

  const tiles = encodeURIComponent(JSON.stringify(state.tiles));

  return `${base}?title=${encodeURIComponent(state.title)}&gridSize=${state.gridSize}&tiles=${tiles}&theme=${state.theme}&font=${state.font}&widgetSize=${state.widgetSize}&titleStyle=${state.titleStyle}&titlePosition=${state.titlePosition}&embed=true`;
}

document.querySelectorAll("#titleStyleOptions .pill-option").forEach(el => {
  el.addEventListener("click", () => {
    setTitleStyle(el.dataset.style);
  });
});
/* ---------------- COPY ---------------- */
copyBtn?.addEventListener("click", () => {
  navigator.clipboard.writeText(buildEmbedURL());

  const msg = document.getElementById("copyMessage");
  if (!msg) return;

  msg.classList.remove("hidden");
  msg.classList.add("show");

  setTimeout(() => {
    msg.classList.add("hidden");
    msg.classList.remove("show");
  }, 2000);
});

/* ---------------- INIT ---------------- */
function init() {
  setGridSize(state.gridSize);
setWidgetSize(state.widgetSize);
  if (titleInput) titleInput.value = state.title;
setWidgetSize(state.widgetSize);
setTitleStyle(state.titleStyle);
  setTitlePosition(state.titlePosition);

  setTheme(state.theme);
  setFont(state.font);

  updateGrid();
  updateTitle();
  renderBoard();
}
/* ---------------- DRAGGABLE TITLE ---------------- */

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

titleDisplay?.addEventListener("mousedown", (e) => {
  isDragging = true;

  const rect = titleDisplay.getBoundingClientRect();

  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  titleDisplay.style.position = "absolute";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const widgetRect = widget.getBoundingClientRect();

  let x = e.clientX - widgetRect.left - offsetX;
  let y = e.clientY - widgetRect.top - offsetY;

  titleDisplay.style.left = `${x}px`;
  titleDisplay.style.top = `${y}px`;
  titleDisplay.style.transform = "none";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

init();

