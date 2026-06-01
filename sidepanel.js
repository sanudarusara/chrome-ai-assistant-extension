const iframe = document.getElementById("contentFrame");

chrome.storage.local.get(
  ["sidePanelState"],
  (items) => {

    if (
      items.sidePanelState &&
      items.sidePanelState.url
    ) {
      iframe.src =
        items.sidePanelState.url;
    }

  }
);

chrome.storage.onChanged.addListener(
  (changes, namespace) => {

    if (
      namespace === "local" &&
      changes.sidePanelState
    ) {

      iframe.src =
        changes.sidePanelState.newValue.url;

    }

});