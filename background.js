console.log("BACKGROUND LOADED");

chrome.runtime.onInstalled.addListener(() => {

    chrome.contextMenus.create({
        id: "ask-ai",
        title: "Ask AI",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "chatgpt",
        parentId: "ask-ai",
        title: "ChatGPT",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "gemini",
        parentId: "ask-ai",
        title: "Gemini",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "perplexity",
        parentId: "ask-ai",
        title: "Perplexity",
        contexts: ["selection"]
    });

});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {

    if (
        info.menuItemId === "chatgpt" ||
        info.menuItemId === "gemini" ||
        info.menuItemId === "perplexity"
    ) {

        let url = "";

        if (info.menuItemId === "chatgpt") {
            url = "https://chatgpt.com";
        }

        if (info.menuItemId === "gemini") {
            url = "https://gemini.google.com/app";
        }

        if (info.menuItemId === "perplexity") {
            url = "https://www.perplexity.ai";
        }

        chrome.storage.local.set({
            sidePanelState: {
                url: url,
                selectedText: info.selectionText,
                provider: info.menuItemId,
                timestamp: Date.now()
            }
        });

        await chrome.sidePanel.open({
            windowId: tab.windowId
        });

    }

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