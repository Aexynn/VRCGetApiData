"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const dotenv_1 = require("dotenv");
const config_1 = require("../../libs/config");
const check_requirements_1 = require("../../libs/check_requirements");
const user_action_1 = require("../../libs/user_action");
const errors_1 = require("../../libs/errors");
(0, dotenv_1.config)();
class Auth {
    constructor() {
        this.config = {};
        this.init();
    }
    async init() {
        try {
            const configPath = path_1.default.join(config_1.dir.auth, "user_bot.json");
            if (fs_1.default.existsSync(configPath)) {
                this.config = require(configPath);
            }
            else {
                console.error(`Configuration file not found at ${configPath}`);
                process.exit(1);
            }
            const args = process.argv.slice(2);
            const force = args.includes("--force");
            if (!force && this.config.auth && this.config.twofa) {
                console.log("Authentication already configured. Use --force to re-authenticate.");
                process.exit(0);
            }
            if (args.includes("--twoauth")) {
                await this.code();
            }
            else {
                if (this.config.auth && !this.config.twofa) {
                    this.relaunchWithTwoAuth();
                }
                else {
                    await this.auth();
                    this.relaunchWithTwoAuth();
                }
            }
            this.saveUserBotConfig();
        }
        catch (err) {
            console.error("Error during initialization:", err);
        }
        finally {
            process.exit(0);
        }
    }
    saveUserBotConfig() {
        const configPath = path_1.default.join(config_1.dir.auth, "user_bot.json");
        if (!fs_1.default.existsSync(config_1.dir.auth)) {
            fs_1.default.mkdirSync(config_1.dir.auth, { recursive: true });
        }
        fs_1.default.writeFileSync(configPath, JSON.stringify(this.config, null, 2), "utf-8");
        console.log(`Configuration saved to ${configPath}`);
    }
    async code() {
        const code = await (0, user_action_1.waitForUserInput)(`Please enter your 2FA code (${this.config.codetype}) and press Enter:`);
        try {
            const response = await axios_1.default.post(config_1.urls.api.auth.twofa.replace("{{method_twofa}}", this.config.codetype), { code }, {
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `auth=${this.config.auth}`,
                    "User-Agent": config_1.env.userAgent,
                },
            });
            const json = response.data;
            if (json.error || !json.verified) {
                throw new Error(json.error?.message || "Not verified");
            }
            const setCookie = response.headers["set-cookie"];
            if (setCookie) {
                this.config.twofa = setCookie
                    .find((cookie) => cookie.startsWith("twoFactorAuth="))
                    ?.split(";")[0]
                    .split("=")[1];
            }
            else {
                throw new Error("Cookie 'set-cookie' not present in the response.");
            }
            this.config.code = code;
            console.log("Successfully connected!");
        }
        catch (error) {
            if ((0, errors_1.isAxiosError)(error)) {
                console.error("Error verifying 2FA code:", error.message);
                if (error.response) {
                    const responseData = JSON.stringify(error.response.data, null, 2);
                    console.error(`API responded with status ${error.response.status ?? "Unknown status"} and data: ${responseData ?? "No data"}`);
                }
                else {
                    console.error("No response data available.");
                }
            }
            else {
                console.error("Error verifying 2FA code:", error);
            }
        }
    }
    async auth() {
        const password = process.env.PASSWORD ||
            (await (0, user_action_1.waitForUserInput)("Password not found in environment. Please enter your password: "));
        const nickname = process.env.NICKNAME ||
            (await (0, user_action_1.waitForUserInput)("Nickname not found in environment. Please enter your nickname: "));
        if (!password || !nickname) {
            throw new Error("Password or Nickname is required but not provided.");
        }
        console.log("Attempting to connect...");
        try {
            const response = await axios_1.default.get(config_1.urls.api.auth.login, {
                headers: {
                    "User-Agent": config_1.env.userAgent,
                    Authorization: `Basic ${Buffer.from(nickname + ":" + password).toString("base64")}`,
                },
            });
            const json = response.data;
            if (json.error)
                throw new Error(json.error.message);
            const setCookie = response.headers["set-cookie"];
            if (setCookie) {
                this.config = {
                    nickname,
                    password,
                    auth: setCookie
                        .find((cookie) => cookie.startsWith("auth="))
                        ?.split(";")[0]
                        .split("=")[1],
                    codetype: json.requiresTwoFactorAuth[0]?.toLowerCase() || "emailotp",
                    code: null,
                    twofa: null,
                };
            }
            else {
                throw new Error("Cookie 'set-cookie' not present in the response.");
            }
            if (json.requiresTwoFactorAuth) {
                console.log("Please verify your 2FA code.");
            }
            else {
                console.log("Connected.");
            }
        }
        catch (error) {
            if ((0, errors_1.isAxiosError)(error)) {
                console.error("Error during initial authentication:", error.message);
                if (error.response) {
                    const responseData = JSON.stringify(error.response.data, null, 2);
                    console.error(`API responded with status ${error.response.status ?? "Unknown status"} and data: ${responseData ?? "No data"}`);
                }
                else {
                    console.error("No response data available.");
                }
            }
            else {
                console.error("Error during initial authentication:", error);
            }
        }
    }
    relaunchWithTwoAuth() {
        console.log("Restarting the script with --twoauth...");
        const args = process.argv.slice(1).concat("--twoauth");
        (0, child_process_1.spawn)("node", args, { stdio: "inherit" });
    }
}
(0, check_requirements_1.checkDir)("auth");
new Auth();
//# sourceMappingURL=initiate_auth.js.map