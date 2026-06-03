import { AI_SERVICES }
    from "./aiServices.js";

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
        <span class="ai-label">

            <img
                src="${ai.logo}"
                class="ai-logo"
                alt="${ai.name}"
            >

            <span>${ai.name}</span>

        </span>

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