const puppeteer = require("puppeteer");
require("dotenv").config();
const readline = require("readline");
const fs = require("fs");
const path = require("path");

// Check if directory exist, and if not, create it.
if (!fs.existsSync(`data/${process.env.USER_ID}`)) {
  console.log(`Creating directory: data/${process.env.USER_ID}`);
  fs.mkdirSync(`data/${process.env.USER_ID}`, { recursive: true });
}

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

    data.user.manual.user_status = await page.$eval(
      'div[role="note"][aria-label^="User Status: "]',
      (el) => el.getAttribute("aria-label").replace("User Status: ", "").trim()
    );
    console.log("User Status scraped:", data.user.manual.user_status);

    // Scrape public worlds information
    const worldElements = await page.$$(
      'div[data-scrollkey^="wrld_"][aria-label="World Card"]'
    );

    const worldsData = [];
    for (let i = 0; i < worldElements.length; i++) {
      const worldElement = worldElements[i];
      const worldData = {};

      worldData.title = await worldElement.$eval(
        'a[aria-label="Open World Page"] h4',
        (el) => el.textContent.trim()
      );
      worldData.image = await worldElement.$eval(
        'a[aria-label="World Image"] img',
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
        'a[aria-label="Open World Page"]',
        (el) => el.href
      );

      // Extract platform information
      const platformDivs = await worldElement.$$(
        'a[aria-label="World Image"] div div[role="note"]'
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
      path.join(dataDir, `${user_id}/user_data.json`),
      JSON.stringify(data.user, null, 2)
    );
    fs.writeFileSync(
      path.join(dataDir, `${user_id}/worlds_data.json`),
      JSON.stringify(data.worlds, null, 2)
    );
    fs.writeFileSync(
      path.join(dataDir, `${user_id}/groupsRepresented_data.json`),
      JSON.stringify(data.groups.represented, null, 2)
    );

    // Fetch list of groups
    isMidnight = await checkIfMidnight();
    console.log(
      'Check if it is midnight to fetch "list of groups"...',
      isMidnight
    );
    if (isMidnight === true) {
      console.log("Fetching list of groups from API...");

      const apiGroupsUrl = `${apiUserUrl}/groups`;
      const groupsList = await fetchJsonFromUrl(page, apiGroupsUrl);
      data.groups.list = groupsList;

      fs.writeFileSync(
        path.join(dataDir, `${user_id}/groupsList_data.json`),
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
  };

  if (!env || !env.nickname || !env.password || !env.user_id) {
    throw new Error(
      "Environment variables NICKNAME, PASSWORD, and USER_ID must be set"
    );
  }

  // Config
  const cfg = {
    data_folder: "data",
    vrchat_domain: "https://vrchat.com",
    browser: {
      headless: true,
      ignoreHTTPSErrors: true,
      width: 1389,
      height: 1818,
    },
  };

  // URLs used in the script
  const urls = {
    login: `${cfg.vrchat_domain}/home/login`,
    twoFA: `${cfg.vrchat_domain}/home/emailtwofactorauth`,
    profile: `${cfg.vrchat_domain}/home/user/${env.user_id}`,
    api: {
      users: `${cfg.vrchat_domain}/api/1/users`,
    },
  };

  // Selectors for the username, password input, login button, privacy button and 2fa input & button
  const selector = {
    field: {
      username: "#username_email",
      password: "#password",
      twoFA: 'input[name="code"]',
    },
    button: {
      privacy: "#onetrust-accept-btn-handler",
      login: 'button[aria-label="Login"]',
      next2FA: 'button[type="submit"]',
    },
  };

  // Launch a browser instance
  const browser = await puppeteer.launch({
    headless: cfg.browser.headless,
    ignoreHTTPSErrors: cfg.browser.ignoreHTTPSErrors,
    args: [`--window-size=${cfg.browser.width},${cfg.browser.height}`],
    defaultViewport: {
      width: cfg.browser.width,
      height: cfg.browser.height,
    },
  });
  const page = await browser.newPage();
  const navigationTimeout = 60000; // 60 seconds

  try {
    // Set default navigation timeout
    await page.setDefaultNavigationTimeout(navigationTimeout);

    // Navigate to the login page
    const response = await page.goto(urls.login, {
      waitUntil: "networkidle2",
    });
    console.log("Request status: ", response?.status());

    // Wait for the privacy button to appear and click it
    await page.waitForSelector(selector.button.privacy, {
      timeout: navigationTimeout,
    });
    await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
      }
    }, selector.button.privacy);
    console.log("Privacy button clicked.");

    // Waits for the username and password fields to appear
    await page.waitForSelector(selector.field.username, {
      timeout: navigationTimeout,
    });
    await page.waitForSelector(selector.field.password, {
      timeout: navigationTimeout,
    });

    // Type the username and password into the input fields
    console.log("Logging in...");
    await page.type(selector.field.username, env.nickname, { delay: 100 });
    await page.type(selector.field.password, env.password, { delay: 100 });

    // Click the login button
    await page.click(selector.button.login);
    console.log("Login button clicked. Waiting for 2FA page...");

    // Wait for navigation to the 2FA page
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    // Verify the current URL to ensure we are on the 2FA page
    const currentURL = page.url();
    if (currentURL !== urls.twoFA) {
      throw new Error("Failed to navigate to the 2FA page");
    }
    console.log("Navigated to the 2FA page.");

    // Wait for the 2FA input fields
    await page.waitForSelector(selector.field.twoFA, {
      timeout: navigationTimeout,
    });

    // Wait for 2FA code input from the user
    const twoFA = await waitForUserInput(
      "Please enter your 2FA code and press Enter: "
    );

    // Enter each digit into the corresponding input field
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

    // Wait for the next 2FA button to become enabled and visible
    await page.waitForFunction(
      (selector) => {
        const button = document.querySelector(selector);
        return button && !button.disabled && button.offsetParent !== null;
      },
      { timeout: navigationTimeout },
      selector.button.next2FA
    );

    // Add a slight delay before clicking the button to ensure it's clickable
    await wait(500); // 500 milliseconds

    // Click the next 2FA button
    await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
      }
    }, selector.button.next2FA);
    console.log("2FA button clicked.");

    // Wait for the page to redirect after 2FA
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    // Navigate to the specific user page
    await page.goto(urls.profile, {
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });
    console.log("Navigated to user page.");

    while (true) {
      // Wait for the loading div to disappear before continuing
      await waitForLoadingToDisappear(page);

      // Wait a moment to make sure the page is stable
      await wait(20000); // Wait 20 seconds for the page to stabilize and beautiful screenshot

      // Take a screenshot of the page
      const screenshotPath = path.join(
        cfg.data_folder,
        `${env.user_id}/screenshot.png`
      );
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      console.log(
        `Latest profile screenshot taken and saved to ${screenshotPath}.`
      );

      // Save the data to a file
      await saveData(page, urls.api.users, cfg.data_folder, env.user_id);

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
      await page.goto(urls.profile, {
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
