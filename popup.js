const STORAGE_KEYS = {
  gifUrls: "gifUrls",
  randomize: "randomize"
};

const textarea = document.getElementById("gifUrls");
const randomize = document.getElementById("randomize");
const saveButton = document.getElementById("save");
const clearButton = document.getElementById("clear");
const statusNode = document.getElementById("status");

function splitLines(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeTenorEmbed(rawEntry) {
  const entry = rawEntry.trim();
  const postId =
    entry.match(/data-postid=["']?(\d{3,})["']?/i)?.[1] ||
    entry.match(/tenor\.com\/(?:ja\/)?view\/[^"'\s<>]*?(\d{3,})(?:[/"'\s<>]|$)/i)?.[1] ||
    entry.match(/tenor\.com\/embed\/(\d{3,})(?:[/"'\s<>]|$)/i)?.[1];

  if (postId) {
    return `https://tenor.com/embed/${postId}`;
  }

  try {
    const url = new URL(entry);
    const host = url.hostname.toLowerCase();

    if (
      url.protocol === "https:" &&
      (host === "tenor.com" || host.endsWith(".tenor.com"))
    ) {
      return url.href;
    }

    if (url.protocol === "https:" && host === "media.tenor.com") {
      return url.href;
    }
  } catch {
    // Fall through to the validation error below.
  }

  throw new Error(`Tenor埋め込みHTMLからdata-postidを読み取れません: ${entry}`);
}

function normalizeEntries(value) {
  const seen = new Set();
  const entries = splitLines(value)
    .map(normalizeTenorEmbed)
    .filter((entry) => {
      if (seen.has(entry)) {
        return false;
      }
      seen.add(entry);
      return true;
    });

  return entries;
}

function setStatus(message, isError = false) {
  statusNode.textContent = message;
  statusNode.style.color = isError ? "#fca5a5" : "#93c5fd";
}

async function loadSettings() {
  const result = await chrome.storage.sync.get({
    [STORAGE_KEYS.gifUrls]: [],
    [STORAGE_KEYS.randomize]: true
  });

  textarea.value = result[STORAGE_KEYS.gifUrls].join("\n");
  randomize.checked = Boolean(result[STORAGE_KEYS.randomize]);
}

async function saveSettings() {
  let urls;
  try {
    urls = normalizeEntries(textarea.value);
  } catch (error) {
    setStatus(error.message, true);
    return;
  }

  await chrome.storage.sync.set({
    [STORAGE_KEYS.gifUrls]: urls,
    [STORAGE_KEYS.randomize]: randomize.checked
  });

  setStatus(`${urls.length}件のGIF URLを保存しました。`);
}

async function clearSettings() {
  textarea.value = "";
  await chrome.storage.sync.set({
    [STORAGE_KEYS.gifUrls]: [],
    [STORAGE_KEYS.randomize]: true
  });
  randomize.checked = true;
  setStatus("GIF URLをクリアしました。");
}

saveButton.addEventListener("click", saveSettings);
clearButton.addEventListener("click", clearSettings);

loadSettings().catch((error) => {
  setStatus(`設定の読み込みに失敗しました: ${error.message}`, true);
});
