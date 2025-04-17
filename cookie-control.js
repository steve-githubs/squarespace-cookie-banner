document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("cookiesAccepted") === "true") {
    const banner = document.querySelector(".gdpr-cookie-banner.full-styling.BOTTOM_LEFT");
    if (banner) banner.style.display = "none";
    return;
  }

  let overlays = [];

  function createOverlay(left, top, width, height) {
    const overlay = document.createElement("div");
    overlay.style.cssText = \`
      position: fixed;
      left: \${left}px;
      top: \${top}px;
      width: \${width}px;
      height: \${height}px;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 9998;
    \`;
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
    overlays.push(overlay);
  }

  function removeOverlays() {
    overlays.forEach(overlay => overlay.remove());
    overlays = [];
  }

  function enableSiteAccess() {
    removeOverlays();
    const banner = document.querySelector(".gdpr-cookie-banner.full-styling.BOTTOM_LEFT");
    if (banner) banner.style.display = "none";
    localStorage.setItem("cookiesAccepted", "true");
  }

  function setupOverlays() {
    const banner = document.querySelector(".gdpr-cookie-banner.full-styling.BOTTOM_LEFT");
    if (!banner) return;
    const rect = banner.getBoundingClientRect();

    createOverlay(0, 0, window.innerWidth, rect.top);
    createOverlay(0, rect.bottom, window.innerWidth, window.innerHeight - rect.bottom);
    createOverlay(0, rect.top, rect.left, rect.height);
    createOverlay(rect.right, rect.top, window.innerWidth - rect.right, rect.height);
  }

  let attempts = 0;
  const maxAttempts = 50;
  const checkElements = setInterval(() => {
    const banner = document.querySelector(".gdpr-cookie-banner.full-styling.BOTTOM_LEFT");
    const acceptBtn = document.querySelector(".sqs-cookie-banner-v2-accept");
    const declineBtn = document.querySelector(".sqs-cookie-banner-v2-deny");
    const manageBtn = document.querySelector(".manage");
    const savePreferencesBtn = document.querySelector("button.save");

    if (banner && acceptBtn && declineBtn && manageBtn) {
      clearInterval(checkElements);
      setupOverlays();

      acceptBtn.addEventListener("click", enableSiteAccess);
      declineBtn.addEventListener("click", enableSiteAccess);
      manageBtn.addEventListener("click", enableSiteAccess);

      const observer = new MutationObserver(() => {
        const saveBtn = document.querySelector("button.save");
        if (saveBtn) {
          saveBtn.addEventListener("click", enableSiteAccess);
          observer.disconnect();
        }
      });

      if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener("click", enableSiteAccess);
      } else {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    } else if (attempts >= maxAttempts) {
      clearInterval(checkElements);
      console.log("Cookie banner or buttons not found.");
    }
    attempts++;
  }, 100);

  window.addEventListener("resize", () => {
    if (overlays.length) {
      removeOverlays();
      setupOverlays();
    }
  });

  window.addEventListener("popstate", () => {
    if (localStorage.getItem("cookiesAccepted") === "true") {
      removeOverlays();
      const banner = document.querySelector(".gdpr-cookie-banner.full-styling.BOTTOM_LEFT");
      if (banner) banner.style.display = "none";
    }
  });
});