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
  titleX: parseFloat(params.get("titleX")) || null,
titleY: parseFloat(params.get("titleY")) || null,
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

const tabs = document.querySelectorAll(".icon-tab");
const icons = document.querySelectorAll(".icon-option");

icons.forEach(icon => {
  icon.addEventListener("click", () => {
    const iconId = icon.dataset.icon;

    const sticker = {
      id: Date.now() + Math.random(),
      icon: iconId,
      src: `./assets/icons/${iconId}.svg`,
      x: 120,
      y: 120
    };

    state.stickers.push(sticker);
    renderStickers();
  });
});

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const category = tab.dataset.category;

    // active tab styling
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

function renderStickers() {
  document.querySelectorAll(".sticker").forEach(s => s.remove());

  state.stickers.forEach(sticker => {
    const el = document.createElement("div");
    el.className = "sticker";
    el.dataset.id = sticker.id;
    const src = sticker.src || (sticker.icon ? `./assets/icons/${sticker.icon}.svg` : "");

    const img = document.createElement("img");
    img.src = src;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";

    img.onerror = () => {
      console.warn("Missing icon:", src);
      el.style.display = "none";
    };

    el.style.width = "40px";
    el.style.height = "40px";
    el.style.position = "absolute";
    el.style.left = `${sticker.x}px`;
    el.style.top = `${sticker.y}px`;
    el.style.zIndex = 30;
    el.style.cursor = "grab";
    el.style.filter = "drop-shadow(0 2px 6px rgba(0,0,0,0.15))";

    el.appendChild(img);

    // ✅ DRAG
    makeDraggable(el, sticker);

    // ✅ DELETE BUTTON (ONLY BUILDER MODE)
    if (!isEmbed) {
      const deleteBtn = document.createElement("div");
      deleteBtn.innerHTML = "×";
      deleteBtn.className = "sticker-delete";

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        state.stickers = state.stickers.filter(s => s.id !== sticker.id);
        renderStickers();
      });

      el.appendChild(deleteBtn);
    }

    widget.appendChild(el);
  });
}

function makeDraggable(el, sticker) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  el.addEventListener("mousedown", (e) => {
  isDragging = true;

  const rect = el.getBoundingClientRect();
  const widgetRect = widget.getBoundingClientRect();

  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  // store widget reference position baseline
  el._widgetRect = widgetRect;
});
  
 document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const widgetRect = widget.getBoundingClientRect();

  let x = e.clientX - widgetRect.left - offsetX;
  let y = e.clientY - widgetRect.top - offsetY;

  // keep inside widget bounds
  x = Math.max(0, Math.min(x, widgetRect.width - el.offsetWidth));
  y = Math.max(0, Math.min(y, widgetRect.height - el.offsetHeight));

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  sticker.x = x;
  sticker.y = y;
});

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}
/* ---------------- GRID SIZE ---------------- */
document.querySelectorAll("#messinessOptions .pill-option").forEach(el => {
  el.addEventListener("click", () => {
    state.messiness = parseInt(el.dataset.mess);

    document.querySelectorAll("#messinessOptions .pill-option")
      .forEach(btn => btn.classList.remove("active"));

    el.classList.add("active");

    applyMessiness();
  });
});

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

  widget.classList.remove("beige", "pink", "blue", "green", "black", "white");
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
  const stickers = encodeURIComponent(JSON.stringify(state.stickers));

  const tiles = encodeURIComponent(JSON.stringify(state.tiles));

  return `${base}?title=${encodeURIComponent(state.title)}&gridSize=${state.gridSize}&tiles=${tiles}&theme=${state.theme}&font=${state.font}&widgetSize=${state.widgetSize}&titleStyle=${state.titleStyle}&titlePosition=${state.titlePosition}&messiness=${state.messiness}&stickers=${stickers}&titleX=${state.titleX ?? ""}&titleY=${state.titleY ?? ""}&embed=true`;
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

if (state.titleX !== null && state.titleY !== null) {
  titleDisplay.style.position = "absolute";
  titleDisplay.style.left = `${state.titleX}px`;
  titleDisplay.style.top = `${state.titleY}px`;
  titleDisplay.style.transform = "none";
}

renderBoard();
renderStickers();
applyMessiness();
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

  // 🔥 SAVE POSITION LIVE
  state.titleX = x;
  state.titleY = y;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

init();

