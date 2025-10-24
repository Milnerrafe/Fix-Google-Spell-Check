// background.js
chrome.runtime.onInstalled.addListener(() => {
  // Set the default state to enabled when first installed
  chrome.storage.local.set({ enabled: true });
});
