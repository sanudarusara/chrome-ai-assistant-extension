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

// THE PERPLEXITY KILLER: Overrides the framework state engine
function forceFrameworkClear(element) {
    try {
        element.focus();
        
        // Find the native input or textarea prototype setter
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            "value"
        ) || Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
        );

        if (nativeInputValueSetter && nativeInputValueSetter.set) {
            // Forcefully execute the raw JS setter behind the virtual DOM state tracker
            nativeInputValueSetter.set.call(element, "");
        } else {
            element.value = "";
        }

        // Send a native tracking update event to force re-render sync
        element.dispatchEvent(new Event("input", { bubbles: true }));
    } catch (e) {
        element.value = "";
    }
}

function insertTextIntoAI(text, needsInputEvent = true, clearFirst = false) {
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
            if (clearFirst) {
                if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                    forceFrameworkClear(element); // Use native prototype bypass
                } else {
                    element.innerHTML = "";
                }
            }

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

// Initial prompt when AI is first opened (Handles Ask AI / Open AI)
chrome.storage.local.get(
    ["sidePanelState"],
    (items) => {
        const hostname = window.location.hostname;
        
        // Scenario A: Open AI feature (No text selected, force clear old junk text)
        if (items.sidePanelState && !items.sidePanelState.selectedText) {
            const isPerplexity = hostname.includes("perplexity.ai");
            insertTextIntoAI("", !isPerplexity, true); 
            return;
        }

        // Scenario B: Ask AI feature (Text is selected)
        if (items.sidePanelState && items.sidePanelState.selectedText) {
            
            // Apply defensive persistence checks for unstable frontend apps
            if (hostname.includes("meta.ai") || hostname.includes("perplexity.ai")) {
                let checkAttempts = 0;
                const maxChecks = 40; 
                let hasDoneInitialClear = false;

                const injectionInterval = setInterval(() => {
                    checkAttempts++;

                    const targetSelector = hostname.includes("perplexity.ai") ? "#ask-input" : 'textarea, [contenteditable="true"], input[type="text"]';
                    const targetInput = document.querySelector(targetSelector);
                    
                    if (targetInput) {
                        const currentInputValue = targetInput.value || targetInput.innerText || "";

                        // Verify if the text matches exactly.
                        if (!currentInputValue.includes(items.sidePanelState.selectedText)) {
                            
                            if (targetInput.tagName === "INPUT" || targetInput.tagName === "TEXTAREA") {
                                forceFrameworkClear(targetInput); // Clear memory state inside loop
                            } else {
                                targetInput.innerHTML = "";
                            }

                            insertTextIntoAI(items.sidePanelState.selectedText, !hostname.includes("perplexity.ai"), false);
                            hasDoneInitialClear = true;
                        } else if (checkAttempts > 10) {
                            clearInterval(injectionInterval);
                        }
                    } else {
                        insertTextIntoAI(items.sidePanelState.selectedText, !hostname.includes("perplexity.ai"), !hasDoneInitialClear);
                        hasDoneInitialClear = true;
                    }

                    if (checkAttempts >= maxChecks) {
                        clearInterval(injectionInterval);
                    }
                }, 400);
            } 
            else {
                insertTextIntoAI(items.sidePanelState.selectedText, true, true); 
            }
        }
    }
);

// Listen for live updates from Alt+A (Appends text perfectly without clearing)
chrome.storage.onChanged.addListener(
    (changes, namespace) => {
        if (changes.livePrompt && namespace === "local") {
            const text = changes.livePrompt.newValue.text;
            const hostname = window.location.hostname;
            const needsInputEvent = !hostname.includes("perplexity.ai");

            insertTextIntoAI(text, needsInputEvent, false);
        }
    }
);