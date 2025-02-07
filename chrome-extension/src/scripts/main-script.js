import { APP_HEADER, TRAIN_LIST_COMPONENT, PASSENGER_APP_COMPONENT, REVIEW_COMPONENT, PAYMENT_COMPONENT, EWALLET_COMPONENT, EWALLET_IRCTC_DEFAULT } from "./domSelectors";
import { waitForElementToAppear } from "./utils";
import { getSettings, getAutomationStatus } from "./storage";
import { login, waitForAppLoginToDisappear } from "./login";
import { callSearchTrainComponent, waitForTargetTime } from "./trainSearch";
import { bookTicket, closePopupToProceed } from "./bookTicket";
import { addPassengerInputAndContinue } from "./passengerManagement";
import { handleCaptchaAndContinue } from "./reviewCaptcha";
import { selectPaymentMethod, selectPaymentProvider, clickPayButton, clickEwalletConfirmButton } from "./payment";
import logger from "./logger";

import { paymentMethod, autoPay, autoProcessPopup } from "./storage";

async function executeFunctions() {
  logger.info("User script running!");

  try {
    const currentAutomationStatus = await getAutomationStatus();
    logger.info("Automation status:", currentAutomationStatus);
    if (!currentAutomationStatus) return;

    getSettings(); // Read passenger info for ticket booking

    // Wait for home page to load
    await waitForElementToAppear(APP_HEADER);

    // Login Page < Page 0 >
    await login();
    await waitForAppLoginToDisappear();
    await callSearchTrainComponent();
    waitForTargetTime();

    // Wait for train list page to load
    await waitForElementToAppear(TRAIN_LIST_COMPONENT);

    // Select train and accommodation class < Page 1 >
    await bookTicket();

    if (autoProcessPopup) {
      closePopupToProceed();
    }

    // Wait for passenger page to load
    await waitForElementToAppear(PASSENGER_APP_COMPONENT);

    // Passenger Input and Payment Type < Page 2 >
    await addPassengerInputAndContinue();

    // Wait for the ticket review and Captcha page load
    await waitForElementToAppear(REVIEW_COMPONENT);

    // Review and Captcha < Page 3 >
    await handleCaptchaAndContinue();

    // Wait for the payment page to load
    await waitForElementToAppear(PAYMENT_COMPONENT);

    // Payment Selection < Page 4 >
    await selectPaymentMethod();
    await selectPaymentProvider();

    if (autoPay) {
      await clickPayButton();

      // Payment Confirmation for Ewallet < Page 5 >
      if (paymentMethod === EWALLET_IRCTC_DEFAULT) {
        await waitForElementToAppear(EWALLET_COMPONENT);
        await clickEwalletConfirmButton();
      }
    }
  } catch (error) {
    logger.error("An error occurred during execution:", error);
  }
}

executeFunctions();
