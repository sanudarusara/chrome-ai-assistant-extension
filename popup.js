import { AI_SERVICES }
from "./aiServices.js";

console.log("Popup Loaded");

const container =
    document.getElementById(
        "ai-settings"
    );

AI_SERVICES.forEach((ai) => {

    const row =
        document.createElement("div");

    row.className =
        "setting-row";

    row.innerHTML = `
        <span>Enable ${ai.name}</span>

        <label class="switch">
            <input
                type="checkbox"
                id="${ai.id}Toggle"
                checked
            >
            <span class="slider"></span>
        </label>
    `;

    container.appendChild(row);

});

const settingKeys =
    AI_SERVICES.map(
        ai => ai.setting
    );

chrome.storage.sync.get(
    settingKeys,
    (settings) => {

        AI_SERVICES.forEach((ai) => {

            const toggle =
                document.getElementById(
                    `${ai.id}Toggle`
                );

            if (
                settings[ai.setting] !==
                undefined
            ) {
                toggle.checked =
                    settings[ai.setting];
            }

            toggle.addEventListener(
                "change",
                () => {

                    chrome.storage.sync.set({
                        [ai.setting]:
                            toggle.checked
                    });

                }
            );

        });

    }
);