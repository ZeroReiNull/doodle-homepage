/**
 * Icon catalog, image validation, crop editor, and icon-picker rendering.
 * Depends on: t() from i18n-theme.js and openDialog() at interaction time.
 */
const DEFAULT_SITES = [
  {
    title: "Website slot #1",
    url: "https://example.com",
    category: "Personal Projects",
    desc: "A space for your personal project. Add your own website name and link using the manager in the bottom-right corner.",
    icon: "star"
  },
  {
    title: "Website slot #2",
    url: "https://example.com",
    category: "Tools & Services",
    desc: "A shortcut to your self-hosted tools or services, with quick access and category filters.",
    icon: "gear"
  },
  {
    title: "Website slot #3",
    url: "https://example.com",
    category: "Blog & Notes",
    desc: "A home for your blog, knowledge base or journal, collecting notes on everyday development and experiments.",
    icon: "book"
  },
  {
    title: "Website slot #4",
    url: "https://example.com",
    category: "Experiments",
    desc: "A space for frontend demos and creative little projects. Add or remove them anytime.",
    icon: "spark"
  }
];

const iconSVG = paths => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ICONS = {
  star: iconSVG('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>'),
  gear: iconSVG('<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>'),
  book: iconSVG('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>'),
  spark: iconSVG('<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>'),
  globe: iconSVG('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18"/>'),
  code: iconSVG('<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>'),
  home: iconSVG('<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>'),
  heart: iconSVG('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>')
};
const WEBSITE_ICON = iconSVG('<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.15 1.15"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.15-1.15"/>');
const UPLOAD_ICON = iconSVG('<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/><path d="M16 3v6m-3-3h6"/>');
const ICON_LABELS = {
  star: "星星",
  gear: "齿轮",
  book: "书本",
  spark: "闪电",
  globe: "地球",
  code: "代码",
  home: "房屋",
  heart: "爱心"
};

const CUSTOM_ICON_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"]);
const CUSTOM_ICON_LIMIT = 5 * 1024 * 1024;
const CUSTOM_ICON_DATA_LIMIT = Math.ceil(CUSTOM_ICON_LIMIT * 4 / 3) + 100;
const CROPPED_ICON_SIZE = 1024;

function validCustomIcon(value) {
  return typeof value === "string" && value.length <= CUSTOM_ICON_DATA_LIMIT &&
    /^data:image\/(?:png|jpeg|webp|x-icon|vnd\.microsoft\.icon);base64,[a-z0-9+/=]+$/i.test(value);
}

async function readCustomIcon(file) {
  if (file.size > CUSTOM_ICON_LIMIT) throw new Error(t("图标文件不能超过 5 MB。"));
  const iconType = CUSTOM_ICON_TYPES.has(file.type)
    ? file.type
    : (/\.ico$/i.test(file.name) ? "image/x-icon" : "");
  if (!iconType) throw new Error(t("请选择 PNG、JPEG、WebP 或 ICO 图片。"));
  const result = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(file.type
      ? reader.result
      : String(reader.result).replace(/^data:[^;,]+/, "data:" + iconType));
    reader.onerror = () => reject(reader.error || new Error("Unable to read icon."));
    reader.readAsDataURL(file);
  });
  if (!validCustomIcon(result)) throw new Error(t("请选择 PNG、JPEG、WebP 或 ICO 图片。"));
  return result;
}

const cropCanvas = document.getElementById("icon-crop-canvas");
const cropContext = cropCanvas.getContext("2d");
const cropZoom = document.getElementById("icon-crop-zoom");
let cropState = null;
let cropReturnModal = "manage-modal";
let cropResolve = null;

function clampCropOffset() {
  if (!cropState) return;
  const scale = cropState.baseScale * cropState.zoom;
  const overflowX = Math.max(0, (cropState.image.naturalWidth * scale - cropCanvas.width) / 2);
  const overflowY = Math.max(0, (cropState.image.naturalHeight * scale - cropCanvas.height) / 2);
  cropState.offsetX = Math.max(-overflowX, Math.min(overflowX, cropState.offsetX));
  cropState.offsetY = Math.max(-overflowY, Math.min(overflowY, cropState.offsetY));
}

function drawIconCrop() {
  if (!cropState) return;
  clampCropOffset();
  const scale = cropState.baseScale * cropState.zoom;
  const width = cropState.image.naturalWidth * scale;
  const height = cropState.image.naturalHeight * scale;
  cropContext.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
  cropContext.drawImage(
    cropState.image,
    (cropCanvas.width - width) / 2 + cropState.offsetX,
    (cropCanvas.height - height) / 2 + cropState.offsetY,
    width,
    height
  );
}

function openIconCropper(dataURL, returnModal) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      cropState = {
        image,
        zoom: 1,
        baseScale: Math.max(cropCanvas.width / image.naturalWidth, cropCanvas.height / image.naturalHeight),
        offsetX: 0,
        offsetY: 0,
        pointerId: null,
        lastX: 0,
        lastY: 0
      };
      cropReturnModal = returnModal;
      cropResolve = resolve;
      cropZoom.value = "1";
      drawIconCrop();
      openDialog("icon-crop-modal");
    };
    image.onerror = () => reject(new Error(t("请选择 PNG、JPEG、WebP 或 ICO 图片。")));
    image.src = dataURL;
  });
}

function finishIconCrop(result) {
  const resolve = cropResolve;
  cropResolve = null;
  cropState = null;
  openDialog(cropReturnModal);
  resolve?.(result);
}

cropCanvas.addEventListener("pointerdown", e => {
  if (!cropState || cropState.pointerId !== null) return;
  cropState.pointerId = e.pointerId;
  cropState.lastX = e.clientX;
  cropState.lastY = e.clientY;
  cropCanvas.setPointerCapture(e.pointerId);
  cropCanvas.classList.add("dragging");
});

cropCanvas.addEventListener("pointermove", e => {
  if (!cropState || e.pointerId !== cropState.pointerId) return;
  const rect = cropCanvas.getBoundingClientRect();
  const ratio = cropCanvas.width / rect.width;
  cropState.offsetX += (e.clientX - cropState.lastX) * ratio;
  cropState.offsetY += (e.clientY - cropState.lastY) * ratio;
  cropState.lastX = e.clientX;
  cropState.lastY = e.clientY;
  drawIconCrop();
});

function stopCropDrag(e) {
  if (!cropState || e.pointerId !== cropState.pointerId) return;
  cropState.pointerId = null;
  cropCanvas.classList.remove("dragging");
}

cropCanvas.addEventListener("pointerup", stopCropDrag);
cropCanvas.addEventListener("pointercancel", stopCropDrag);
cropZoom.addEventListener("input", () => {
  if (!cropState) return;
  cropState.zoom = Number(cropZoom.value);
  drawIconCrop();
});
document.getElementById("cancel-icon-crop").addEventListener("click", () => finishIconCrop(null));
document.getElementById("apply-icon-crop").addEventListener("click", () => {
  if (!cropState) return;
  const output = document.createElement("canvas");
  output.width = CROPPED_ICON_SIZE;
  output.height = CROPPED_ICON_SIZE;
  const context = output.getContext("2d");
  context.drawImage(cropCanvas, 0, 0, cropCanvas.width, cropCanvas.height, 0, 0, output.width, output.height);
  finishIconCrop(output.toDataURL("image/png"));
});

function renderIconOptions(containerId, inputName, selected) {
  document.getElementById(containerId).innerHTML = Object.keys(ICONS).map(key =>
    `<label class="icon-option">
      <input class="sr-only" type="radio" name="${inputName}" value="${key}" ${key === selected ? "checked" : ""} />
      <span class="icon-squircle">${ICONS[key]}</span><span>${t(ICON_LABELS[key])}</span>
    </label>`
  ).join("");
}

function renderIconPicker(selected) {
  const customIcon = validCustomIcon(pendingCustomSiteIcon) ? pendingCustomSiteIcon : "";
  selected = selected || document.querySelector('input[name="site-icon"]:checked')?.value || "star";
  renderIconOptions("site-icon-options", "site-icon", selected);
  document.getElementById("site-icon-options").insertAdjacentHTML("beforeend", `
    <label class="icon-option">
      <input class="sr-only" type="radio" name="site-icon" value="website" ${selected === "website" ? "checked" : ""} />
      <span class="icon-squircle">${WEBSITE_ICON}</span><span>${t("网站图标")}</span>
    </label>
    <label class="icon-option">
      <input class="sr-only" type="radio" name="site-icon" value="custom" ${selected === "custom" ? "checked" : ""} />
      <span class="icon-squircle">${customIcon ? `<img class="custom-icon-preview" src="${customIcon}" alt="" />` : UPLOAD_ICON}</span><span>${t("自定义")}</span>
    </label>`);
}

let pendingCustomSiteIcon = "";
let pendingCustomFavicon = "";

function renderFaviconPicker(selected) {
  const customIcon = validCustomIcon(pendingCustomFavicon)
    ? pendingCustomFavicon
    : (validCustomIcon(profile.customFavicon) ? profile.customFavicon : "");
  selected = selected || (profile.favicon === "custom" && validCustomIcon(profile.customFavicon)
    ? "custom"
    : (Object.hasOwn(ICONS, profile.favicon) ? profile.favicon : "star"));
  renderIconOptions("favicon-options", "favicon-icon", selected);
  const preview = customIcon
    ? `<img class="custom-icon-preview" src="${customIcon}" alt="" />`
    : UPLOAD_ICON;
  document.getElementById("favicon-options").insertAdjacentHTML("beforeend", `
    <label class="icon-option">
      <input class="sr-only" type="radio" name="favicon-icon" value="custom" ${selected === "custom" ? "checked" : ""} />
      <span class="icon-squircle">${preview}</span><span>${t("自定义")}</span>
    </label>`);
}

function connectCustomIconPicker(containerId, inputName, fileInputId) {
  document.getElementById(containerId).addEventListener("click", e => {
    if (e.target.matches(`input[name="${inputName}"][value="custom"]`)) {
      document.getElementById(fileInputId).click();
    }
  });
}

connectCustomIconPicker("site-icon-options", "site-icon", "custom-site-icon-file");
connectCustomIconPicker("favicon-options", "favicon-icon", "custom-favicon-file");
