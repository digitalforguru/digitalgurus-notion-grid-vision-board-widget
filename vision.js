const supabaseUrl = "https://fcajhwkmsyztkvyzjhkl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYWpod2ttc3l6dGt2eXpqaGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTE0ODIsImV4cCI6MjA5MzU2NzQ4Mn0.fbdUZmZbDCi5IhTvtg1AwjIxXefetuk912YEwjJNqbI";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
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

/* ---------------- URL PARAMS ---------------- */
const params = new URLSearchParams(window.location.search);
const isEmbed = params.get("embed") === "true";

/* ---------------- STATE ---------------- */
let state = {
  title: params.get("title") || "my vision board",
  theme: params.get("theme") || "beige",
  font: params.get("font") || "default",
  gridSize: parseInt(params.get("gridSize")) || 3,
  tiles: []
};

async function uploadImage(file) {
  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("vision-images")
    .upload(fileName, file);

  if (error) {
    console.error("upload error:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("vision-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
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
gridSizeSelect?.addEventListener("change", (e) => {
  state.gridSize = parseInt(e.target.value);
  updateGrid();
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

  return `${base}?title=${encodeURIComponent(state.title)}&gridSize=${state.gridSize}&tiles=${tiles}&theme=${state.theme}&font=${state.font}&embed=true`;
}

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
  if (gridSizeSelect) gridSizeSelect.value = state.gridSize;
  if (titleInput) titleInput.value = state.title;

  setTheme(state.theme);
  setFont(state.font);

  updateGrid();
  updateTitle();
  renderBoard();
}

init();
