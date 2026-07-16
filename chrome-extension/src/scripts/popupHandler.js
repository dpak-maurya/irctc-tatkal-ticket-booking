import { preferredLanguage } from './storage';
import { waitForElementToAppear, waitForElementToDisappear, humanClick } from './utils';
import { LANGUAGE_SELECTORS } from './domSelectors';
import Logger from './logger';

export async function dismissLanguagePopup() {
    const dialogAppeared = await waitForElementToAppear(LANGUAGE_SELECTORS.DIALOG_COMPONENT, 2500);
    if (!dialogAppeared) return;

    const dialogs = document.querySelectorAll(LANGUAGE_SELECTORS.DIALOG_COMPONENT);
    for (let dialog of dialogs) {
        const buttons = Array.from(dialog.querySelectorAll(LANGUAGE_SELECTORS.LANGUAGE_BUTTON));
        const targetButton = buttons.find(btn => btn.innerText.trim() === preferredLanguage);
        if (targetButton) {
            Logger.info("Dismissing language popup with: " + preferredLanguage);
            await humanClick(targetButton);
            await waitForElementToDisappear(dialog, 500); // give it a moment to disappear
            return;
        }
    }
}
