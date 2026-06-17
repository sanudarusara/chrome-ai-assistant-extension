function waitForElement(selector) {
    return new Promise((resolve) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function insertTextIntoAI(text, needsInputEvent = true) {
    const hostname = window.location.hostname;
    let selector = null;

    if (hostname.includes("chatgpt.com")) {
        selector = "#prompt-textarea";
    }
    else if (hostname.includes("gemini.google.com")) {
        selector = ".ql-editor.textarea";
    }
    else if (hostname.includes("perplexity.ai")) {
        selector = "#ask-input";
    }
    else if (hostname.includes("claude.ai")) {
        selector = ".tiptap.ProseMirror";
    }
    else if (hostname.includes("deepseek.com")) {
        selector = "textarea";
    }
    else if (hostname.includes("grok.com")) {
        selector = "textarea";
    }
    else if (hostname.includes("copilot.microsoft.com")) {
        selector = "textarea";
    }
    else if (hostname.includes("meta.ai")) {
        selector = 'textarea, [contenteditable="true"], input[type="text"]';
    }

    if (!selector) {
        return;
    }

    waitForElement(selector)
        .then((element) => {
            element.focus();

            document.execCommand("insertText", false, text);

            if (needsInputEvent) {
                element.dispatchEvent(
                    new InputEvent("input", {
                        bubbles: true,
                        inputType: "insertText",
                        data: text
                    })
                );
            }
        });
}

// Initial prompt when AI is first opened
chrome.storage.local.get(
    ["sidePanelState"],
    (items) => {
        if (items.sidePanelState && items.sidePanelState.selectedText) {
            const hostname = window.location.hostname;
            
            // Apply defensive persistence checks for unstable frontend apps
            if (hostname.includes("meta.ai") || hostname.includes("perplexity.ai")) {
                let checkAttempts = 0;
                const maxChecks = 20; // Poll every 400ms for up to 8 seconds

                const injectionInterval = setInterval(() => {
                    checkAttempts++;

                    // Use the unified platform selectors to confirm layout state
                    const targetSelector = hostname.includes("perplexity.ai") ? "#ask-input" : 'textarea, [contenteditable="true"], input[type="text"]';
                    const targetInput = document.querySelector(targetSelector);
                    
                    if (targetInput) {
                        const currentInputValue = targetInput.value || targetInput.innerText || "";

                        // If the framework's reactive mounting wiped out the text, force re-inject
                        if (!currentInputValue.includes(items.sidePanelState.selectedText)) {
                            insertTextIntoAI(items.sidePanelState.selectedText, !hostname.includes("perplexity.ai"));
                        } else {
                            // Text stuck successfully! We can shut down the loop safely
                            clearInterval(injectionInterval);
                        }
                    } else {
                        insertTextIntoAI(items.sidePanelState.selectedText, !hostname.includes("perplexity.ai"));
                    }

                    if (checkAttempts >= maxChecks) {
                        clearInterval(injectionInterval);
                    }
                }, 400);
            } 
            else {
                // All other stable platforms process instantly without lag loops
                insertTextIntoAI(items.sidePanelState.selectedText, true);
            }
        }
    }
);

// Listen for live updates from Alt+A (Appends text perfectly)
chrome.storage.onChanged.addListener(
    (changes, namespace) => {
        if (namespace === "local" && changes.livePrompt) {
            const text = changes.livePrompt.newValue.text;
            const hostname = window.location.hostname;
            const needsInputEvent = !hostname.includes("perplexity.ai");

            insertTextIntoAI(text, needsInputEvent);
        }
    }
);