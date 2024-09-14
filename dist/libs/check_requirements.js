"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDir = checkDir;
exports.areAuthFilesValid = areAuthFilesValid;
const config_1 = require("./config");
const errors_1 = require("./errors");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function checkDir(target) {
    switch (target) {
        case "auth":
            if (!fs_1.default.existsSync(config_1.dir.auth)) {
                console.log(`Creating directory: ${config_1.dir.auth}`);
                fs_1.default.mkdirSync(config_1.dir.auth, { recursive: true });
            }
            const requiredFiles = ["cookies.json"];
            requiredFiles.forEach((file) => {
                const filePath = path_1.default.join(config_1.dir.auth, file);
                if (!fs_1.default.existsSync(filePath)) {
                    console.error(`Missing file: ${filePath}`);
                }
            });
            try {
                const cookiesFilePath = path_1.default.join(config_1.dir.auth, "cookies.json");
                const loadJSON = (filePath) => {
                    if (fs_1.default.existsSync(filePath)) {
                        const data = fs_1.default.readFileSync(filePath, "utf-8");
                        return JSON.parse(data);
                    }
                    return null;
                };
                const cookies = loadJSON(cookiesFilePath);
                if (!cookies || Object.keys(cookies).length === 0) {
                    throw new Error("Cookies file is missing or empty. Please run the appropriate command.");
                }
            }
            catch (error) {
                if ((0, errors_1.isErrorWithMessage)(error)) {
                    console.error(error.message);
                    const command = config_1.isDev ? "scrape:auth" : "dist/scrape:auth";
                    console.error(`Error in auth directory. Please run the command: ${command}`);
                    return false;
                }
            }
            return true;
        case "user":
            if (!fs_1.default.existsSync(config_1.dir.user)) {
                console.log(`Creating directory: ${config_1.dir.user}`);
                fs_1.default.mkdirSync(config_1.dir.user, { recursive: true });
            }
            break;
        case "group":
            if (!fs_1.default.existsSync(config_1.dir.groups)) {
                console.log(`Creating directory: ${config_1.dir.groups}`);
                fs_1.default.mkdirSync(config_1.dir.groups, { recursive: true });
            }
            break;
        default:
            throw new Error("checkDir needs a valid target.");
    }
}
function areAuthFilesValid() {
    try {
        const cookiesPath = path_1.default.join(config_1.dir.auth, "user_bot.json");
        if (!fs_1.default.existsSync(cookiesPath)) {
            console.log("One or more auth files are missing.");
            return false;
        }
        const cookies = JSON.parse(fs_1.default.readFileSync(cookiesPath, "utf8"));
        const hasAuthCookies = cookies.some((cookie) => cookie.name.includes("auth"));
        const hasTwoFactorAuthCookies = cookies.some((cookie) => cookie.name.includes("twoFactorAuth"));
        if (!hasAuthCookies || !hasTwoFactorAuthCookies) {
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
//# sourceMappingURL=check_requirements.js.map