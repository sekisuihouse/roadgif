(() => {
  if (window.top !== window || location.protocol === "chrome-extension:") {
    return;
  }

  const STORAGE_DEFAULTS = {
    gifUrls: [],
    randomize: true
  };

  const OVERLAY_ID = "road-gif-loader-overlay";
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
    overlay.style.background = "#ffffff";
    overlay.style.display = "block";
    overlay.style.pointerEvents = "none";

    const frame = document.createElement("iframe");
    const encodedGifUrl = encodeURIComponent(gifUrl);
    frame.src = chrome.runtime.getURL(`loading.html#gif=${encodedGifUrl}`);
    frame.title = "Road GIF Loader";
    frame.style.position = "absolute";
    frame.style.inset = "0";
    frame.style.width = "100vw";
    frame.style.height = "100vh";
    frame.style.border = "0";
    frame.style.background = "#ffffff";
    frame.style.pointerEvents = "none";

    overlay.appendChild(frame);
    (document.documentElement || document.body).appendChild(overlay);

    return overlay;
  }

  function removeOverlay(overlay) {
    if (!overlay || !overlay.isConnected) {
      return;
    }

    overlay.remove();
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

    const overlay = createOverlay(gifUrl);

    if (!overlay) {
      return;
    }

    const remove = () => removeOverlay(overlay);

    if (document.readyState === "complete") {
      remove();
    } else {
      window.addEventListener("load", remove, { once: true });
      window.setTimeout(remove, MAX_VISIBLE_MS);
    }
  });
})();
