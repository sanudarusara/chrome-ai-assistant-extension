console.log("Popup Loaded");

const chatgptToggle =
    document.getElementById(
        "chatgptToggle"
    );

const geminiToggle =
    document.getElementById(
        "geminiToggle"
    );

const perplexityToggle =
    document.getElementById(
        "perplexityToggle"
    );

chrome.storage.sync.get(
    [
        "showChatGPT",
        "showGemini",
        "showPerplexity"
    ],
    (settings) => {

        if (
            settings.showChatGPT !==
            undefined
        ) {
            chatgptToggle.checked =
                settings.showChatGPT;
        }

        if (
            settings.showGemini !==
            undefined
        ) {
            geminiToggle.checked =
                settings.showGemini;
        }

        if (
            settings.showPerplexity !==
            undefined
        ) {
            perplexityToggle.checked =
                settings.showPerplexity;
        }

    }
);

chatgptToggle.addEventListener(
    "change",
    () => {

        chrome.storage.sync.set({
            showChatGPT:
                chatgptToggle.checked
        });

    }
);

geminiToggle.addEventListener(
    "change",
    () => {

        chrome.storage.sync.set({
            showGemini:
                geminiToggle.checked
        });

    }
);

perplexityToggle.addEventListener(
    "change",
    () => {

        chrome.storage.sync.set({
            showPerplexity:
                perplexityToggle.checked
        });

    }
);