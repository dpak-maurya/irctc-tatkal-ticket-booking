console.log("IRCTC Auto Booker content script loaded!");

let passengers = [];
let autofillController = null;

// --- Helper Functions ---

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showStatusBox() {
    if (document.getElementById('autofill-status-box'))
        return;

    const box = document.createElement('div');
    box.id = 'autofill-status-box';
    box.style.position = 'fixed';
    box.style.top = '10px';
    box.style.right = '10px';
    box.style.backgroundColor = '#1f2e54';
    box.style.color = 'white';
    box.style.padding = '8px 12px';
    box.style.borderRadius = '6px';
    box.style.boxShadow = '0 0 8px rgba(0,0,0,0.2)';
    box.style.zIndex = 9999;
    box.style.fontSize = '13px';
    box.innerText = 'Autofill Running. Click Book Now. Waiting for Add Passengers page to load ...';

    document.body.appendChild(box);
	
	
	box.innerHTML = `
  <div style="display:flex;align-items:center;">
    <div class="autofill-spinner" style="margin-right:8px;width:14px;height:14px;border:2px solid white;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
    <span id="autofill-status-text">Autofill Running. Click Book Now. Waiting for Add Passengers page to load ...</span>
  </div>
`;

const style = document.createElement('style');
style.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(style);
}

function removeStatusBox() {
    const box = document.getElementById('autofill-status-box');
    if (box)
        box.remove();
}

function updateStatus(text) {
    const statusText = document.getElementById('autofill-status-text');
    if (statusText)
        statusText.innerText = text;
}

function isContinueButtonVisible() {
    const button = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.trim().includes('Continue'));

    if (!button) {
        console.log('Continue button not found');
        return false;
    }

    const style = getComputedStyle(button);
    const isVisible = style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        button.offsetParent !== null;

    console.log('Continue button is', isVisible ? 'visible' : 'not visible');
    return isVisible;
}

async function checkForError(mode) {
    if (document.body.textContent.includes('Error')) {
        updateStatus('Autofill failed with error. Continue Manually');

        if (mode === 'premium_captcha') {
            await sleep(3000);

            removeStatusBox();

            throw new Error("Auto Payment with IRCTC eWallet Failed!!!");
        }
    };

}

async function typeLetterByLetter(inputElement, text, delay = 100) {
    inputElement.focus();
    inputElement.value = '';
    for (let i = 0; i < text.length; i++) {
        inputElement.value += text[i];
        inputElement.dispatchEvent(new Event('input', {
                bubbles: true
            }));
        await sleep(delay);
    }
}

async function waitForAddPassenger(timeout = 300000, signal) {

    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (signal.aborted)
            throw new DOMException("Aborted", "AbortError");

        const addPassengerLink = Array.from(document.querySelectorAll('a')).find(a =>
                Array.from(a.querySelectorAll('span')).some(
                    span => span.textContent.trim() === '+ Add Passenger'));
        if (addPassengerLink)
            return addPassengerLink;
        await sleep(500);
    }
    alert("Autofill failed: '+ Add Passenger' link not found within 5 minutes. Please check the IRCTC page and try again.");
    throw new Error("+ Add Passenger link not found within 5 mins timeout");
}

async function waitForPaymentContinue(timeout = 60000, signal, mode) {

    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (signal.aborted)
            throw new DOMException("Aborted", "AbortError");

        checkForError(mode);

        if (isContinueButtonVisible())
            return continueButton1;
        await sleep(500);
    }
    //alert("Autofill failed: 'Continue' button not found within 1 minutes. Please check the IRCTC page and try again.");

    await sleep(3000);

    removeStatusBox();

    throw new Error("'Continue' button not found within 1 minutes");
}

async function waitForElement(xpath, timeout = 10000, signal, mode) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (signal.aborted)
            throw new DOMException("Aborted", "AbortError");

        checkForError(mode);

        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (result)
            return result;
        await sleep(300);
    }
    throw new Error(`Timeout waiting for XPath: ${xpath}`);
}

async function proceedToPayment(mode, signal) {
    try {
        const eWalletXPath = "//div[img[contains(@src, 'IrctcEWallet.png')]]";
        //Will wait for EWallet page to load for 60sec.
        const eWalletDiv = await waitForElement(eWalletXPath, 60000, signal, mode);
        console.log("Pay & Book Found");

        if (mode === 'premium_captcha') {
            console.log("Stopping at captcha page as per user setting.");
            updateStatus('Autofill Finished. Please proceed with payment manually');

            await sleep(5000);

            removeStatusBox();

            return;
        }

        updateStatus('Paying with IRCTC eWallet...');

        eWalletDiv.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        await sleep(500);
        eWalletDiv.click();
        console.log("Clicked IRCTC eWallet option");

        const payBookXPath = "//button[contains(@class, 'btn-primary') and contains(text(), 'Pay & Book')]";
        const payBookButton = await waitForElement(payBookXPath, 10000, signal, mode);
        payBookButton.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        await sleep(500);
        payBookButton.click();
        console.log("Payment Started");

        await waitForPaymentContinue(60000, signal, mode);

        updateStatus('Click Continue and Finish Payment. AutoFill Finished !!!');

        await sleep(5000);

        removeStatusBox();

    } catch (error) {
        console.error("Error during payment step:", error);
        removeStatusBox();

    }
}

async function deleteExtraPassengerRows() {
    const passengerInputBlock = document.querySelector('app-passenger-input');
    if (!passengerInputBlock) {
        console.error('No app-passenger-input block found!');
        return;
    }

    let deleteButtons = passengerInputBlock.querySelectorAll('a.fa-remove');
    while (deleteButtons.length > passengers.length) {
        const lastDeleteButton = deleteButtons[deleteButtons.length - 1];
        lastDeleteButton.click();
        console.log("Deleted extra passenger block");
        await sleep(200);
        deleteButtons = passengerInputBlock.querySelectorAll('a.fa-remove');
    }
}

async function fillSinglePassenger(passengerIndex, block) {
    try {
        const passenger = passengers[passengerIndex];
        const nameInput = block.querySelector('input[placeholder="Name"]');
        const ageInput = block.querySelector('input[placeholder="Age"]');
        const genderSelect = block.querySelector('select[formcontrolname="passengerGender"]');
        const berthSelect = block.querySelector('select[formcontrolname="passengerBerthChoice"]');

        nameInput.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        await sleep(200);

        if (nameInput)
            await typeLetterByLetter(nameInput, passenger.name, 50);
        if (ageInput)
            await typeLetterByLetter(ageInput, passenger.age, 50);

        if (genderSelect) {
            const genderOption = Array.from(genderSelect.options)
                .find(option => option.text.toUpperCase() === passenger.gender.toUpperCase());
            if (genderOption) {
                genderSelect.value = genderOption.value;
                genderSelect.dispatchEvent(new Event('change', {
                        bubbles: true
                    }));
            }
        }

        if (berthSelect) {
            const berthOption = Array.from(berthSelect.options)
                .find(option => option.text.toUpperCase() === passenger.berth.toUpperCase());
            if (berthOption) {
                berthSelect.value = berthOption.value;
                berthSelect.dispatchEvent(new Event('change', {
                        bubbles: true
                    }));
            }
        }

    } catch (error) {
        console.error(`Error while filling passenger ${passengerIndex + 1}:`, error);

        updateStatus('Error while filling passenger details. Fill in the details and click continue.');

    }
}

// --- Main Autofill Function ---

async function fillPassengers(mode, signal) {
    try {
        //Wait for 5 mins till Add Passenger page is available
        console.log("Waiting for '+ Add Passenger' link to become available...");
        await waitForAddPassenger(300000, signal);

        //Display Status box
        updateStatus('Autofilling Passenger details...');

        console.log(`Passengers selected : ${passengers.length}`);
        await deleteExtraPassengerRows();

        for (let i = 0; i < passengers.length; i++) {

            if (signal.aborted)
                throw new DOMException("Aborted", "AbortError");

            // Check for Passenger input row existing or not
            let block = document.querySelectorAll('app-passenger')[i];

            if (!block) {

                // If passenger input row not existing
                console.log(`Passenger block for ${i + 1} not found, clicking '+ Add Passenger'...`);

                const addPassengerLink = Array.from(document.querySelectorAll('a'))
                    .find(a => Array.from(a.querySelectorAll('span')).some(span => span.textContent.trim() === '+ Add Passenger'));

                if (addPassengerLink) {
                    addPassengerLink.click();
                    let retries = 10;
                    while (document.querySelectorAll('app-passenger').length <= i && retries > 0) {
                        await sleep(200);
                        retries--;
                    }
                } else {
                    console.error("'Add Passenger' link not found!");
                }

                block = document.querySelectorAll('app-passenger')[i];
            }

            await fillSinglePassenger(i, block);
            await sleep(200);
        }

        if (mode === 'fremium') {

            console.log("Stopping at Add Passenger page as per user setting.");
            updateStatus('Autofill Ended!!!. Please click continue and proceed manually');

            await sleep(5000);

            removeStatusBox();

            return;
        }

        //Find 'Continue' button in Add Passengers' page
        const continueButton = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Continue'));

        if (continueButton) {
            continueButton.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            await sleep(200);

            continueButton.click();
            console.log("Clicked Continue button after all passengers filled.");

            if (document.body.textContent.includes('Error')) {
                console.error('Error while continuing to Captcha page');

                updateStatus('Error while continuing to next page. Please try manually');
                await sleep(5000);

            };

            updateStatus('Waiting for Captcha...');

            //Waiting for Captcha page to load for 300 x 500 ms = 150secs
            let retries = 500;
            let captchaInput = null;
            while (retries > 0) {
                if (signal.aborted)
                    throw new DOMException("Aborted", "AbortError");

                captchaInput = document.querySelector('input[placeholder="Enter Captcha"]');
                if (captchaInput && captchaInput.offsetParent !== null) {
                    captchaInput.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    await sleep(200);

                    updateStatus('Start typing captcha and press Enter');

                    captchaInput = document.querySelector('input[placeholder="Enter Captcha"]');
                    if (captchaInput && captchaInput.offsetParent !== null) {
                        captchaInput.focus();
                        captchaInput.click();
                        if (document.activeElement === captchaInput) {
                            console.log("Captcha input is now focused.");
                            break;
                        }
                    }
                }
                await sleep(300);
                retries--;
            }

            if (retries === 0) {
                console.log("Captcha input not found or not focusable after timeout.");
                //alert("Autofill failed: '+ Add Passenger' link not found within 5 minutes. Please check the IRCTC page and try again.");

                updateStatus('Timeout while waiting for Captcha. Please try manually');
                await sleep(5000);

            }

            await proceedToPayment(mode, signal);

        }

    } catch (error) {
        console.error("Error while autofilling passengers:", error);
    }
}

// --- Event Listener ---

window.addEventListener('start-autofill', async(e) => {
    if (autofillController) {
        console.log("Cancelling previous autofill...");
        autofillController.abort();
    }

    autofillController = new AbortController();
    const signal = autofillController.signal;

    try {
        //Display Status box
        showStatusBox();

        console.log('Received passengers and mode:', e.detail);
        const {
            passengers: p,
            mode
        } = e.detail;
        passengers = p;

        await fillPassengers(mode, signal);

    } catch (err) {
        if (err.name === 'AbortError') {
            console.warn("Autofill aborted.");
        } else {
            console.error("Autofill error:", err);
        }
    } finally {
        autofillController = null;
    }
});