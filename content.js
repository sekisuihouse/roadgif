(() => {
  if (window.top !== window || location.protocol === "chrome-extension:") {
    return;
  }

  const STORAGE_DEFAULTS = {
    gifUrls: [],
    randomize: true
  };

  const OVERLAY_ID = "road-gif-loader-overlay";
  const MIN_VISIBLE_MS = 900;
  const MAX_VISIBLE_MS = 9000;

  function chooseGifUrl(urls, randomize) {
    if (!urls.length) {
      return null;
    }

    if (!randomize || urls.length === 1) {
      return urls[0];
    }

    return urls[Math.floor(Math.random() * urls.length)];
  }

  function createOverlay(gifUrl) {
    if (document.getElementById(OVERLAY_ID)) {
      return null;
    }

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "2147483647";
    overlay.style.background =
      "radial-gradient(circle at center, rgba(30, 41, 59, 0.96), rgba(3, 7, 18, 0.98))";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.pointerEvents = "none";

    const frame = document.createElement("iframe");
    const encodedGifUrl = encodeURIComponent(gifUrl);
    frame.src = chrome.runtime.getURL(`loading.html#gif=${encodedGifUrl}`);
    frame.title = "Road GIF Loader";
    frame.style.width = "min(72vw, 520px)";
    frame.style.height = "min(72vh, 520px)";
    frame.style.border = "0";
    frame.style.borderRadius = "24px";
    frame.style.background = "transparent";
    frame.style.boxShadow = "0 28px 80px rgba(0, 0, 0, 0.45)";
    frame.style.pointerEvents = "none";

    overlay.appendChild(frame);
    (document.documentElement || document.body).appendChild(overlay);

    return overlay;
  }

  function removeOverlay(overlay, startedAt) {
    if (!overlay || !overlay.isConnected) {
      return;
    }

    const elapsed = Date.now() - startedAt;
    const delay = Math.max(0, MIN_VISIBLE_MS - elapsed);

    window.setTimeout(() => {
      overlay.style.transition = "opacity 180ms ease";
      overlay.style.opacity = "0";
      window.setTimeout(() => overlay.remove(), 220);
    }, delay);
  }

  chrome.storage.sync.get(STORAGE_DEFAULTS, (settings) => {
    if (chrome.runtime.lastError) {
      return;
    }

    const urls = Array.isArray(settings.gifUrls) ? settings.gifUrls : [];
    const gifUrl = chooseGifUrl(urls, Boolean(settings.randomize));

    if (!gifUrl) {
      return;
    }

    const startedAt = Date.now();
    const overlay = createOverlay(gifUrl);

    if (!overlay) {
      return;
    }

    const remove = () => removeOverlay(overlay, startedAt);

    if (document.readyState === "complete") {
      remove();
    } else {
      window.addEventListener("load", remove, { once: true });
      window.setTimeout(remove, MAX_VISIBLE_MS);
    }
  });
})();
