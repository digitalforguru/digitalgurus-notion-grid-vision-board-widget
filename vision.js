const supabaseUrl = "https://fcajhwkmsyztkvyzjhkl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYWpod2ttc3l6dGt2eXpqaGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTE0ODIsImV4cCI6MjA5MzU2NzQ4Mn0.fbdUZmZbDCi5IhTvtg1AwjIxXefetuk912YEwjJNqbI";

const db = window.supabase.createClient(supabaseUrl, supabaseKey);

const widget = document.getElementById("widget");
const grid = document.getElementById("visionGrid");
const titleDisplay = document.getElementById("visionTitle");

const titleInput = document.getElementById("boardTitle");
const imageUpload = document.getElementById("imageUpload");

const editBtn = document.getElementById("editBtn");
const editOptions = document.getElementById("editOptions");

const themeBtn = document.getElementById("themeBtn");
const themeOptions = document.getElementById("themeOptions");

const fontBtn = document.getElementById("fontToggle");
const fontOptions = document.getElementById("fontOptions");

const copyBtn = document.getElementById("copyLinkBtn");

const gridOptions = document.querySelectorAll(".pill-option[data-grid]");
const widgetOptions = document.querySelectorAll(".pill-option[data-size]");
const messinessOptions = document.querySelectorAll("#messinessOptions .pill-option");
const titleStyleOptions = document.querySelectorAll("#titleStyleOptions .pill-option");
const titlePositionOptions = document.querySelectorAll("#titlePositionOptions .pill-option");

const tabs = document.querySelectorAll(".icon-tab");
const icons = document.querySelectorAll(".icon-option");

const params = new URLSearchParams(window.location.search);
const isEmbed = params.get("embed") === "true";

if (isEmbed) {
  document.documentElement.classList.add("embed-mode");
}

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
  titleX: params.get("titleX") ? parseFloat(params.get("titleX")) : null,
  titleY: params.get("titleY") ? parseFloat(params.get("titleY")) : null
};

if (params.get("tiles")) {
  try {
    state.tiles = JSON.parse(decodeURIComponent(params.get("tiles")));
  } catch (e) {
    state.tiles = [];
  }
}

if (params.get("stickers")) {
  try {
    state.stickers = JSON.parse(decodeURIComponent(params.get("stickers")));
  } catch (e) {
    state.stickers = [];
  }
}

async function uploadImage(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const fileName = `${Date.now()}-${safeName}`;

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

function updateGrid() {
  if (!grid) return;
  grid.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
}

function setGridSize(size) {
  state.gridSize = Number(size) || 3;
  updateGrid();

  gridOptions.forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.grid) === state.gridSize);
  });
}

function setWidgetSize(size) {
  state.widgetSize = size || "medium";

  if (!widget) return;

  widget.classList.remove("size-small", "size-medium", "size-large");
  widget.classList.add(`size-${state.widgetSize}`);

  widgetOptions.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.size === state.widgetSize);
  });
}

function setTitleStyle(style) {
  state.titleStyle = style || "plain";

  if (!titleDisplay) return;

  titleDisplay.classList.remove(
    "title-plain",
    "title-pill",
    "title-outline",
    "title-soft"
  );

  titleDisplay.classList.add(`title-${state.titleStyle}`);

  titleStyleOptions.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.style === state.titleStyle);
  });
}

function setTitlePosition(pos) {
  state.titlePosition = pos || "top-center";

  if (!titleDisplay) return;

  titleDisplay.classList.remove(
    "title-pos-top-left",
    "title-pos-top-center",
    "title-pos-center",
    "title-pos-floating"
  );

  titleDisplay.classList.add(`title-pos-${state.titlePosition}`);

  titleDisplay.style.cursor =
    state.titlePosition === "floating" && !isEmbed ? "grab" : "default";

  titlePositionOptions.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.pos === state.titlePosition);
  });
}

function setTheme(theme) {
  state.theme = theme || "beige";

  if (!widget) return;

  widget.classList.remove("beige", "pink", "blue", "green", "black", "white");
  widget.classList.add(state.theme);

  const themeColors = {
    pink: "#f4dfeb",
    beige: "#faebdd",
    blue: "#ddebf1",
    green: "#ddedea",
    black: "#17171a",
    white: "#f8f6f3"
  };

  if (themeBtn) {
    themeBtn.style.setProperty("--theme-color", themeColors[state.theme]);
    themeBtn.style.backgroundColor = themeColors[state.theme];
  }
}

function setFont(font) {
  state.font = font || "default";

  if (!widget) return;

  widget.classList.remove("font-default", "font-serif", "font-mono");
  widget.classList.add(`font-${state.font}`);
}

function updateTitle() {
  if (!titleDisplay) return;
  titleDisplay.textContent = (state.title || "my vision board").toLowerCase();
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
      scale = 1 + Math.random() * 0.05;
    }

    if (state.messiness === 2) {
      rotation = (Math.random() - 0.5) * 10;
      scale = 1 + Math.random() * 0.1;
      offsetX = (Math.random() - 0.5) * 6;
      offsetY = (Math.random() - 0.5) * 6;
      z = Math.floor(Math.random() * 10);
    }

    if (state.messiness === 3) {
      rotation = (Math.random() - 0.5) * 18;
      scale = 1 + Math.random() * 0.2;
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

function renderBoard() {
  if (!grid) return;

  grid.innerHTML = "";

  state.tiles.forEach((tile) => {
    const div = document.createElement("div");
    div.classList.add("vision-tile");

    const img = document.createElement("img");
    img.src = tile.src;
    img.alt = "";

    div.appendChild(img);
    grid.appendChild(div);
  });

  applyMessiness();
}

function renderStickers() {
  document.querySelectorAll(".sticker").forEach((s) => s.remove());

  state.stickers.forEach((sticker) => {
    const el = document.createElement("div");
    el.className = "sticker";
    el.dataset.id = sticker.id;

    const src = sticker.src || (sticker.icon ? `./assets/icons/${sticker.icon}.svg` : "");

    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";

    img.onerror = () => {
      console.warn("missing icon:", src);
      el.style.display = "none";
    };

    el.style.width = "40px";
    el.style.height = "40px";
    el.style.position = "absolute";
    el.style.left = `${sticker.x}px`;
    el.style.top = `${sticker.y}px`;
    el.style.zIndex = 30;
    el.style.cursor = isEmbed ? "default" : "grab";
    el.style.filter = "drop-shadow(0 2px 6px rgba(0,0,0,0.15))";

    el.appendChild(img);

    if (!isEmbed) {
      makeDraggable(el, sticker);

      const deleteBtn = document.createElement("div");
      deleteBtn.textContent = "×";
      deleteBtn.className = "sticker-delete";

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.stickers = state.stickers.filter((s) => s.id !== sticker.id);
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
    if (isEmbed) return;

    e.stopPropagation();
    isDragging = true;

    const rect = el.getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging || !widget) return;

    const widgetRect = widget.getBoundingClientRect();

    let x = e.clientX - widgetRect.left - offsetX;
    let y = e.clientY - widgetRect.top - offsetY;

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

function closeMenus() {
  editOptions?.classList.add("hidden");
  themeOptions?.classList.add("hidden");
  fontOptions?.classList.add("hidden");
}

function buildEmbedURL() {
  const base = window.location.origin + window.location.pathname;

  const tiles = encodeURIComponent(JSON.stringify(state.tiles));
  const stickers = encodeURIComponent(JSON.stringify(state.stickers));

  return (
    `${base}` +
    `?title=${encodeURIComponent(state.title)}` +
    `&gridSize=${encodeURIComponent(state.gridSize)}` +
    `&tiles=${tiles}` +
    `&theme=${encodeURIComponent(state.theme)}` +
    `&font=${encodeURIComponent(state.font)}` +
    `&widgetSize=${encodeURIComponent(state.widgetSize)}` +
    `&titleStyle=${encodeURIComponent(state.titleStyle)}` +
    `&titlePosition=${encodeURIComponent(state.titlePosition)}` +
    `&messiness=${encodeURIComponent(state.messiness)}` +
    `&stickers=${stickers}` +
    `&titleX=${state.titleX ?? ""}` +
    `&titleY=${state.titleY ?? ""}` +
    `&embed=true`
  );
}

/* BUILDER EVENTS ONLY */
if (!isEmbed) {
  imageUpload?.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
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

  titleInput?.addEventListener("input", (e) => {
    state.title = e.target.value || "my vision board";
    updateTitle();
  });

  editBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    editOptions?.classList.toggle("hidden");
    themeOptions?.classList.add("hidden");
    fontOptions?.classList.add("hidden");
  });

  themeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    themeOptions?.classList.toggle("hidden");
    editOptions?.classList.add("hidden");
    fontOptions?.classList.add("hidden");
  });

  fontBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    fontOptions?.classList.toggle("hidden");
    editOptions?.classList.add("hidden");
    themeOptions?.classList.add("hidden");
  });

  document.querySelectorAll(".theme-circle").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      setTheme(el.dataset.theme);
      themeOptions?.classList.add("hidden");
    });
  });

  document.querySelectorAll(".font-option").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      setFont(el.dataset.font);
      fontOptions?.classList.add("hidden");
    });
  });

  gridOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      setGridSize(btn.dataset.grid);
      renderBoard();
    });
  });

  widgetOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      setWidgetSize(btn.dataset.size);
    });
  });

  messinessOptions.forEach((el) => {
    el.addEventListener("click", () => {
      state.messiness = parseInt(el.dataset.mess) || 0;

      messinessOptions.forEach((btn) => btn.classList.remove("active"));
      el.classList.add("active");

      applyMessiness();
    });
  });

  titleStyleOptions.forEach((el) => {
    el.addEventListener("click", () => {
      setTitleStyle(el.dataset.style);
    });
  });

  titlePositionOptions.forEach((el) => {
    el.addEventListener("click", () => {
      setTitlePosition(el.dataset.pos);
    });
  });

  icons.forEach((icon) => {
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

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.category;

      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      icons.forEach((icon) => {
        const iconCat = icon.dataset.category;

        icon.style.display =
          category === "all" || iconCat === category ? "flex" : "none";
      });
    });
  });

  copyBtn?.addEventListener("click", async (e) => {
    e.stopPropagation();

    await navigator.clipboard.writeText(buildEmbedURL());

    const msg = document.getElementById("copyMessage");
    if (!msg) return;

    msg.classList.remove("hidden");
    msg.classList.add("show");

    clearTimeout(window.__copyTimer);
    window.__copyTimer = setTimeout(() => {
      msg.classList.add("hidden");
      msg.classList.remove("show");
    }, 1500);
  });

  document.addEventListener("click", (e) => {
    if (
      editOptions?.contains(e.target) ||
      themeOptions?.contains(e.target) ||
      fontOptions?.contains(e.target) ||
      editBtn?.contains(e.target) ||
      themeBtn?.contains(e.target) ||
      fontBtn?.contains(e.target)
    ) {
      return;
    }

    closeMenus();
  });
}

/* DRAGGABLE TITLE, BUILDER ONLY */
let titleDragging = false;
let titleOffsetX = 0;
let titleOffsetY = 0;

if (!isEmbed) {
  titleDisplay?.addEventListener("mousedown", (e) => {
    if (state.titlePosition !== "floating") return;

    e.stopPropagation();
    titleDragging = true;

    const rect = titleDisplay.getBoundingClientRect();

    titleOffsetX = e.clientX - rect.left;
    titleOffsetY = e.clientY - rect.top;

    titleDisplay.style.position = "absolute";
  });

  document.addEventListener("mousemove", (e) => {
    if (!titleDragging || !widget || !titleDisplay) return;

    const widgetRect = widget.getBoundingClientRect();

    let x = e.clientX - widgetRect.left - titleOffsetX;
    let y = e.clientY - widgetRect.top - titleOffsetY;

    x = Math.max(0, Math.min(x, widgetRect.width - titleDisplay.offsetWidth));
    y = Math.max(0, Math.min(y, widgetRect.height - titleDisplay.offsetHeight));

    titleDisplay.style.left = `${x}px`;
    titleDisplay.style.top = `${y}px`;
    titleDisplay.style.transform = "none";

    state.titleX = x;
    state.titleY = y;
  });

  document.addEventListener("mouseup", () => {
    titleDragging = false;
  });
}

function init() {
  if (titleInput) titleInput.value = state.title;

  setGridSize(state.gridSize);
  setWidgetSize(state.widgetSize);
  setTitleStyle(state.titleStyle);
  setTitlePosition(state.titlePosition);

  setTheme(state.theme);
  setFont(state.font);

  updateGrid();
  updateTitle();

  if (state.titleX !== null && state.titleY !== null && titleDisplay) {
    titleDisplay.style.position = "absolute";
    titleDisplay.style.left = `${state.titleX}px`;
    titleDisplay.style.top = `${state.titleY}px`;
    titleDisplay.style.transform = "none";
  }

  messinessOptions.forEach((btn) => {
    btn.classList.toggle(
      "active",
      Number(btn.dataset.mess) === state.messiness
    );
  });

  renderBoard();
  renderStickers();
  applyMessiness();
}

init();
