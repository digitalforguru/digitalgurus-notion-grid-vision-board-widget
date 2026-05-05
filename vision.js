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
  stickers: [],
  widgetSize: params.get("widgetSize") || "medium",
  titleStyle: params.get("titleStyle") || "plain",
  titlePosition: params.get("titlePosition") || "top-center",
  messiness: parseInt(params.get("messiness")) || 0,
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

function applyMessiness() {
  const tiles = document.querySelectorAll(".vision-tile");

  tiles.forEach((tile, index) => {
    let rotation = 0;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let z = index;

    if (state.messiness === 1) {
      rotation = (Math.random() - 0.5) * 4;
      scale = 1 + (Math.random() * 0.05);
    }

    if (state.messiness === 2) {
      rotation = (Math.random() - 0.5) * 10;
      scale = 1 + (Math.random() * 0.1);
      offsetX = (Math.random() - 0.5) * 6;
      offsetY = (Math.random() - 0.5) * 6;
      z = Math.floor(Math.random() * 10);
    }

    if (state.messiness === 3) {
      rotation = (Math.random() - 0.5) * 18;
      scale = 1 + (Math.random() * 0.2);
      offsetX = (Math.random() - 0.5) * 12;
      offsetY = (Math.random() - 0.5) * 12;
      z = Math.floor(Math.random() * 20);
    }

    tile.style.transform = `
      translate(${offsetX}px, ${offsetY}px)
      rotate(${rotation}deg)
      scale(${scale})
    `;

    tile.style.zIndex = z;
  });
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

/* ---------------- IMAGE UPLOAD ---------------- */
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

/* ---------------- ICON TABS (FIXED) ---------------- */
const tabs = document.querySelectorAll(".icon-tab");
const icons = document.querySelectorAll(".icon-option");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const category = tab.dataset.category;

    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    icons.forEach(icon => {
      const iconCat = icon.dataset.category;

      if (category === "all" || iconCat === category) {
        icon.style.display = "flex";
      } else {
        icon.style.display = "none";
      }
    });
  });
});

/* ---------------- ICON CLICK (SINGLE SOURCE ONLY FIX) ---------------- */
document.querySelectorAll(".icon-option").forEach(icon => {
  icon.addEventListener("click", () => {
    const iconId = icon.dataset.icon;

    state.stickers.push({
      id: Date.now() + Math.random(),
      src: `./assets/icons/${iconId}.svg`,
      x: 120,
      y: 120,
      scale: 1,
      rotation: 0
    });

    renderStickers();
  });
});

/* ---------------- STICKERS ---------------- */
function renderStickers() {
  document.querySelectorAll(".sticker").forEach(s => s.remove());

  state.stickers.forEach(sticker => {
    const el = document.createElement("img");

    const src = sticker.src || `./assets/icons/${sticker.icon}.svg`;

    el.src = src;

    el.onerror = () => {
      console.warn("Missing icon:", src);
      el.style.display = "none";
    };

    el.className = "sticker";
    el.dataset.id = sticker.id;

    el.style.position = "absolute";
    el.style.left = `${sticker.x}px`;
    el.style.top = `${sticker.y}px`;
    el.style.width = "60px";
    el.style.zIndex = 30;
    el.style.cursor = "grab";

    makeStickerDraggable(el, sticker);

    widget.appendChild(el);
  });
}

function makeStickerDraggable(el, sticker) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  el.addEventListener("mousedown", (e) => {
    dragging = true;

    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    el.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    const widgetRect = widget.getBoundingClientRect();

    sticker.x = e.clientX - widgetRect.left - offsetX;
    sticker.y = e.clientY - widgetRect.top - offsetY;

    el.style.left = `${sticker.x}px`;
    el.style.top = `${sticker.y}px`;
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
    el.style.cursor = "grab";
  });
}

/* ---------------- INIT ---------------- */
function init() {
  setGridSize(state.gridSize);
  setWidgetSize(state.widgetSize);

  if (titleInput) titleInput.value = state.title;

  if (params.get("stickers")) {
    try {
      state.stickers = JSON.parse(decodeURIComponent(params.get("stickers")));
    } catch (e) {
      state.stickers = [];
    }
  }

  setTitleStyle(state.titleStyle);
  setTitlePosition(state.titlePosition);

  setTheme(state.theme);
  setFont(state.font);

  updateGrid();
  updateTitle();
  renderBoard();
  renderStickers();
  applyMessiness();
}

/* ---------------- DRAG TITLE ---------------- */
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

