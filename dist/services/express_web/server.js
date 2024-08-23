"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("../../libs/config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Ensure USER_ID environment variable is set.
 *
 * @throws {Error} If the USER_ID environment variable is not set.
 *
 * // EN: Verifies that the USER_ID environment variable is defined; throws an error if not.
 * // FR: Vérifie que la variable d'environnement USER_ID est définie ; lance une erreur sinon.
 */
if (!config_1.env.user_id) {
    throw new Error("Environment variable USER_ID must be set");
}
// Initialize Express app
// Initialiser l'application Express
const app = (0, express_1.default)();
/**
 * Serve static files from the 'data' folder.
 *
 * @remarks
 * Configures Express to serve static files from the user directory.
 *
 * // EN: Configures the Express application to serve static files from the specified directory.
 * // FR: Configure l'application Express pour servir des fichiers statiques depuis le répertoire spécifié.
 */
app.use(express_1.default.static(path_1.default.join(__dirname, config_1.dir.user)));
/**
 * Route to get user data.
 *
 * @param req The request object.
 * @param res The response object.
 *
 * // EN: Handles GET requests to retrieve user data from 'user_infos.json' or 'old_method/user_data.json'.
 * // FR: Gère les requêtes GET pour récupérer les données utilisateur depuis 'user_infos.json' ou 'old_method/user_data.json'.
 */
app.get("/api/users", (req, res) => {
    // Define the paths to the JSON files
    const filePath1 = path_1.default.join(config_1.dir.user, "user_infos.json");
    const filePath2 = path_1.default.join(config_1.dir.user, "old_method/user_data.json");
    // Check if the first file exists, otherwise check the second file
    fs_1.default.access(filePath1, fs_1.default.constants.F_OK, (err) => {
        if (!err) {
            // File exists, read it
            fs_1.default.readFile(filePath1, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading JSON file:", err);
                    return res.status(500).json(config_1.cfg.web_api.errorServer);
                }
                try {
                    res.set("Content-Type", "application/json");
                    const jsonData = JSON.parse(data);
                    res.json(jsonData);
                }
                catch (parseError) {
                    console.error("Error parsing JSON file:", parseError);
                    res.status(500).json(config_1.cfg.web_api.errorServer);
                }
            });
        }
        else {
            // File does not exist, try the second file
            fs_1.default.readFile(filePath2, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading JSON file:", err);
                    return res.status(500).json(config_1.cfg.web_api.errorServer);
                }
                try {
                    res.set("Content-Type", "application/json");
                    const jsonData = JSON.parse(data);
                    res.json(jsonData);
                }
                catch (parseError) {
                    console.error("Error parsing JSON file:", parseError);
                    res.status(500).json(config_1.cfg.web_api.errorServer);
                }
            });
        }
    });
});
/**
 * Route to get worlds data.
 *
 * @param req The request object.
 * @param res The response object.
 *
 * // EN: Handles GET requests to retrieve worlds data from 'worlds_data.json'.
 * // FR: Gère les requêtes GET pour récupérer les données des mondes depuis 'worlds_data.json'.
 */
app.get("/api/old/users/worlds", (req, res) => {
    fs_1.default.readFile(path_1.default.join(config_1.dir.user, "old/worlds_data.json"), "utf8", (err, data) => {
        if (err) {
            console.error("Error reading JSON file:", err);
            return res.status(500).json(config_1.cfg.web_api.errorServer);
        }
        try {
            res.set("Content-Type", "application/json");
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        }
        catch (parseError) {
            console.error("Error parsing JSON file:", parseError);
            res.status(500).json(config_1.cfg.web_api.errorServer);
        }
    });
});
/**
 * Route to get groups list.
 *
 * @param req The request object.
 * @param res The response object.
 *
 * // EN: Handles GET requests to retrieve the list of groups from 'groupsList_data.json'.
 * // FR: Gère les requêtes GET pour récupérer la liste des groupes depuis 'groupsList_data.json'.
 */
app.get("/api/old/users/groups", (req, res) => {
    fs_1.default.readFile(path_1.default.join(config_1.dir.user, "old/groupsList_data.json"), "utf8", (err, data) => {
        if (err) {
            console.error("Error reading JSON file:", err);
            return res.status(500).json(config_1.cfg.web_api.errorServer);
        }
        try {
            res.set("Content-Type", "application/json");
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        }
        catch (parseError) {
            console.error("Error parsing JSON file:", parseError);
            res.status(500).json(config_1.cfg.web_api.errorServer);
        }
    });
});
/**
 * Route to get represented groups data.
 *
 * @param req The request object.
 * @param res The response object.
 *
 * // EN: Handles GET requests to retrieve data of represented groups from 'groupsRepresented_data.json'.
 * // FR: Gère les requêtes GET pour récupérer les données des groupes représentés depuis 'groupsRepresented_data.json'.
 */
app.get("/api/old/users/groups/represented", (req, res) => {
    fs_1.default.readFile(path_1.default.join(config_1.dir.user, "old/groupsRepresented_data.json"), "utf8", (err, data) => {
        if (err) {
            console.error("Error reading JSON file:", err);
            return res.status(500).json(config_1.cfg.web_api.errorServer);
        }
        try {
            res.set("Content-Type", "application/json");
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        }
        catch (parseError) {
            console.error("Error parsing JSON file:", parseError);
            res.status(500).json(config_1.cfg.web_api.errorServer);
        }
    });
});
/**
 * Route to get screenshot.
 *
 * @param req The request object.
 * @param res The response object.
 *
 * // EN: Handles GET requests to retrieve a screenshot image from 'screenshot.png'.
 * // FR: Gère les requêtes GET pour récupérer une image de capture d'écran depuis 'screenshot.png'.
 */
app.get("/api/old/users/screenshot", (req, res) => {
    fs_1.default.readFile(path_1.default.join(config_1.dir.user, "old/screenshot.png"), (err, data) => {
        if (err) {
            console.error("Error reading screenshot file:", err);
            return res.status(500).json(config_1.cfg.web_api.errorServer);
        }
        res.set("Content-Type", "image/png");
        res.send(data);
    });
});
/**
 * Handle 404 - Not Found.
 *
 * @param req The request object.
 * @param res The response object.
 *
 * // EN: Handles 404 errors by redirecting to a specified URL.
 * // FR: Gère les erreurs 404 en redirigeant vers une URL spécifiée.
 */
app.use((req, res) => {
    res.status(404).redirect(config_1.cfg.web_api.redirect404);
});
/**
 * Handle 500 - Internal Server Error.
 *
 * @param err The error object.
 * @param req The request object.
 * @param res The response object.
 *
 * // EN: Handles 500 errors by logging the error and responding with a server error message.
 * // FR: Gère les erreurs 500 en enregistrant l'erreur et en répondant avec un message d'erreur serveur.
 */
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json(config_1.cfg.web_api.errorServer);
});
/**
 * Start the server.
 *
 * @remarks
 * Starts the Express server and logs the port it is running on.
 *
 * // EN: Starts the Express server and logs the port number.
 * // FR: Démarre le serveur Express et enregistre le numéro de port.
 */
app.listen(config_1.env.web_api_port, () => {
    console.log(`Server is running at port ${config_1.env.web_api_port}`);
});
