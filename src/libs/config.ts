import { config as dotEnvConfig } from "dotenv";

// Load environment variables
// Charger les variables d'environnement
dotEnvConfig();

// Define configuration variables and data folder path
// Définir les variables de configuration et le chemin du dossier de données
export const cfg = {
  vrchat_domain: "https://vrchat.com",
  browser: {
    headless: true,
    width: 1389,
    height: 1818,
  },
  data_folder: "data",
} as const; // Use 'as const' to make the object readonly and preserve literal types

// Define environment variables
// Définir les variables d'environnement
export const env = {
  user_id: process.env.USER_ID!, // User ID retrieved from environment variables
  nickname: process.env.NICKNAME!, // Nickname retrieved from environment variables
} as const;

// Check if critical environment variables are set
// Vérifiez si les variables d'environnement critiques sont définies
if (!env.user_id || !env.nickname) {
  throw new Error(
    "UserID and/or Nickname is not set. Please check your environment variables."
  );
}

// Define paths for user-specific and authentication data
// Définir les chemins pour les données spécifiques à l'utilisateur et d'authentification
export const dir = {
  user: `${cfg.data_folder}/${process.env.USER_ID}`,
  auth: `${cfg.data_folder}/auth`,
} as const; // Use 'as const' to make the object readonly and preserve literal types

// Define URLs for login, two-factor authentication, profile, and API endpoints
// Définir les URLs pour la connexion, l'authentification à deux facteurs, le profil et les points de terminaison de l'API
export const urls = {
  login: `${cfg.vrchat_domain}/home/login`,
  twoFA: `${cfg.vrchat_domain}/home/emailtwofactorauth`,
  profile: `${cfg.vrchat_domain}/home/user/${process.env.USER_ID}`,
  api: {
    users: `${cfg.vrchat_domain}/api/1/users`,
  },
} as const; // Use 'as const' to make the object readonly and preserve literal types

// Define CSS selectors for form fields and buttons on the login and profile pages
// Définir les sélecteurs CSS pour les champs de formulaire et les boutons sur les pages de connexion et de profil
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
} as const; // Use 'as const' to make the object readonly and preserve literal types

// Define TypeScript types for the configuration and selectors
// Définir les types TypeScript pour la configuration et les sélecteurs
type BrowserConfig = {
  headless: boolean;
  width: number;
  height: number;
};

type ApiUrls = {
  users: string;
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
};

type Env = {
  user_id: string;
  nickname: string;
};

export type { Config, BrowserConfig, ApiUrls, Urls, Selector, Env };

// Optionally, you can enforce typing on the configuration object
// Optionnellement, vous pouvez imposer la typage sur l'objet de configuration
const config: Config = cfg;
