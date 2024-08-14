const puppeteer = require("puppeteer");
require("dotenv").config();
const readline = require("readline");
const fs = require("fs");

// Function to wait for user input in the console
function waitForUserInput(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

// Function to wait for a specific time
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to wait for the loading div to disappear
async function waitForLoadingToDisappear(page) {
  try {
    await page.waitForSelector("#loading", { hidden: true });
    console.log("Loading div disappeared.");
  } catch (error) {
    console.error(
      "An error occurred while waiting for the loading div to disappear:",
      error
    );
  }
}

// Fetch JSON data from an API URL
async function fetchJsonFromUrl(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const content = await page.evaluate(
      () => document.querySelector("body").innerText
    );
    return JSON.parse(content);
  } catch (error) {
    console.error(`An error occurred while fetching data from ${url}:`, error);
    return null;
  }
}

async function saveData(page) {
  const data = {
    users: {
      scrape: {},
      api: {},
    },
    groups: {
      represented: {},
      list: {},
    },
  };

  try {
    // Extract data using scraping
    data.users.scrape.user_rank = await page.$eval(
      'div[title="User Rank"]',
      (el) => el.textContent.trim()
    );
    data.users.scrape.last_login = await page.$eval(
      'div[title^="Last online"]',
      (el) => el.textContent.trim()
    );

    // URLs for JSON data
    const apiUserUrl = `https://vrchat.com/api/1/users/${process.env.USER_ID}`;
    const apiGroupsUrl = `${apiUserUrl}/groups`;
    const apiRepresentedGroupUrl = `${apiUserUrl}/groups/represented`;

    // Fetch JSON data from APIs
    data.users.api = await fetchJsonFromUrl(page, apiUserUrl);
    data.groups.list = await fetchJsonFromUrl(page, apiGroupsUrl);
    data.groups.represented = await fetchJsonFromUrl(
      page,
      apiRepresentedGroupUrl
    );
  } catch (error) {
    console.error(
      "An error occurred while extracting or fetching data:",
      error
    );
  }

  // Write the collected data to a JSON file
  fs.writeFileSync("latest_userData.json", JSON.stringify(data, null, 2));
}

(async () => {
  // Launch a browser instance
  const domain = "https://vrchat.com";
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const navigationTimeout = 60000; // 60 seconds

  try {
    // Set default navigation timeout
    await page.setDefaultNavigationTimeout(navigationTimeout);

    // Navigate to the login page
    const response = await page.goto(`${domain}/home/login`, {
      waitUntil: "networkidle2",
    });
    console.log("Request status: ", response?.status(), "\n\n\n\n");

    // Selectors for the username, password input, and login button
    const privacyButtonSelector = "#onetrust-accept-btn-handler";
    const usernameFieldSelector = "#username_email";
    const passwordFieldSelector = "#password";
    const loginButtonSelector = 'button[aria-label="Login"]';
    const next2FAButtonSelector = 'button[type="submit"]';
    const twoFAInputSelector = 'input[name="code"]';

    // Wait for the privacy button to appear and click it
    await page.waitForSelector(privacyButtonSelector, {
      timeout: navigationTimeout,
    });
    await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
      }
    }, privacyButtonSelector);
    console.log("Privacy button clicked.", "\n\n");

    // Waits for the username and password fields to appear
    await page.waitForSelector(usernameFieldSelector, {
      timeout: navigationTimeout,
    });
    await page.waitForSelector(passwordFieldSelector, {
      timeout: navigationTimeout,
    });

    // Ensure environment variables are set
    const env = {
      username: process.env.NICKNAME,
      password: process.env.PASSWORD,
    };

    if (!env.username || !env.password) {
      throw new Error(
        "Environment variables NICKNAME and PASSWORD must be set"
      );
    }

    // Type the username and password into the input fields
    console.log("Logging in...");
    await page.type(usernameFieldSelector, env.username, { delay: 100 });
    await page.type(passwordFieldSelector, env.password, { delay: 100 });

    // Click the login button
    await page.click(loginButtonSelector);
    console.log("Login button clicked. Waiting for 2FA page...", "\n\n");

    // Wait for navigation to the 2FA page
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    // Verify the current URL to ensure we are on the 2FA page
    const currentURL = page.url();
    if (currentURL !== `${domain}/home/emailtwofactorauth`) {
      throw new Error("Failed to navigate to the 2FA page");
    }
    console.log("Navigated to the 2FA page.");

    // Wait for the 2FA input fields
    await page.waitForSelector(twoFAInputSelector, {
      timeout: navigationTimeout,
    });

    // Wait for 2FA code input from the user
    const twoFA = await waitForUserInput(
      "Please enter your 2FA code and press Enter: "
    );

    // Enter each digit into the corresponding input field
    const inputFields = await page.$$(twoFAInputSelector);
    if (inputFields.length !== twoFA.length) {
      throw new Error(
        "The number of 2FA input fields does not match the code length."
      );
    }

    for (let i = 0; i < inputFields.length; i++) {
      await inputFields[i].type(twoFA[i], { delay: 100 });
    }
    console.log("2FA code entered.");

    // Wait for the next 2FA button to become enabled and visible
    await page.waitForFunction(
      (selector) => {
        const button = document.querySelector(selector);
        return button && !button.disabled && button.offsetParent !== null;
      },
      { timeout: navigationTimeout },
      next2FAButtonSelector
    );

    // Add a slight delay before clicking the button to ensure it's clickable
    await wait(500); // 500 milliseconds

    // Click the next 2FA button
    await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
      }
    }, next2FAButtonSelector);
    console.log("2FA button clicked.", "\n\n");

    // Wait for the page to redirect after 2FA
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    // Navigate to the specific user page
    const userPageURL = `${domain}/home/user/${process.env.USER_ID}`;
    await page.goto(userPageURL, {
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });
    console.log("Navigated to user page.");

    while (true) {
      // Wait for the loading div to disappear before continuing
      await waitForLoadingToDisappear(page);

      // Wait a moment to make sure the page is stable
      await wait(1000); // Wait 1 second for greater reliability

      // Take a screenshot of the page
      await page.screenshot({
        path: "latest_profile_screenshot.png",
        fullPage: true,
      });

      console.log("Latest profile screenshot taken.");

      // Save the data to a file
      await saveData(page);

      console.log("Data saved.");

      // Wait for a random time between 1 to 2 hours
      const waitTime =
        Math.floor(Math.random() * (2 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000)) +
        1 * 60 * 60 * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      // Reload the page
      await page.reload({ waitUntil: "networkidle2" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Close the browser after the actions
    await browser.close();
  }
})();
