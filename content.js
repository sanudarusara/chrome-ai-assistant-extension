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

            waitForElement("#prompt-textarea")
                .then((element) => {

                    console.log("FOUND TEXTBOX");

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