import { AI_SERVICES } from "./aiServices.js";

function createMenus() {
    chrome.contextMenus.removeAll(() => {
        const settingKeys = AI_SERVICES.map((ai) => ai.setting);

        chrome.storage.sync.get(settingKeys, (settings) => {
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
                if (settings[ai.setting] === false) {
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
        });
    });
}

chrome.runtime.onInstalled.addListener(() => {
    createMenus();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync") {
        createMenus();
    }
});

// Context Menu Listener
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const ai = AI_SERVICES.find(
        (service) => service.id === info.menuItemId || `open-${service.id}` === info.menuItemId
    );

    if (!ai) return;

    // Open the side panel instantly to honor the user gesture constraint
    chrome.sidePanel.open({
        windowId: tab.windowId
    });

    if (tab && tab.id) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["pageContent.js"]
        }).catch((err) => console.log("Script injection skipped or disallowed on this page context:", err));
    }

    chrome.storage.local.set({
        sidePanelState: {
            url: ai.url,
            selectedText: info.selectionText || "",
            provider: ai.id,
            timestamp: Date.now()
        }
    });
});

// Shortcut Hotkey (Alt+A) Handler
chrome.commands.onCommand.addListener(async (command) => {
    if (command === "send-selection") {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id || tab.url.startsWith("chrome://")) return;

        try {
            // Check if the script is active by requesting a ping response
            await chrome.tabs.sendMessage(tab.id, { action: "ping" });
            // If ping responds cleanly, fire the operational extraction message
            chrome.tabs.sendMessage(tab.id, { action: "getSelection" });
        } catch (error) {
            // If connection fails, inject script and let it extract text natively during its startup routine
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["pageContent.js"]
            }, () => {
                if (chrome.runtime.lastError) return;
                chrome.tabs.sendMessage(tab.id, { action: "getSelection" });
            });
        }
    }
});