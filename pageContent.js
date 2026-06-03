chrome.runtime.onMessage.addListener(
    (message) => {

        if (
            message.action === "getSelection"
        ) {

            const selectedText =
                window
                    .getSelection()
                    .toString();

            chrome.storage.local.set({
                livePrompt: {
                    text: selectedText,
                    timestamp: Date.now()
                }
            });

        }

    }
);