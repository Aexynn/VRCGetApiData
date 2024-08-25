"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getGroupData = _getGroupData;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../../libs/config");
const check_requirements_1 = require("../../../libs/check_requirements");
const errors_1 = require("../../../libs/errors");
async function _getGroupData() {
    if (config_1.cfg.activate_group_feature) {
        (0, check_requirements_1.checkDir)("group");
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
        async function saveGroupDataToFile(userGroups, file) {
            const groupDir = config_1.dir.groups;
            try {
                if (!fs_1.default.existsSync(groupDir)) {
                    fs_1.default.mkdirSync(groupDir, { recursive: true });
                }
                const filePath = path_1.default.join(groupDir, file);
                await fs_1.default.promises.writeFile(filePath, JSON.stringify(userGroups, null, 2));
                console.log(`Groups infos saved to ${filePath}`);
            }
            catch (error) {
                if ((0, errors_1.isErrorWithMessage)(error)) {
                    console.error(`Failed to save groups infos to file ${path_1.default.join(groupDir, file)}: ${error.message}`);
                }
                else {
                    console.error(`Failed to save groups infos to file ${path_1.default.join(groupDir, file)}: Unknown error`);
                }
            }
        }
        async function getGroupJsonData(url, file) {
            const headers = {
                Cookie: cookies
                    .map((cookie) => `${cookie.name}=${cookie.value}`)
                    .join("; "),
                "User-Agent": config_1.env.userAgent,
                "Accept-Encoding": "gzip, compress, deflate, br",
                Accept: "application/json, text/plain, */*",
            };
            try {
                const response = await axios_1.default.get(url, { headers });
                await saveGroupDataToFile(response.data, file);
            }
            catch (error) {
                if ((0, errors_1.isAxiosError)(error)) {
                    console.error(`Failed to retrieve data from ${url}: ${error.message}`);
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
        async function getGroupData() {
            try {
                await Promise.all([
                    getGroupJsonData(config_1.urls.api.group_data.infos, "group_infos.json"),
                    getGroupJsonData(config_1.urls.api.group_data.members, "group_members.json"),
                    getGroupJsonData(config_1.urls.api.group_data.bans, "group_bans.json"),
                ]);
                console.log("Groups infos retrieved and saved successfully.");
            }
            catch (error) {
                if ((0, errors_1.isAxiosError)(error)) {
                    console.error(`Failed to retrieve groups infos: ${error.message}`);
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
        getGroupData();
    }
    else {
        console.log("Groups Features is deactivated.");
        process.exit(0);
    }
}
_getGroupData();
//# sourceMappingURL=get_group_data.js.map