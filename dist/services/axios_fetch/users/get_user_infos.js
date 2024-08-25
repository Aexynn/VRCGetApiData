"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getUserInfos = _getUserInfos;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../../libs/config");
const check_requirements_1 = require("../../../libs/check_requirements");
const errors_1 = require("../../../libs/errors");
async function _getUserInfos() {
    if (config_1.cfg.activate_user_feature) {
        (0, check_requirements_1.checkDir)("user");
        function loadJSON(filePath) {
            try {
                if (fs_1.default.existsSync(filePath)) {
                    const data = fs_1.default.readFileSync(filePath, "utf-8");
                    return JSON.parse(data);
                }
                else {
                    console.error(`File not found: ${filePath}`);
                    return null;
                }
            }
            catch (error) {
                if ((0, errors_1.isErrorWithMessage)(error)) {
                    console.error(`Failed to load JSON from file ${filePath}: ${error.message}`);
                }
                else {
                    console.error(`Failed to load JSON from file ${filePath}: Unknown error`);
                }
                return null;
            }
        }
        const requirements = loadJSON(path_1.default.join(config_1.dir.auth, "requirements.json"));
        const cookies = loadJSON(path_1.default.join(config_1.dir.auth, "cookies.json"));
        const storage = loadJSON(path_1.default.join(config_1.dir.auth, "storage.json"));
        if (!requirements || Object.keys(requirements).length === 0) {
            throw new Error("Requirements are missing or empty. Authentication cannot proceed.");
        }
        if (!cookies || Object.keys(cookies).length === 0) {
            throw new Error("Cookies are missing or empty. Authentication cannot proceed.");
        }
        if (!storage || Object.keys(storage).length === 0) {
            console.log("Local storage data is empty, proceeding without it.");
        }
        function saveUserInfoToFile(userInfo) {
            const userDir = config_1.dir.user;
            try {
                if (!fs_1.default.existsSync(userDir)) {
                    fs_1.default.mkdirSync(userDir, { recursive: true });
                }
                const filePath = path_1.default.join(userDir, "user_infos.json");
                fs_1.default.writeFileSync(filePath, JSON.stringify(userInfo, null, 2));
                console.log(`User info saved to ${filePath}`);
            }
            catch (error) {
                if ((0, errors_1.isErrorWithMessage)(error)) {
                    console.error(`Failed to save user info to file ${path_1.default.join(userDir, "user_infos.json")}: ${error.message}`);
                }
                else {
                    console.error(`Failed to save user info to file ${path_1.default.join(userDir, "user_infos.json")}: Unknown error`);
                }
            }
        }
        async function getUserInfos() {
            try {
                const headers = {
                    Cookie: cookies
                        .map((cookie) => `${cookie.name}=${cookie.value}`)
                        .join("; "),
                    "User-Agent": config_1.env.userAgent,
                    "Accept-Encoding": "gzip, compress, deflate, br",
                    Accept: "application/json, text/plain, */*",
                };
                const response = await axios_1.default.get(config_1.urls.api.users, { headers });
                saveUserInfoToFile(response.data);
                console.log("User info retrieved and saved successfully.");
            }
            catch (error) {
                if ((0, errors_1.isAxiosError)(error)) {
                    console.error(`Failed to retrieve user info: ${error.message}`);
                    if (error.response) {
                        const responseData = JSON.stringify(error.response.data, null, 2);
                        console.error(`API responded with status ${error.response.status ?? "Unknown status"} and data: ${responseData ?? "No data"}`);
                    }
                    else {
                        console.error("No response data available.");
                    }
                }
                else {
                    console.error("An unknown error occurred:", error);
                }
            }
        }
        getUserInfos();
    }
    else {
        console.log("Users Features is deactivated.");
        process.exit(0);
    }
}
_getUserInfos();
//# sourceMappingURL=get_user_infos.js.map