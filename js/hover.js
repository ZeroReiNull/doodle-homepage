/** Stable hitbox wrappers for floating hover effects. */
function stabilizeHoverTargets() {
  const targets = '.site-card, #site-manager .manage-row, .sketch-btn, .theme-follow, .import-choice, .icon-option, .search-wrapper, .language-picker, .hero, .doodle-pad-section, .form-group textarea, .form-group select:not(#language-select), .form-group input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"])';
  document.querySelectorAll(targets).forEach(control => {
    if (control.parentElement.classList.contains("lift-hitbox")) return;
    const box = document.createElement("div");
    box.className = "lift-hitbox";
    if (control.matches(".site-card")) {
      box.classList.add("card-shell");
      box.setAttribute("style", control.getAttribute("style") || "");
      box.style.setProperty("--surface-radius", getComputedStyle(control).borderRadius);
    } else if (control.matches("#site-manager .manage-row")) {
      box.classList.add("website-row-lift");
    } else if (control.matches(".menu-entry")) {
      box.classList.add("menu-lift");
    } else if (control.matches(".search-wrapper")) {
      box.classList.add("search-lift");
    } else if (control.matches(".hero, .doodle-pad-section")) {
      box.classList.add("panel-lift");
      if (control.matches(".doodle-pad-section")) box.classList.add("pad-lift");
    } else if (control.matches(".icon-option")) {
      box.classList.add("option-lift");
    } else if (control.matches("input, select, textarea, .language-picker")) {
      box.classList.add("block-lift");
    }
    if (control.classList.contains("manage-launcher")) {
      control.classList.remove("manage-launcher");
      box.classList.add("manage-launcher");
    }
    box.addEventListener("click", event => {
      if (event.target !== box) return;
      if (control.matches("input, select, textarea, .search-wrapper, .language-picker")) {
        const field = control.matches("input, select, textarea") ? control : control.querySelector("input, select");
        field?.focus();
      } else if (control.matches("button, label, a")) {
        control.click();
      }
    });
    control.before(box);
    box.append(control);
  });
}
