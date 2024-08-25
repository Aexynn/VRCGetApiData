"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const dotenv_1 = require("dotenv");
const js_base64_1 = require("js-base64");
const config_1 = require("../../libs/config");
const user_action_1 = require("../../libs/user_action");
const times_wait_1 = require("../../libs/times_wait");
const check_requirements_1 = require("../../libs/check_requirements");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
(0, dotenv_1.config)();
(0, check_requirements_1.checkDir)("auth");
const args = process.argv.slice(2);
const force = args.includes("--force");
function areAuthFilesValid() {
    try {
        const cookiesPath = path_1.default.join(config_1.dir.auth, "cookies.json");
        const requirementsPath = path_1.default.join(config_1.dir.auth, "requirements.json");
        const storagePath = path_1.default.join(config_1.dir.auth, "storage.json");
        if (!fs_1.default.existsSync(cookiesPath) ||
            !fs_1.default.existsSync(requirementsPath) ||
            !fs_1.default.existsSync(storagePath)) {
            console.log("One or more auth files are missing.");
            return false;
        }
        const cookies = JSON.parse(fs_1.default.readFileSync(cookiesPath, "utf8"));
        const requirements = JSON.parse(fs_1.default.readFileSync(requirementsPath, "utf8"));
        const storage = JSON.parse(fs_1.default.readFileSync(storagePath, "utf8"));
        const hasAuthCookies = cookies.some((cookie) => cookie.name.includes("auth"));
        const hasTwoFactorAuthCookies = cookies.some((cookie) => cookie.name.includes("twoFactorAuth"));
        const hasEncodedLogin = requirements.encoded_login &&
            typeof requirements.encoded_login === "string";
        if (!hasAuthCookies || !hasTwoFactorAuthCookies || !hasEncodedLogin) {
            console.log("One or more required auth fields are missing or invalid.");
            return false;
        }
        console.log("Auth files are valid.");
        return true;
    }
    catch (error) {
        console.error("Error validating auth files:", error);
        return false;
    }
}
if (!force && areAuthFilesValid()) {
    console.log("Auth files are valid. Skipping login process.");
    process.exit(0);
}
function encodeLogin(nickname, password) {
    const encodedCredentials = `${encodeURIComponent(nickname)}:${encodeURIComponent(password)}`;
    return js_base64_1.Base64.encode(encodedCredentials);
}
(async () => {
    const password = process.env.PASSWORD ||
        (await (0, user_action_1.waitForUserInput)("Password not found in environment. Please enter your password: "));
    if (!password) {
        throw new Error("Password is required but not provided.");
    }
    const encodedLogin = encodeLogin(config_1.env.nickname, password);
    const requirementsFilePath = path_1.default.join(config_1.dir.auth, "requirements.json");
    const data = {
        encoded_login: encodedLogin,
    };
    fs_1.default.writeFileSync(requirementsFilePath, JSON.stringify(data, null, 2));
    console.log(`Encoded login information saved to ${requirementsFilePath} for future use (Thanks, VRChat API...).`);
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
        const cookies = (await page.cookies()).filter((cookie) => ["auth", "twoFactorAuth"].some((term) => cookie.name.includes(term)));
        const localStorageData = await page.evaluate(() => {
            const json = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes("auth") || key.includes("twoFactorAuth"))) {
                    json[key] = localStorage.getItem(key);
                }
            }
            return json;
        });
        fs_1.default.writeFileSync(path_1.default.join(config_1.dir.auth, `cookies.json`), JSON.stringify(cookies, null, 2));
        fs_1.default.writeFileSync(path_1.default.join(config_1.dir.auth, `storage.json`), JSON.stringify(localStorageData, null, 2));
        console.log("Filtered cookies and storage data saved successfully.");
    }
    catch (error) {
        console.error("An error occurred:", error);
    }
    finally {
        await browser.close();
    }
})();
//# sourceMappingURL=initiate_auth.js.map