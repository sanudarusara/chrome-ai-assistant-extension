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

chrome.storage.local.get(
    ["sidePanelState"],
    (items) => {

        if (
            items.sidePanelState &&
            items.sidePanelState.selectedText
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

            if (!selector) {
                return;
            }

            waitForElement(selector)
                .then((element) => {

                    console.log("FOUND INPUT");
                    console.log(hostname);

                    const text =
                        items.sidePanelState.selectedText;

                    element.focus();

                    document.execCommand(
                        "insertText",
                        false,
                        text
                    );

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

                });

        }

    });