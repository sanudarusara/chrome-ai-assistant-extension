console.log("PAGE CONTENT LOADED");

chrome.runtime.onMessage.addListener(
    (message) => {

        console.log("MESSAGE RECEIVED", message);

        if (
            message.action === "getSelection"
        ) {

            const selectedText =
                window
                    .getSelection()
                    .toString();

            console.log(
                "SELECTED:",
                selectedText
            );

            chrome.storage.local.set({
                livePrompt: {
                    text: selectedText,
                    timestamp: Date.now()
                }
            });

        }

    }
);