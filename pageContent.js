if (!window.hasAiPalSelectionListener) {
    window.hasAiPalSelectionListener = true;

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // Defensive connection monitoring healthcheck
        if (message.action === "ping") {
            sendResponse({ status: "alive" });
            return true;
        }

        if (message.action === "getSelection") {
            const selectedText = window.getSelection().toString();

            if (selectedText && selectedText.trim()) {
                chrome.storage.local.set({
                    livePrompt: {
                        text: selectedText,
                        timestamp: Date.now()
                    }
                });
            }
        }
    });
}