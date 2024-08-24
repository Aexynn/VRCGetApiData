"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selector = exports.urls = exports.dir = exports.env = exports.cfg = void 0;
const dotenv_1 = require("dotenv");
/**
 * Load environment variables from a .env file.
 *
 * @remarks
 * Uses the `dotenv` package to load environment variables into `process.env`.
 *
 * // EN: Loads environment variables from a .env file into `process.env`.
 * // FR: Charge les variables d'environnement depuis un fichier .env dans `process.env`.
 */
(0, dotenv_1.config)();
/**
 * Configuration object with VRChat domain, browser settings, data folder path, and web API settings.
 *
 * @remarks
 * Defines the configuration settings for the VRChat domain, browser options, data folder, and web API.
 *
 * // EN: Configuration object for VRChat domain, browser settings, data folder path, and web API settings.
 * // FR: Objet de configuration pour le domaine VRChat, les paramètres du navigateur, le chemin du dossier de données et les paramètres de l'API web.
 */
exports.cfg = {
    vrchat_domain: "https://vrchat.com",
    browser: {
        headless: true,
        width: 1389,
        height: 1818,
    },
    data_folder: "data",
    web_api: {
        redirect404: "https://github.com/Kyuddle/VRCGetApiData",
        errorServer: "An internal server error has occurred. Please try again later.",
        groupFeature: "Group feature is disabled",
    },
    activate_group_feature: true,
    activate_loop_fetching: true,
};
/**
 * Environment variables for user ID, nickname, API port, and user agent.
 *
 * @remarks
 * Retrieves essential environment variables for user ID, nickname, API port, and user agent.
 *
 * // EN: Contains environment variables for user ID, nickname, API port, and user agent.
 * // FR: Contient les variables d'environnement pour l'ID utilisateur, le surnom, le port de l'API et l'agent utilisateur.
 */
exports.env = {
    user_id: process.env.USER_ID, // User ID retrieved from environment variables
    nickname: process.env.NICKNAME, // Nickname retrieved from environment variables
    web_api_port: process.env.PORT || 3000,
    userAgent: process.env.USER_AGENT,
};
/**
 * Throws an error if critical environment variables (USER_ID, NICKNAME, USER_AGENT) are not set.
 *
 * @remarks
 * Ensures that all required environment variables are defined; otherwise, it throws an error.
 *
 * // EN: Checks and throws an error if any critical environment variables are missing.
 * // FR: Vérifie et lance une erreur si des variables d'environnement critiques sont manquantes.
 */
if (!exports.env.user_id || !exports.env.nickname || !exports.env.userAgent) {
    throw new Error("USER_ID and/or NICKNAME and/or USER_AGENT is not set. Please check your environment variables (.env).");
}
/**
 * Paths for user-specific and authentication data directories.
 *
 * @remarks
 * Defines paths for user-specific data and authentication-related directories.
 *
 * // EN: Contains paths for directories related to user-specific and authentication data.
 * // FR: Contient les chemins pour les répertoires liés aux données spécifiques à l'utilisateur et à l'authentification.
 */
exports.dir = {
    user: `${exports.cfg.data_folder}/users/${process.env.USER_ID}`,
    groups: `${exports.cfg.data_folder}/groups/${process.env.GROUP_ID}`,
    auth: `${exports.cfg.data_folder}/auth`,
};
/**
 * URLs for login, two-factor authentication, user profile, and API endpoints.
 *
 * @remarks
 * Provides URLs for login, two-factor authentication, user profile, and various API endpoints.
 *
 * // EN: Defines URLs for login, two-factor authentication, user profile, and API endpoints.
 * // FR: Définit les URLs pour la connexion, l'authentification à deux facteurs, le profil utilisateur et les points de terminaison de l'API.
 */
exports.urls = {
    login: `${exports.cfg.vrchat_domain}/home/login`,
    twoFA: `${exports.cfg.vrchat_domain}/home/emailtwofactorauth`,
    profile: `${exports.cfg.vrchat_domain}/home/user/${process.env.USER_ID}`,
    api: {
        users: `${exports.cfg.vrchat_domain}/api/1/users/${process.env.USER_ID}`,
        groups: {
            list: `${exports.cfg.vrchat_domain}/api/1/users/${process.env.USER_ID}/groups`,
            represented: `${exports.cfg.vrchat_domain}/api/1/users/${process.env.USER_ID}/groups/represented`,
        },
        group_data: {
            infos: `${exports.cfg.vrchat_domain}/api/1/groups/${process.env.GROUP_ID}`,
            members: `${exports.cfg.vrchat_domain}/api/1/groups/${process.env.GROUP_ID}/members`,
            bans: `${exports.cfg.vrchat_domain}/api/1/groups/${process.env.GROUP_ID}/bans`,
        },
    },
};
/**
 * Throws an error if critical environment variables (GROUP_ID) are not set.
 *
 * @remarks
 * Ensures that all required environment variables are defined; otherwise, it throws an error.
 *
 * // EN: Checks and throws an error if any critical environment variables are missing.
 * // FR: Vérifie et lance une erreur si des variables d'environnement critiques sont manquantes.
 */
if (!process.env.GROUP_ID && exports.cfg.activate_group_feature) {
    throw new Error("GROUP_ID is not set. Please check your environment variables (.env) / If you don't need just desactivate in CFG const.");
}
/**
 * CSS selectors for form fields and buttons on the login and profile pages.
 *
 * @remarks
 * Specifies CSS selectors for various form fields and buttons used on login and profile pages.
 *
 * // EN: Contains CSS selectors for form fields and buttons on login and profile pages.
 * // FR: Contient les sélecteurs CSS pour les champs de formulaire et les boutons sur les pages de connexion et de profil.
 */
exports.selector = {
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
// Optionally, you can enforce typing on the configuration object
// Optionnellement, vous pouvez imposer le typage sur l'objet de configuration
const config = exports.cfg;
