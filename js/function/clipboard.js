import Promise from './Promise';

// copyToClipboard
export function copyToClipboard(data) {
  if (!document.addEventListener)
    return;

  return new Promise(function(resolve, reject) {
    var fun = function(e) {
      document.removeEventListener("copy", fun);
      try {
        e
          .clipboardData
          .setData("text/plain", data);
        e.preventDefault();
        resolve(data);
        document.removeEventListener("copy", fun);
      } catch (e) {
        reject();
      }
    }

    // ie
    if (window.clipboardData) {
      window
        .clipboardData
        .setData("Text", data);
      resolve(data);
      return;
    }

    // chrome, firefox
    try {
      document.addEventListener("copy", fun);
      if (!document.execCommand("copy")) {
        reject();
      }
    } catch (e) {
      reject();
    }

  });
}
