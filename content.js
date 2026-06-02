console.log(
    "AI Content Script Loaded:",
    window.location.href
);

function waitForElement(selector) {

    return new Promise((resolve) => {

        const element =
            document.querySelector(selector);

        if (element) {
            resolve(element);
            return;
        }

        const observer =
            new MutationObserver(() => {

                const element =
                    document.querySelector(selector);

                if (element) {
                    observer.disconnect();
                    resolve(element);
                }

            });

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

    });

}

function insertTextIntoAI(
    text,
    needsInputEvent = true
) {

    const hostname = window.location.hostname;

    let selector = null;

    if (hostname.includes("chatgpt.com")) {
        selector = "#prompt-textarea";
    }

    if (hostname.includes("gemini.google.com")) {
        selector = ".ql-editor.textarea";
    }

    if (hostname.includes("perplexity.ai")) {
        selector = "#ask-input";
    }

    if (hostname.includes("claude.ai")) {
        selector = ".tiptap.ProseMirror";
    }

    if (!selector) {
        return;
    }

    waitForElement(selector)
        .then((element) => {

            console.log(
                "INJECTING:",
                text,
                Date.now()
            );

            element.focus();

            document.execCommand(
                "insertText",
                false,
                text
            );

            if (needsInputEvent) {

                element.dispatchEvent(
                    new InputEvent(
                        "input",
                        {
                            bubbles: true,
                            inputType: "insertText",
                            data: text
                        }
                    )
                );

            }

        });

}

// Initial prompt when AI is first opened
chrome.storage.local.get(
    ["sidePanelState"],
    (items) => {

        if (
            items.sidePanelState &&
            items.sidePanelState.selectedText
        ) {

            insertTextIntoAI(
                items.sidePanelState.selectedText
            );

        }

    }
);

// Listen for live updates from Alt+A
chrome.storage.onChanged.addListener(
    (changes, namespace) => {

        console.log(
            "STORAGE CHANGED",
            changes
        );

        if (
            namespace === "local" &&
            changes.livePrompt
        ) {

            const text =
                changes.livePrompt.newValue.text;

            console.log(
                "LIVE PROMPT RECEIVED",
                text
            );

            const hostname =
                window.location.hostname;

            const needsInputEvent =
                !hostname.includes(
                    "perplexity.ai"
                );

            insertTextIntoAI(
                text,
                needsInputEvent
            );

        }

    }
);