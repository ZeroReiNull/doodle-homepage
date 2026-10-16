/** Application entry point. Run after every feature module has loaded. */
renderProfile();
applyLanguage();
stabilizeHoverTargets();
new MutationObserver(stabilizeHoverTargets).observe(document.body, { childList: true, subtree: true });
