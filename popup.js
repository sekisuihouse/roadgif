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

function isAllowedTenorUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      (host === "tenor.com" ||
        host.endsWith(".tenor.com") ||
        host === "media.tenor.com")
    );
  } catch {
    return false;
  }
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
  const urls = splitLines(textarea.value);
  const invalidUrls = urls.filter((url) => !isAllowedTenorUrl(url));

  if (invalidUrls.length > 0) {
    setStatus(`Tenorのhttps URLだけ保存できます: ${invalidUrls[0]}`, true);
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
