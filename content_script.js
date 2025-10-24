(function () {
  try {
    if (!/(^|\.)google\./i.test(location.hostname)) return;
  } catch {
    return;
  }

  let acted = false;

  function attemptNavigate() {
    if (acted) return false;
    try {
      const el = document.getElementById("fprsl");
      if (!el) return false;

      let href = null;

      if (el.tagName && el.tagName.toLowerCase() === "a" && el.href) {
        href = el.href;
      } else {
        const a = el.querySelector ? el.querySelector("a[href]") : null;
        if (a && a.href) href = a.href;
      }

      if (!href && el.getAttribute) {
        href = el.getAttribute("href");
      }

      if (href) {
        acted = true;
        location.replace(href);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  function checkEnabledAndRun() {
    chrome.storage.local.get({ enabled: false }, (items) => {
      if (!items.enabled) return;
      acted = false;
      attemptNavigate();

      const observer = new MutationObserver(() => {
        attemptNavigate();
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });

      const start = Date.now();
      const pollInterval = 120;
      const timeout = 3000;

      const pollId = setInterval(() => {
        if (attemptNavigate() || Date.now() - start > timeout) {
          clearInterval(pollId);
          observer.disconnect();
        }
      }, pollInterval);
    });
  }

  // Detect URL changes in SPA navigation
  function onUrlChange(callback) {
    let lastUrl = location.href;

    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        callback();
      }
    });
    observer.observe(document, { subtree: true, childList: true });

    const pushState = history.pushState;
    history.pushState = function () {
      pushState.apply(this, arguments);
      callback();
    };

    const replaceState = history.replaceState;
    history.replaceState = function () {
      replaceState.apply(this, arguments);
      callback();
    };

    window.addEventListener("popstate", callback);
  }

  // Run on initial load
  checkEnabledAndRun();

  // Re-run when URL changes
  onUrlChange(checkEnabledAndRun);

  // Respond to storage changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.enabled && changes.enabled.newValue) {
      checkEnabledAndRun();
    }
  });
})();
