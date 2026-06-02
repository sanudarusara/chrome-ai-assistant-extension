console.log("BACKGROUND LOADED");

const AI_SERVICES = [
    {
        id: "chatgpt",
        name: "ChatGPT",
        url: "https://chatgpt.com",
        setting: "showChatGPT"
    },
    {
        id: "gemini",
        name: "Gemini",
        url: "https://gemini.google.com/app",
        setting: "showGemini"
    },
    {
        id: "perplexity",
        name: "Perplexity",
        url: "https://www.perplexity.ai",
        setting: "showPerplexity"
    },
    {
        id: "claude",
        name: "Claude",
        url: "https://claude.ai",
        setting: "showClaude"
    }
];

function createMenus() {

    chrome.contextMenus.removeAll(() => {

        chrome.storage.sync.get(
            [
                "showChatGPT",
                "showGemini",
                "showPerplexity",
                "showClaude"
            ],
            (settings) => {

                chrome.contextMenus.create({
                    id: "ask-ai",
                    title: "Ask AI",
                    contexts: ["selection"]
                });

                chrome.contextMenus.create({
                    id: "open-ai",
                    title: "Open AI",
                    contexts: ["page"]
                });

                AI_SERVICES.forEach((ai) => {

                    if (
                        settings[ai.setting] === false
                    ) {
                        return;
                    }

                    chrome.contextMenus.create({
                        id: ai.id,
                        parentId: "ask-ai",
                        title: ai.name,
                        contexts: ["selection"]
                    });

                    chrome.contextMenus.create({
                        id: `open-${ai.id}`,
                        parentId: "open-ai",
                        title: ai.name,
                        contexts: ["page"]
                    });

                });

            }
        );

    });

}

chrome.runtime.onInstalled.addListener(() => {

    createMenus();

});

chrome.storage.onChanged.addListener(
    (changes, namespace) => {

        if (namespace === "sync") {

            createMenus();

        }

    }
);

chrome.contextMenus.onClicked.addListener(async (info, tab) => {

    const ai = AI_SERVICES.find(
        (service) =>
            service.id === info.menuItemId ||
            `open-${service.id}` === info.menuItemId
    );

    if (!ai) {
        return;
    }

    chrome.storage.local.set({
        sidePanelState: {
            url: ai.url,
            selectedText: info.selectionText || "",
            provider: ai.id,
            timestamp: Date.now()
        }
    });

    await chrome.sidePanel.open({
        windowId: tab.windowId
    });

});

chrome.commands.onCommand.addListener((command) => {

    if (command === "send-selection") {

        chrome.tabs.query(
            {
                active: true,
                currentWindow: true
            },
            (tabs) => {

                console.log("SHORTCUT FIRED");
                console.log("TAB ID:", tabs[0]?.id);
                console.log("TAB URL:", tabs[0]?.url);
                console.log("TAB TITLE:", tabs[0]?.title);

                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        action: "getSelection"
                    },
                    () => {

                        if (chrome.runtime.lastError) {

                            console.log(
                                "No content script on this page"
                            );

                        }

                    }
                );

            }
        );

    }

});