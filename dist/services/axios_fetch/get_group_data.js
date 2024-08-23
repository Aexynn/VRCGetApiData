"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../libs/config");
const check_requirements_1 = require("../../libs/check_requirements");
const errors_1 = require("../../libs/errors");
if (config_1.cfg.activate_group_function) {
    /**
     * Create the group directory if it does not exist.
     *
     * @remarks
     * Calls the `checkDir` function to ensure the group directory exists.
     *
     * // EN: Ensures that the group directory exists by calling the `checkDir` function.
     * // FR: Assure que le répertoire utilisateur existe en appelant la fonction `checkDir`.
     */
    (0, check_requirements_1.checkDir)("group");
    /**
     * Load JSON data from a file.
     *
     * @param filePath The path to the JSON file to load.
     * @returns The parsed JSON data, or null if the file does not exist or cannot be read.
     *
     * // EN: Reads and parses JSON data from a file, returning null if the file does not exist or an error occurs.
     * // FR: Lit et analyse les données JSON depuis un fichier, renvoyant null si le fichier n'existe pas ou si une erreur se produit.
     */
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
    // Load cookies, requirements and local storage data
    // Charger les cookies, les requis et les données du localStorage
    const requirements = loadJSON(path_1.default.join(config_1.dir.auth, "requirements.json"));
    const cookies = loadJSON(path_1.default.join(config_1.dir.auth, "cookies.json"));
    const storage = loadJSON(path_1.default.join(config_1.dir.auth, "storage.json"));
    /**
     * Check if cookies, requirements, and storage data are loaded properly.
     *
     * @remarks
     * Throws an error if requirements or cookies are missing or empty, and logs a message if storage data is empty.
     *
     * // EN: Verifies that cookies, requirements, and storage data are loaded correctly, throwing errors if necessary.
     * // FR: Vérifie si les cookies, les exigences et les données de stockage sont chargés correctement, en lançant des erreurs si nécessaire.
     */
    if (!requirements || Object.keys(requirements).length === 0) {
        throw new Error("Requirements are missing or empty. Authentication cannot proceed.");
    }
    if (!cookies || Object.keys(cookies).length === 0) {
        throw new Error("Cookies are missing or empty. Authentication cannot proceed.");
    }
    if (!storage || Object.keys(storage).length === 0) {
        console.log("Local storage data is empty, proceeding without it.");
    }
    /**
     * Save user information to a JSON file.
     *
     * @param userGroups The user information to save.
     * @param file The file name to save the data into.
     */
    async function saveGroupDataToFile(userGroups, file) {
        const groupDir = config_1.dir.groups;
        try {
            // Ensure the user directory exists
            if (!fs_1.default.existsSync(groupDir)) {
                fs_1.default.mkdirSync(groupDir, { recursive: true });
            }
            // Define the file path for saving user information
            const filePath = path_1.default.join(groupDir, file);
            // Write the user information to the file
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
    /**
     * Get JSON data from an API and save it to a file.
     *
     * @param url The API URL to request.
     * @param file The file name to save the data into.
     */
    async function getGroupJsonData(url, file) {
        // Build header
        const headers = {
            Cookie: cookies
                .map((cookie) => `${cookie.name}=${cookie.value}`)
                .join("; "),
            "User-Agent": config_1.env.userAgent,
            "Accept-Encoding": "gzip, compress, deflate, br",
            Accept: "application/json, text/plain, */*",
        };
        try {
            // Set up the request with headers, including cookies
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
    /**
     * Make API requests to retrieve group data and save it to files.
     */
    async function getGroupData() {
        try {
            // Await each call to ensure they are processed sequentially
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
    // Execute the function
    getGroupData();
}
else {
    console.log("Group function is deactivated.");
    process.exit(0);
}
