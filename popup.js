const checkbox = document.getElementById("enabled");

// Load state
chrome.storage.local.get({ enabled: false }, (data) => {
  checkbox.checked = data.enabled;
});

checkbox.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: checkbox.checked });
});
