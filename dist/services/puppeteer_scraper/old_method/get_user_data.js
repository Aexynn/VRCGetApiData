"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const dotenv_1 = require("dotenv");
const config_1 = require("../../../libs/config");
const user_action_1 = require("../../../libs/user_action");
const check_requirements_1 = require("../../../libs/check_requirements");
const times_wait_1 = require("../../../libs/times_wait");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
(0, dotenv_1.config)();
(0, check_requirements_1.checkDir)("user");
async function fetchJsonFromUrl(page, url) {
    try {
        await page.goto(url, { waitUntil: "networkidle2" });
        const content = await page.evaluate(() => document.querySelector("body")?.innerText || "");
        console.log(`Successfully fetched ${url} data.`);
        return JSON.parse(content);
    }
    catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return null;
    }
}
async function saveData(page, url, dataDir, user_id) {
    const data = {
        user: {
            manual: { user_rank: "", last_login: "", user_status: "" },
            api: {},
        },
        worlds: [],
        groups: { represented: {}, list: {} },
    };
    try {
        console.log("Starting data scraping...");
        await page.waitForSelector('div[title="User Rank"]', { visible: true });
        await page.waitForSelector('div[title^="Last online"]', { visible: true });
        data.user.manual.user_rank = await page.$eval('div[title="User Rank"]', (el) => el.textContent?.trim() || "");
        console.log("User rank scraped:", data.user.manual.user_rank);
        data.user.manual.last_login = await page.$eval('div[title^="Last online"]', (el) => el.textContent?.trim() || "");
        console.log("Last login scraped:", data.user.manual.last_login);
        data.user.manual.user_status = await page.$eval('div[role="note"][aria-label^="User Status: "]', (el) => el.getAttribute("aria-label")?.replace("User Status: ", "").trim() || "");
        console.log("User Status scraped:", data.user.manual.user_status);
        const worldElements = await page.$$('div[data-scrollkey^="wrld_"][aria-label="World Card"]');
        for (const worldElement of worldElements) {
            const worldData = {
                title: await worldElement.$eval('a[aria-label="Open World Page"] h4', (el) => el.textContent?.trim() || ""),
                image: await worldElement.$eval('a[aria-label="World Image"] img', (el) => el.src || ""),
                online_players: await worldElement.$eval('div[title="Online Players"]', (el) => el.textContent?.trim() || ""),
                favorites: await worldElement.$eval('div[title="Favorites"]', (el) => el.textContent?.trim() || ""),
                last_updated: await worldElement.$eval('div[title="Updated"]', (el) => el.textContent?.trim() || ""),
                open_world_page: await worldElement.$eval('a[aria-label="Open World Page"]', (el) => el.href || ""),
                platform: {
                    windows: (await worldElement.$eval('a[aria-label="World Image"] div div[role="note"][title="Is a PC World"]', (el) => el !== null)) || false,
                    android: (await worldElement.$eval('a[aria-label="World Image"] div div[role="note"][title="Is a Quest World"]', (el) => el !== null)) || false,
                },
            };
            data.worlds.push(worldData);
            console.log("World data scraped:", worldData);
        }
        const apiUserUrl = `${url}/${user_id}`;
        const apiRepresentedGroupUrl = `${apiUserUrl}/groups/represented`;
        console.log("Fetching JSON data from API...");
        data.user.api = await fetchJsonFromUrl(page, apiUserUrl);
        data.groups.represented = await fetchJsonFromUrl(page, apiRepresentedGroupUrl);
        fs_1.default.writeFileSync(path_1.default.join(dataDir, `old_method/user_data.json`), JSON.stringify(data.user, null, 2));
        fs_1.default.writeFileSync(path_1.default.join(dataDir, `old_method/worlds_data.json`), JSON.stringify(data.worlds, null, 2));
        fs_1.default.writeFileSync(path_1.default.join(dataDir, `old_method/groupsRepresented_data.json`), JSON.stringify(data.groups.represented, null, 2));
        if (await (0, times_wait_1.checkIfMidnight)()) {
            console.log("Fetching list of groups from API...");
            const apiGroupsUrl = `${apiUserUrl}/groups`;
            data.groups.list = await fetchJsonFromUrl(page, apiGroupsUrl);
            fs_1.default.writeFileSync(path_1.default.join(dataDir, `old_method/groupsList_data.json`), JSON.stringify(data.groups.list, null, 2));
        }
        else {
            console.log("Not midnight. Skipping groups list fetch.");
        }
        console.log("Data saved successfully.");
    }
    catch (error) {
        console.error("Error saving data:", error);
    }
}
(async () => {
    const password = process.env.PASSWORD ||
        (await (0, user_action_1.waitForUserInput)("Password not found in environment. Please enter your password: "));
    if (!password) {
        throw new Error("Password is required but not provided.");
    }
    const browser = await puppeteer_1.default.launch({
        headless: config_1.cfg.browser.headless,
        args: [`--window-size=${config_1.cfg.browser.width},${config_1.cfg.browser.height}`],
        defaultViewport: {
            width: config_1.cfg.browser.width,
            height: config_1.cfg.browser.height,
        },
    });
    const page = await browser.newPage();
    const navigationTimeout = 60000;
    try {
        await page.setDefaultNavigationTimeout(navigationTimeout);
        const response = await page.goto(config_1.urls.login, { waitUntil: "networkidle2" });
        console.log("Request status: ", response?.status());
        await page.waitForSelector(config_1.selector.button.privacy, {
            timeout: navigationTimeout,
        });
        await page.evaluate((selector) => {
            const button = document.querySelector(selector);
            button?.click();
        }, config_1.selector.button.privacy);
        console.log("Privacy button clicked.");
        await page.waitForSelector(config_1.selector.field.username, {
            timeout: navigationTimeout,
        });
        await page.waitForSelector(config_1.selector.field.password, {
            timeout: navigationTimeout,
        });
        console.log("Logging in...");
        await page.type(config_1.selector.field.username, config_1.env.nickname, { delay: 100 });
        await page.type(config_1.selector.field.password, password, { delay: 100 });
        await page.click(config_1.selector.button.login);
        console.log("Login button clicked. Waiting for 2FA page...");
        await page.waitForNavigation({
            waitUntil: "networkidle2",
            timeout: navigationTimeout,
        });
        if (page.url() !== config_1.urls.twoFA) {
            throw new Error("Failed to navigate to the 2FA page");
        }
        console.log("Navigated to the 2FA page.");
        await page.waitForSelector(config_1.selector.field.twoFA, {
            timeout: navigationTimeout,
        });
        const twoFA = await (0, user_action_1.waitForUserInput)("Please enter your 2FA code and press Enter: ");
        const inputFields = await page.$$(config_1.selector.field.twoFA);
        if (inputFields.length !== twoFA.length) {
            throw new Error("The number of 2FA input fields does not match the code length.");
        }
        for (let i = 0; i < inputFields.length; i++) {
            await inputFields[i].type(twoFA[i], { delay: 100 });
        }
        console.log("2FA code entered.");
        await page.waitForFunction((selector) => {
            const button = document.querySelector(selector);
            return button && !button.disabled && button.offsetParent !== null;
        }, { timeout: navigationTimeout }, config_1.selector.button.next2FA);
        await (0, times_wait_1.wait)(500);
        await page.evaluate((selector) => {
            const button = document.querySelector(selector);
            button?.click();
        }, config_1.selector.button.next2FA);
        console.log("2FA button clicked.");
        await page.waitForNavigation({
            waitUntil: "networkidle2",
            timeout: navigationTimeout,
        });
        await page.goto(config_1.urls.profile, {
            waitUntil: "networkidle2",
            timeout: navigationTimeout,
        });
        console.log("Navigated to user page.");
        while (true) {
            await (0, times_wait_1.waitForLoadingToDisappear)(page);
            await (0, times_wait_1.wait)(20000);
            const screenshotPath = path_1.default.join(config_1.dir.user, "old/screenshot.png");
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`Latest profile screenshot taken and saved to ${screenshotPath}.`);
            await saveData(page, config_1.urls.api.users, config_1.dir.user, config_1.env.user_id);
            console.log("Data saved.");
            console.log(`Waiting for ${(0, times_wait_1.formatTime)(times_wait_1.waitTime)} before the next run...`);
            await (0, times_wait_1.wait)(times_wait_1.waitTime);
            await page.goto(config_1.urls.profile, {
                waitUntil: "networkidle2",
                timeout: navigationTimeout,
            });
            console.log("Navigated to user page.");
        }
    }
    catch (error) {
        console.error("An error occurred:", error);
    }
    finally {
        await browser.close();
    }
})();
//# sourceMappingURL=get_user_data.js.map