import { AI_SERVICES }
    from "./aiServices.js";

function createMenus() {

    chrome.contextMenus.removeAll(() => {

        const settingKeys =
            AI_SERVICES.map(
                (ai) => ai.setting
            );

        chrome.storage.sync.get(
            settingKeys,
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

                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        action: "getSelection"
                    }
                );

            }
        );

    }

});