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

const claudeToggle =
    document.getElementById(
        "claudeToggle"
    );

chrome.storage.sync.get(
    [
        "showChatGPT",
        "showGemini",
        "showPerplexity",
        "showClaude"
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

        if (
            settings.showClaude !==
            undefined
        ) {
            claudeToggle.checked =
                settings.showClaude;
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

claudeToggle.addEventListener(
    "change",
    () => {

        chrome.storage.sync.set({
            showClaude:
                claudeToggle.checked
        });

    }
);