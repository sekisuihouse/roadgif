const mount = document.getElementById("gifMount");

function getRawGifUrl() {
  const params = new URLSearchParams(location.hash.slice(1));
  const value = params.get("gif");
  return value || "";
}

function normalizeTenorUrl(rawUrl) {
  const url = new URL(rawUrl);
  const host = url.hostname.toLowerCase();

  if (url.protocol !== "https:") {
    throw new Error("Only https URLs are allowed.");
  }

  if (host === "media.tenor.com") {
    return { type: "image", url: url.href };
  }

  if (!(host === "tenor.com" || host.endsWith(".tenor.com"))) {
    throw new Error("Only Tenor URLs are allowed.");
  }

  if (url.pathname.startsWith("/embed/")) {
    return { type: "frame", url: url.href };
  }

  const numericId = url.pathname.match(/(\d{5,})(?:\/)?$/)?.[1];
  if (numericId) {
    return { type: "frame", url: `https://tenor.com/embed/${numericId}` };
  }

  return { type: "frame", url: url.href };
}

function renderFallback(message) {
  const node = document.createElement("div");
  node.className = "fallback";
  node.textContent = message;
  mount.replaceChildren(node);
}

function renderGif(resource) {
  if (resource.type === "image") {
    const img = document.createElement("img");
    img.src = resource.url;
    img.alt = "Tenor GIF";
    img.referrerPolicy = "no-referrer";
    mount.replaceChildren(img);
    return;
  }

  const frame = document.createElement("iframe");
  frame.src = resource.url;
  frame.title = "Tenor GIF";
  frame.allow = "autoplay; fullscreen";
  frame.referrerPolicy = "no-referrer";
  frame.loading = "eager";
  mount.replaceChildren(frame);
}

try {
  const rawGifUrl = getRawGifUrl();
  if (!rawGifUrl) {
    throw new Error("No GIF URL configured.");
  }

  renderGif(normalizeTenorUrl(rawGifUrl));
} catch (error) {
  renderFallback(`GIFを表示できませんでした: ${error.message}`);
}
