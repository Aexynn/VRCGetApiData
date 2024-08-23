import puppeteer, { Page } from "puppeteer";
import { config } from "dotenv";
import { cfg, dir, urls, selector, env } from "../../libs/config";
import { waitForUserInput } from "../../libs/user_action";
import { checkDir } from "../../libs/check_requirements";
import fs from "fs";
import path from "path";

// Load environment variables
config();

// Create the auth directory if it does not exist
// Créer le répertoire d'auth si nécessaire
checkDir("auth");

// Function to wait for a delay
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Main script
(async () => {
  // Define environment variables
  // Définir les variables d'environnement
  const password =
    process.env.PASSWORD ||
    (await waitForUserInput(
      "Password not found in environment. Please enter your password: "
    ));

  if (!password) {
    throw new Error("Password is required but not provided.");
  }

  const browser = await puppeteer.launch({
    headless: cfg.browser.headless,
    args: [`--window-size=${cfg.browser.width},${cfg.browser.height}`],
    defaultViewport: {
      width: cfg.browser.width,
      height: cfg.browser.height,
    },
  });

  const page = await browser.newPage();
  const navigationTimeout = 60000;

  try {
    await page.setDefaultNavigationTimeout(navigationTimeout);

    // Navigate to the login page
    const response = await page.goto(urls.login, { waitUntil: "networkidle2" });
    console.log("Request status: ", response?.status());

    // Wait for and accept the privacy policy
    await page.waitForSelector(selector.button.privacy, {
      timeout: navigationTimeout,
    });
    await page.evaluate((selector: string) => {
      const button = document.querySelector<HTMLElement>(selector);
      button?.click();
    }, selector.button.privacy);
    console.log("Privacy button clicked.");

    // Wait for username and password fields to be visible
    await page.waitForSelector(selector.field.username, {
      timeout: navigationTimeout,
    });
    await page.waitForSelector(selector.field.password, {
      timeout: navigationTimeout,
    });

    console.log("Logging in...");
    await page.type(selector.field.username, env.nickname, { delay: 100 });
    await page.type(selector.field.password, password, { delay: 100 });

    // Click the login button
    await page.click(selector.button.login);
    console.log("Login button clicked. Waiting for 2FA page...");

    // Wait for navigation to 2FA page
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    if (page.url() !== urls.twoFA) {
      throw new Error("Failed to navigate to the 2FA page");
    }
    console.log("Navigated to the 2FA page.");

    // Wait for the 2FA input field to be visible
    await page.waitForSelector(selector.field.twoFA, {
      timeout: navigationTimeout,
    });

    // Prompt user to enter 2FA code
    const twoFA = await waitForUserInput(
      "Please enter your 2FA code and press Enter: "
    );

    // Type the 2FA code
    const inputFields = await page.$$(selector.field.twoFA);
    if (inputFields.length !== twoFA.length) {
      throw new Error(
        "The number of 2FA input fields does not match the code length."
      );
    }

    for (let i = 0; i < inputFields.length; i++) {
      await inputFields[i].type(twoFA[i], { delay: 100 });
    }
    console.log("2FA code entered.");

    await page.waitForFunction(
      (selector: string) => {
        const button = document.querySelector(selector) as HTMLButtonElement;
        return button && !button.disabled && button.offsetParent !== null;
      },
      { timeout: navigationTimeout },
      selector.button.next2FA
    );

    await wait(500);

    await page.evaluate((selector: string) => {
      const button = document.querySelector<HTMLElement>(selector);
      button?.click();
    }, selector.button.next2FA);
    console.log("2FA button clicked.");

    // Wait for navigation to profile page
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    // Now that we're on the profile page, let's save the cookies and storage data
    const cookies = await page.cookies();
    const localStorageData = await page.evaluate(() => {
      const json: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          json[key] = localStorage.getItem(key);
        }
      }
      return json;
    });

    // Write cookies and localStorage to their respective files
    fs.writeFileSync(
      path.join(dir.auth, `cookies.json`),
      JSON.stringify(cookies, null, 2)
    );
    fs.writeFileSync(
      path.join(dir.auth, `storage.json`),
      JSON.stringify(localStorageData, null, 2)
    );

    console.log("Cookies and storage data saved successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Close the browser
    await browser.close();
  }
})();
