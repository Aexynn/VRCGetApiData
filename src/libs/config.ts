import { config as dotEnvConfig } from "dotenv";

/**
 * Load environment variables from a .env file.
 *
 * @remarks
 * Uses the `dotenv` package to load environment variables into `process.env`.
 *
 * // EN: Loads environment variables from a .env file into `process.env`.
 * // FR: Charge les variables d'environnement depuis un fichier .env dans `process.env`.
 */
dotEnvConfig();

/**
 * Configuration object with VRChat domain, browser settings, data folder path, and web API settings.
 *
 * @remarks
 * Defines the configuration settings for the VRChat domain, browser options, data folder, and web API.
 *
 * // EN: Configuration object for VRChat domain, browser settings, data folder path, and web API settings.
 * // FR: Objet de configuration pour le domaine VRChat, les paramètres du navigateur, le chemin du dossier de données et les paramètres de l'API web.
 */
export const cfg = {
  vrchat_domain: "https://vrchat.com",
  browser: {
    headless: true,
    width: 1389,
    height: 1818,
  },
  data_folder: "data",
  web_api: {
    redirect404: "https://github.com/Kyuddle/VRCGetApiData",
    errorServer:
      '{"error": "An internal server error has occurred. Please try again later."}',
  },
  activate_group_function: true,
} as const;

/**
 * Environment variables for user ID, nickname, API port, and user agent.
 *
 * @remarks
 * Retrieves essential environment variables for user ID, nickname, API port, and user agent.
 *
 * // EN: Contains environment variables for user ID, nickname, API port, and user agent.
 * // FR: Contient les variables d'environnement pour l'ID utilisateur, le surnom, le port de l'API et l'agent utilisateur.
 */
export const env = {
  user_id: process.env.USER_ID!, // User ID retrieved from environment variables
  nickname: process.env.NICKNAME!, // Nickname retrieved from environment variables
  web_api_port: process.env.PORT || 3000,
  userAgent: process.env.USER_AGENT!,
} as const;

/**
 * Throws an error if critical environment variables (USER_ID, NICKNAME, USER_AGENT) are not set.
 *
 * @remarks
 * Ensures that all required environment variables are defined; otherwise, it throws an error.
 *
 * // EN: Checks and throws an error if any critical environment variables are missing.
 * // FR: Vérifie et lance une erreur si des variables d'environnement critiques sont manquantes.
 */
if (!env.user_id || !env.nickname || !env.userAgent) {
  throw new Error(
    "USER_ID and/or NICKNAME and/or USER_AGENT is not set. Please check your environment variables (.env)."
  );
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
export const dir = {
  user: `${cfg.data_folder}/users/${process.env.USER_ID}`,
  groups: `${cfg.data_folder}/groups/${process.env.GROUP_ID}`,
  auth: `${cfg.data_folder}/auth`,
} as const;

/**
 * URLs for login, two-factor authentication, user profile, and API endpoints.
 *
 * @remarks
 * Provides URLs for login, two-factor authentication, user profile, and various API endpoints.
 *
 * // EN: Defines URLs for login, two-factor authentication, user profile, and API endpoints.
 * // FR: Définit les URLs pour la connexion, l'authentification à deux facteurs, le profil utilisateur et les points de terminaison de l'API.
 */
export const urls = {
  login: `${cfg.vrchat_domain}/home/login`,
  twoFA: `${cfg.vrchat_domain}/home/emailtwofactorauth`,
  profile: `${cfg.vrchat_domain}/home/user/${process.env.USER_ID}`,
  api: {
    users: `${cfg.vrchat_domain}/api/1/users/${process.env.USER_ID}`,
    groups: {
      list: `${cfg.vrchat_domain}/api/1/users/${process.env.USER_ID}/groups`,
      represented: `${cfg.vrchat_domain}/api/1/users/${process.env.USER_ID}/groups/represented`,
    },
    group_data: {
      infos: `${cfg.vrchat_domain}/api/1/groups/${process.env.GROUP_ID}`,
      members: `${cfg.vrchat_domain}/api/1/groups/${process.env.GROUP_ID}/members`,
      bans: `${cfg.vrchat_domain}/api/1/groups/${process.env.GROUP_ID}/bans`,
    },
  },
} as const;

/**
 * Throws an error if critical environment variables (GROUP_ID) are not set.
 *
 * @remarks
 * Ensures that all required environment variables are defined; otherwise, it throws an error.
 *
 * // EN: Checks and throws an error if any critical environment variables are missing.
 * // FR: Vérifie et lance une erreur si des variables d'environnement critiques sont manquantes.
 */
if (!process.env.GROUP_ID && cfg.activate_group_function) {
  throw new Error(
    "GROUP_ID is not set. Please check your environment variables (.env) / If you don't need just desactivate in CFG const."
  );
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
export const selector = {
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
} as const;

/**
 * Type definitions for configuration settings, API URLs, and CSS selectors.
 *
 * @remarks
 * Includes TypeScript types for configuration settings, API URLs, and CSS selectors.
 *
 * // EN: Defines TypeScript types for configuration settings, API URLs, and CSS selectors.
 * // FR: Définit les types TypeScript pour les paramètres de configuration, les URLs de l'API et les sélecteurs CSS.
 */
type BrowserConfig = {
  headless: boolean;
  width: number;
  height: number;
};

type Dir = {
  user: string;
  groups: string;
  auth: string;
};

type ApiGroupsUrls = {
  list: string;
  representend: string;
};

type ApiUrls = {
  users: string;
  groups: ApiGroupsUrls;
};

type WebApi = {
  redirect404: string;
  errorServer: any;
};

type Urls = {
  login: string;
  twoFA: string;
  profile: string;
  api: ApiUrls;
};

type Selector = {
  field: {
    username: string;
    password: string;
    twoFA: string;
  };
  button: {
    privacy: string;
    login: string;
    next2FA: string;
  };
};

type Config = {
  vrchat_domain: string;
  browser: BrowserConfig;
  data_folder: string;
  web_api: WebApi;
  activate_group_function: boolean;
};

type Env = {
  user_id: string;
  nickname: string;
  web_api_port: number;
  userAgent: string;
};

export type { Config, BrowserConfig, ApiUrls, Urls, Selector, Env, Dir };

// Optionally, you can enforce typing on the configuration object
// Optionnellement, vous pouvez imposer le typage sur l'objet de configuration
const config: Config = cfg;
