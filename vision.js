const supabaseUrl = "https://fcajhwkmsyztkvyzjhkl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYXNlIiwicmVmIjoiZmNhamh3a21zeXp0a3Z5empoa2wiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3Nzk5MTQ4MiwiZXhwIjoyMDkzNTY3NDgyfQ.fbdUZmZbDCi5IhTvtg1AwjIxXefetuk912YEwjJNqbI";

const db = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
  const widget = document.getElementById("widget");
  const previewWidget = document.getElementById("previewWidget");

  const grid = document.getElementById("visionGrid");
  const previewGrid = document.querySelector(".preview-vision-grid");

  const titleDisplay = document.getElementById("visionTitle");
  const previewTitle = document.getElementById("previewVisionTitle");

  const titleInput = document.getElementById("boardTitle");
  const imageUpload = document.getElementById("imageUpload");

  const editBtn = document.getElementById("editBtn");
  const editOptions = document.getElementById("editOptions");

  const themeBtn = document.getElementById("themeBtn");
  const themeOptions = document.getElementById("themeOptions");
  const themeCircles = document.querySelectorAll(".theme-circle");

  const appearanceToggle = document.getElementById("appearanceToggle");
  const appearanceOptions = document.getElementById("appearanceOptions");
  const appearanceChoices = document.querySelectorAll(".appearance-option");

  const fontBtn = document.getElementById("fontToggle");
  const fontOptions = document.getElementById("fontOptions");
  const fontChoices = document.querySelectorAll(".font-option");

  const copyBtn = document.getElementById("copyLinkBtn");
  const copyMessage = document.getElementById("copyMessage");

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

  const themeColors = {
    pink: "#f4dfeb",
    beige: "#faebdd",
    blue: "#ddebf1",
    green: "#ddedea",
    black: "#17171a",
    white: "#f8f6f3"
  };

  let state = {
    title: params.get("title") || localStorage.getItem("visionTitle") || "my vision board",
    theme: params.get("theme") || localStorage.getItem("visionTheme") || "pink",
    font: params.get("font") || localStorage.getItem("visionFont") || "default",
    appearance:
      params.get("appearance") ||
      localStorage.getItem("visionAppearance") ||
      "system",
    gridSize: Number(params.get("gridSize")) || Number(localStorage.getItem("visionGridSize")) || 2,
    tiles: [],
    stickers: [],
    widgetSize: params.get("widgetSize") || localStorage.getItem("visionWidgetSize") || "large",
    titleStyle: params.get("titleStyle") || localStorage.getItem("visionTitleStyle") || "plain",
    titlePosition: params.get("titlePosition") || localStorage.getItem("visionTitlePosition") || "top-left",
    messiness: Number(params.get("messiness")) || Number(localStorage.getItem("visionMessiness")) || 0,
    titleX: params.get("titleX") ? Number(params.get("titleX")) : null,
    titleY: params.get("titleY") ? Number(params.get("titleY")) : null
  };

  if (params.get("tiles")) {
    try {
      state.tiles = JSON.parse(decodeURIComponent(params.get("tiles")));
    } catch {
      state.tiles = [];
    }
  }

  if (params.get("stickers")) {
    try {
      state.stickers = JSON.parse(decodeURIComponent(params.get("stickers")));
    } catch {
      state.stickers = [];
    }
  }

  function saveState() {
    localStorage.setItem("visionTitle", state.title);
    localStorage.setItem("visionTheme", state.theme);
    localStorage.setItem("visionFont", state.font);
    localStorage.setItem("visionAppearance", state.appearance);
    localStorage.setItem("visionGridSize", state.gridSize);
    localStorage.setItem("visionWidgetSize", state.widgetSize);
    localStorage.setItem("visionTitleStyle", state.titleStyle);
    localStorage.setItem("visionTitlePosition", state.titlePosition);
    localStorage.setItem("visionMessiness", state.messiness);
  }

  function updateBothWidgets(callback) {
    [widget, previewWidget].forEach((item) => {
      if (item) callback(item);
    });
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

  function applyTheme(theme) {
    state.theme = theme || "pink";

    updateBothWidgets((item) => {
      item.classList.remove("pink", "beige", "blue", "green", "black", "white");
      item.classList.add(state.theme);
    });

    if (themeBtn) {
      themeBtn.style.setProperty(
        "--theme-color",
        themeColors[state.theme] || themeColors.pink
      );
      themeBtn.style.backgroundColor =
        themeColors[state.theme] || themeColors.pink;
    }

    saveState();
  }

  function applyFont(font) {
    state.font = font || "default";

    updateBothWidgets((item) => {
      item.classList.remove("font-default", "font-serif", "font-mono");
      item.classList.add(`font-${state.font}`);
    });

    saveState();
  }

  function applyAppearance(appearance) {
    state.appearance = appearance || "system";

    document.body.classList.remove(
      "appearance-light",
      "appearance-dark",
      "appearance-system"
    );

    document.body.classList.add(`appearance-${state.appearance}`);
    saveState();
  }

  function setGridSize(size) {
    state.gridSize = Number(size) || 2;

    if (grid) {
      grid.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
    }

    if (previewGrid) {
      previewGrid.style.gridTemplateColumns = `repeat(${Math.min(state.gridSize, 3)}, 1fr)`;
    }

    gridOptions.forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.grid) === state.gridSize);
    });

    saveState();
  }

  function setWidgetSize(size) {
    state.widgetSize = size || "large";

    updateBothWidgets((item) => {
      item.classList.remove("size-small", "size-medium", "size-large");
      item.classList.add(`size-${state.widgetSize}`);
    });

    widgetOptions.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.size === state.widgetSize);
    });

    saveState();
  }

  function setTitleStyle(style) {
    state.titleStyle = style || "plain";

    [titleDisplay, previewTitle].forEach((title) => {
      if (!title) return;

      title.classList.remove(
        "title-plain",
        "title-pill",
        "title-outline",
        "title-soft"
      );

      title.classList.add(`title-${state.titleStyle}`);
    });

    titleStyleOptions.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.style === state.titleStyle);
    });

    saveState();
  }

  function setTitlePosition(pos) {
    state.titlePosition = pos || "top-left";

    if (!titleDisplay) return;

    titleDisplay.classList.remove(
      "title-pos-top-left",
      "title-pos-top-center",
      "title-pos-center",
      "title-pos-floating"
    );

    titleDisplay.classList.add(`title-pos-${state.titlePosition}`);
    titleDisplay.style.cursor = state.titlePosition === "floating" ? "grab" : "default";

    titlePositionOptions.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.pos === state.titlePosition);
    });

    saveState();
  }

  function updateTitle() {
    const title = (state.title || "my vision board").toLowerCase();

    if (titleDisplay) titleDisplay.textContent = title;
    if (previewTitle) previewTitle.textContent = title;

    saveState();
  }

  function renderBoard() {
    if (!grid) return;

    grid.innerHTML = "";

    state.tiles.forEach((tile) => {
      const div = document.createElement("div");
      div.className = "vision-tile";

      const img = document.createElement("img");
      img.src = tile.src;
      img.alt = "";

      div.appendChild(img);
      grid.appendChild(div);
    });

    applyMessiness();
  }

  function applyMessiness() {
    const tiles = document.querySelectorAll("#visionGrid .vision-tile");

    tiles.forEach((tile, index) => {
      let rotation = 0;
      let scale = 1;
      let offsetX = 0;
      let offsetY = 0;
      let z = index;

      if (state.messiness === 1) {
        rotation = (Math.random() - 0.5) * 4;
        scale = 1 + Math.random() * 0.03;
      }

      if (state.messiness === 2) {
        rotation = (Math.random() - 0.5) * 8;
        scale = 1 + Math.random() * 0.06;
        offsetX = (Math.random() - 0.5) * 5;
        offsetY = (Math.random() - 0.5) * 5;
        z = Math.floor(Math.random() * 10);
      }

      if (state.messiness === 3) {
        rotation = (Math.random() - 0.5) * 14;
        scale = 1 + Math.random() * 0.1;
        offsetX = (Math.random() - 0.5) * 10;
        offsetY = (Math.random() - 0.5) * 10;
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

  function renderStickers() {
    widget?.querySelectorAll(".sticker").forEach((s) => s.remove());

    state.stickers.forEach((sticker) => {
      const el = document.createElement("div");
      el.className = "sticker";
      el.dataset.id = sticker.id;

      const src = sticker.src || `./assets/icons/${sticker.icon}.svg`;

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
      el.style.left = `${sticker.x}px`;
      el.style.top = `${sticker.y}px`;
      el.style.cursor = "grab";
      el.style.filter = "drop-shadow(0 2px 6px rgba(0,0,0,0.15))";

      el.appendChild(img);

      if (!isEmbed) {
        makeStickerDraggable(el, sticker);

        const deleteBtn = document.createElement("div");
        deleteBtn.textContent = "×";
        deleteBtn.className = "sticker-delete";

        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          state.stickers = state.stickers.filter((s) => s.id !== sticker.id);
          renderStickers();
          saveState();
        });

        el.appendChild(deleteBtn);
      }

      widget.appendChild(el);
    });
  }

  function makeStickerDraggable(el, sticker) {
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    el.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      dragging = true;

      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging || !widget) return;

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
      if (!dragging) return;
      dragging = false;
      saveState();
    });
  }

  function closeMenus() {
    editOptions?.classList.add("hidden");
    themeOptions?.classList.add("hidden");
    fontOptions?.classList.add("hidden");
    appearanceOptions?.classList.add("hidden");
  }

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
    saveState();
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
    appearanceOptions?.classList.add("hidden");
  });

  themeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    themeOptions?.classList.toggle("hidden");
    editOptions?.classList.add("hidden");
    fontOptions?.classList.add("hidden");
    appearanceOptions?.classList.add("hidden");
  });

  appearanceToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    appearanceOptions?.classList.toggle("hidden");
    editOptions?.classList.add("hidden");
    themeOptions?.classList.add("hidden");
    fontOptions?.classList.add("hidden");
  });

  fontBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    fontOptions?.classList.toggle("hidden");
    editOptions?.classList.add("hidden");
    themeOptions?.classList.add("hidden");
    appearanceOptions?.classList.add("hidden");
  });

  themeCircles.forEach((circle) => {
    circle.addEventListener("click", (e) => {
      e.stopPropagation();
      applyTheme(circle.dataset.theme);
      themeOptions?.classList.add("hidden");
    });
  });

  appearanceChoices.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      applyAppearance(option.dataset.appearance);
      appearanceOptions?.classList.add("hidden");
    });
  });

  fontChoices.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      applyFont(option.dataset.font);
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

  messinessOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.messiness = Number(btn.dataset.mess) || 0;

      messinessOptions.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");

      applyMessiness();
      saveState();
    });
  });

  titleStyleOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTitleStyle(btn.dataset.style);
    });
  });

  titlePositionOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTitlePosition(btn.dataset.pos);
    });
  });

  icons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const iconId = icon.dataset.icon;

      state.stickers.push({
        id: Date.now() + Math.random(),
        icon: iconId,
        src: `./assets/icons/${iconId}.svg`,
        x: 120,
        y: 120
      });

      renderStickers();
      saveState();
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

    const base = window.location.origin + window.location.pathname;
    const tiles = encodeURIComponent(JSON.stringify(state.tiles));
    const stickers = encodeURIComponent(JSON.stringify(state.stickers));

    const url =
      `${base}` +
      `?title=${encodeURIComponent(state.title)}` +
      `&theme=${encodeURIComponent(state.theme)}` +
      `&font=${encodeURIComponent(state.font)}` +
      `&appearance=${encodeURIComponent(state.appearance)}` +
      `&gridSize=${encodeURIComponent(state.gridSize)}` +
      `&widgetSize=${encodeURIComponent(state.widgetSize)}` +
      `&titleStyle=${encodeURIComponent(state.titleStyle)}` +
      `&titlePosition=${encodeURIComponent(state.titlePosition)}` +
      `&messiness=${encodeURIComponent(state.messiness)}` +
      `&tiles=${tiles}` +
      `&stickers=${stickers}` +
      `&titleX=${state.titleX ?? ""}` +
      `&titleY=${state.titleY ?? ""}` +
      `&embed=true`;

    await navigator.clipboard.writeText(url);

    copyMessage?.classList.remove("hidden");
    copyMessage?.classList.add("show");

    clearTimeout(window.__copyTimer);
    window.__copyTimer = setTimeout(() => {
      copyMessage?.classList.add("hidden");
      copyMessage?.classList.remove("show");
    }, 1500);
  });

  document.addEventListener("click", closeMenus);

  let titleDragging = false;
  let titleOffsetX = 0;
  let titleOffsetY = 0;

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
    if (!titleDragging) return;
    titleDragging = false;
    saveState();
  });

  function init() {
    if (titleInput) titleInput.value = state.title;

    applyTheme(state.theme);
    applyFont(state.font);
    applyAppearance(state.appearance);

    setGridSize(state.gridSize);
    setWidgetSize(state.widgetSize);
    setTitleStyle(state.titleStyle);
    setTitlePosition(state.titlePosition);
    updateTitle();

    if (state.titleX !== null && state.titleY !== null && titleDisplay) {
      titleDisplay.style.position = "absolute";
      titleDisplay.style.left = `${state.titleX}px`;
      titleDisplay.style.top = `${state.titleY}px`;
      titleDisplay.style.transform = "none";
    }

    messinessOptions.forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.mess) === state.messiness);
    });

    renderBoard();
    renderStickers();
  }

  init();
});
