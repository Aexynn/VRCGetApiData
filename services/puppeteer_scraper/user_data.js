const puppeteer = require("puppeteer");
require("dotenv").config();
const readline = require("readline");
const fs = require("fs");
const path = require("path");

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

    console.log(`Successfully fetched ${url} data.`);
    return JSON.parse(content);
  } catch (error) {
    console.error(`An error occurred while fetching data from ${url}:`, error);
    return null;
  }
}

async function checkIfMidnight() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentSecond = currentTime.getSeconds();

  return currentHour === 0 && currentMinute === 0 && currentSecond === 0;
}

async function saveData(page, url, dataDir, user_id) {
  const data = {
    user: {
      manual: {},
      api: {},
    },
    groups: {
      represented: {},
      list: {},
    },
    worlds: {},
  };

  try {
    console.log("Starting data scraping...");

    // Ensure the page is fully loaded
    await page.waitForSelector('div[title="User Rank"]', { visible: true });
    await page.waitForSelector('div[title^="Last online"]', { visible: true });

    // Extract user-related data using scraping
    data.user.manual.user_rank = await page.$eval(
      'div[title="User Rank"]',
      (el) => el.textContent.trim()
    );
    console.log("User rank scraped:", data.user.manual.user_rank);

    data.user.manual.last_login = await page.$eval(
      'div[title^="Last online"]',
      (el) => el.textContent.trim()
    );
    console.log("Last login scraped:", data.user.manual.last_login);

    // Scrape public worlds information
    const worldElements = await page.$$(
      ".tw-snap-center.tw-w-80.tw-inline-block.tw-h-96.tw-scroll-ml-6.tw-snap-always"
    );

    const worldsData = [];
    for (let i = 0; i < worldElements.length; i++) {
      const worldElement = worldElements[i];
      const worldData = {};

      worldData.title = await worldElement.$eval(
        "h4.css-1yw163h.e12w85u87",
        (el) => el.textContent.trim()
      );
      worldData.image = await worldElement.$eval(
        "img.css-c07466.e12w85u88",
        (el) => el.src
      );
      worldData.online_players = await worldElement.$eval(
        'div[title="Online Players"]',
        (el) => el.textContent.trim()
      );
      worldData.favorites = await worldElement.$eval(
        'div[title="Favorites"]',
        (el) => el.textContent.trim()
      );
      worldData.last_updated = await worldElement.$eval(
        'div[title="Updated"]',
        (el) => el.textContent.trim()
      );
      worldData.open_world_page = await worldElement.$eval(
        "a.css-1alc1xs.e12w85u80",
        (el) => el.href
      );

      // Extract platform information
      const platformDivs = await worldElement.$$(
        ".css-1347k0o.e12w85u816 > div"
      );
      let isPC = false;
      let isQuest = false;

      for (const div of platformDivs) {
        const title = await div.evaluate((el) => el.getAttribute("title"));
        if (title === "Is a PC World") {
          isPC = true;
        } else if (title === "Is a Quest World") {
          isQuest = true;
        }
      }

      worldData.platform = {
        windows: isPC,
        android: isQuest,
      };

      worldsData.push(worldData);
      console.log(`World ${i} data scraped:`, worldData);
    }
    data.worlds = worldsData;

    // URLs for JSON data
    const apiUserUrl = `${url}/${user_id}`;
    const apiRepresentedGroupUrl = `${apiUserUrl}/groups/represented`;

    console.log("Fetching JSON data from API...");

    // Fetch JSON data from APIs
    data.user.api = await fetchJsonFromUrl(page, apiUserUrl);
    const representedGroup = await fetchJsonFromUrl(
      page,
      apiRepresentedGroupUrl
    );

    data.groups.represented = representedGroup;

    // Write the collected data to separate JSON files
    fs.writeFileSync(
      path.join(dataDir, `${user_id}_user_data.json`),
      JSON.stringify(data.user, null, 2)
    );
    fs.writeFileSync(
      path.join(dataDir, `${user_id}_worlds_data.json`),
      JSON.stringify(data.worlds, null, 2)
    );
    fs.writeFileSync(
      path.join(dataDir, `${user_id}_groupsRepresented_data.json`),
      JSON.stringify(data.groups.represented, null, 2)
    );

    if (await checkIfMidnight()) {
      console.log("Fetching list of groups from API...");

      const apiGroupsUrl = `${apiUserUrl}/groups`;
      const groupsList = await fetchJsonFromUrl(page, apiGroupsUrl);
      data.groups.list = groupsList;

      fs.writeFileSync(
        path.join(dataDir, `${user_id}_groupsList_data.json`),
        JSON.stringify(data.groups.list, null, 2)
      );
    } else {
      console.log(
        "Skipping fetching list of groups from API... (Is not midnight)"
      );
    }

    console.log("Data extraction and scraping completed.");
    console.log(`Data saved to ${dataDir}.`);
  } catch (error) {
    console.error(
      "An error occurred while extracting or fetching data:",
      error
    );
  }
}

(async () => {
  // Ensure environment variables are set
  const env = {
    nickname: process.env.NICKNAME,
    password: process.env.PASSWORD,
    user_id: process.env.USER_ID,
    domain: "https://vrchat.com",
    data: "data",
  };

  if (!env.nickname || !env.password || !env.user_id) {
    throw new Error(
      "Environment variables NICKNAME, PASSWORD, and USER_ID must be set"
    );
  }

  // Launch a browser instance
  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    args: [`--window-size=1389,1818`],
    defaultViewport: {
      width: 1389,
      height: 1818,
    },
  });
  const page = await browser.newPage();
  const navigationTimeout = 60000; // 60 seconds

  try {
    // Set default navigation timeout
    await page.setDefaultNavigationTimeout(navigationTimeout);

    // Navigate to the login page
    const response = await page.goto(`${env.domain}/home/login`, {
      waitUntil: "networkidle2",
    });
    console.log("Request status: ", response?.status());

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
    console.log("Privacy button clicked.");

    // Waits for the username and password fields to appear
    await page.waitForSelector(usernameFieldSelector, {
      timeout: navigationTimeout,
    });
    await page.waitForSelector(passwordFieldSelector, {
      timeout: navigationTimeout,
    });

    // Type the username and password into the input fields
    console.log("Logging in...");
    await page.type(usernameFieldSelector, env.nickname, { delay: 100 });
    await page.type(passwordFieldSelector, env.password, { delay: 100 });

    // Click the login button
    await page.click(loginButtonSelector);
    console.log("Login button clicked. Waiting for 2FA page...");

    // Wait for navigation to the 2FA page
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    // Verify the current URL to ensure we are on the 2FA page
    const currentURL = page.url();
    if (currentURL !== `${env.domain}/home/emailtwofactorauth`) {
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
    console.log("2FA button clicked.");

    // Wait for the page to redirect after 2FA
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    // Navigate to the specific user page
    const userPageURL = `${env.domain}/home/user/${env.user_id}`;
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
      const screenshotPath = path.join(
        env.data,
        `${env.user_id}_screenshot.png`
      );
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      console.log(
        `Latest profile screenshot taken and saved to ${screenshotPath}.`
      );

      // Save the data to a file
      await saveData(page, `${env.domain}/api/1/users`, env.data, env.user_id);

      console.log("Data saved.");

      // Wait for a random time between 1 to 2 hours
      const waitTime =
        Math.floor(Math.random() * (2 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000)) +
        1 * 60 * 60 * 1000;
      console.log(
        `Waiting for ${waitTime / 1000 / 60} minutes before the next run...`
      );
      await wait(waitTime);

      // Reload the page
      // Navigate to the specific user page
      const userPageURL = `${env.domain}/home/user/${env.user_id}`;
      await page.goto(userPageURL, {
        waitUntil: "networkidle2",
        timeout: navigationTimeout,
      });
      console.log("Navigated to user page.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Close the browser after the actions
    await browser.close();
  }
})();
