import fs from "fs";
import path from "path";
import axios from "axios";
import { spawn } from "child_process";
import { config } from "dotenv";
import { dir, env, urls } from "../../libs/config";
import { checkDir } from "../../libs/check_requirements";
import { waitForUserInput } from "../../libs/user_action";
import { isAxiosError } from "../../libs/errors";

config();

/**
 * Handles the authentication process for a user bot.
 *
 * @remarks
 * The `Auth` class manages the authentication process, including checking existing configurations,
 * handling 2FA (Two-Factor Authentication), and saving authentication details. It also handles command-line arguments
 * to control the flow of authentication.
 *
 * // EN: Manages the authentication process for the user bot, including configuration checks and 2FA.
 * // FR: Gère le processus d'authentification pour le bot utilisateur, y compris les vérifications de configuration et la 2FA.
 */
class Auth {
  private config: any = {};

  constructor() {
    this.init();
  }

  /**
   * Initializes the authentication process by checking existing configuration and handling authentication flows.
   *
   * @remarks
   * Reads existing configuration, processes command-line arguments to determine if re-authentication is needed,
   * and performs the authentication or 2FA process accordingly. Saves the configuration upon successful authentication.
   *
   * // EN: Initializes authentication by checking existing configuration and processing command-line arguments.
   * // FR: Initialise l'authentification en vérifiant la configuration existante et en traitant les arguments de la ligne de commande.
   */
  private async init() {
    try {
      const configPath = path.join(dir.auth, "user_bot.json");

      if (fs.existsSync(configPath)) {
        this.config = require(configPath);
      } else {
        console.error(`Configuration file not found at ${configPath}`);
        process.exit(1);
      }

      const args = process.argv.slice(2);
      const force = args.includes("--force");

      if (!force && this.config.auth && this.config.twofa) {
        console.log(
          "Authentication already configured. Use --force to re-authenticate."
        );
        process.exit(0);
      }

      if (args.includes("--twoauth")) {
        await this.code();
      } else {
        if (this.config.auth && !this.config.twofa) {
          this.relaunchWithTwoAuth();
        } else {
          await this.auth();
          this.relaunchWithTwoAuth();
        }
      }

      this.saveUserBotConfig();
    } catch (err) {
      console.error("Error during initialization:", err);
    } finally {
      process.exit(0);
    }
  }

  /**
   * Saves the user bot configuration to a JSON file.
   *
   * @remarks
   * Writes the current configuration to a file named `user_bot.json` in the authentication directory.
   *
   * // EN: Saves the user bot configuration to a JSON file.
   * // FR: Enregistre la configuration du bot utilisateur dans un fichier JSON.
   */
  private saveUserBotConfig() {
    const configPath = path.join(dir.auth, "user_bot.json");

    // Assurez-vous que le répertoire existe avant d'écrire le fichier
    if (!fs.existsSync(dir.auth)) {
      fs.mkdirSync(dir.auth, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2), "utf-8");
    console.log(`Configuration saved to ${configPath}`);
  }

  /**
   * Handles the Two-Factor Authentication (2FA) process by requesting a code from the user and verifying it.
   *
   * @remarks
   * Prompts the user to enter their 2FA code, sends a request to verify the code, and updates the configuration with the new 2FA token.
   * Throws an error if verification fails or if required cookies are not present in the response.
   *
   * // EN: Handles the 2FA process by verifying the provided code.
   * // FR: Gère le processus de 2FA en vérifiant le code fourni par l'utilisateur.
   */
  private async code() {
    const code = await waitForUserInput(
      `Please enter your 2FA code (${this.config.codetype}) and press Enter:`
    );
    try {
      const response = await axios.post(
        urls.api.auth.twofa.replace("{{method_twofa}}", this.config.codetype),
        { code },
        {
          headers: {
            "Content-Type": "application/json",
            Cookie: `auth=${this.config.auth}`,
            "User-Agent": env.userAgent,
          },
        }
      );

      const json = response.data;
      if (json.error || !json.verified) {
        throw new Error(json.error?.message || "Not verified");
      }

      const setCookie = response.headers["set-cookie"];
      if (setCookie) {
        this.config.twofa = setCookie
          .find((cookie: string) => cookie.startsWith("twoFactorAuth="))
          ?.split(";")[0]
          .split("=")[1];
      } else {
        throw new Error("Cookie 'set-cookie' not present in the response.");
      }

      this.config.code = code;
      console.log("Successfully connected!");
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Error verifying 2FA code:", error.message);
        if (error.response) {
          const responseData = JSON.stringify(error.response.data, null, 2);
          console.error(
            `API responded with status ${
              error.response.status ?? "Unknown status"
            } and data: ${responseData ?? "No data"}`
          );
        } else {
          console.error("No response data available.");
        }
      } else {
        console.error("Error verifying 2FA code:", error);
      }
    }
  }

  /**
   * Handles the initial authentication process by requesting a password and nickname, and saving the auth token.
   *
   * @remarks
   * Requests the user to provide their password and nickname, sends a login request, and updates the configuration with
   * the authentication token and other details. Handles both successful and unsuccessful login attempts, including
   * cases requiring 2FA.
   *
   * // EN: Handles the initial authentication process, including password and nickname input.
   * // FR: Gère le processus d'authentification initial, y compris la saisie du mot de passe et du surnom.
   */
  private async auth() {
    const password: string =
      process.env.PASSWORD ||
      (await waitForUserInput(
        "Password not found in environment. Please enter your password: "
      ));
    const nickname: string =
      process.env.NICKNAME ||
      (await waitForUserInput(
        "Nickname not found in environment. Please enter your nickname: "
      ));

    if (!password || !nickname) {
      throw new Error("Password or Nickname is required but not provided.");
    }

    console.log("Attempting to connect...");

    try {
      const response = await axios.get(urls.api.auth.login, {
        headers: {
          "User-Agent": env.userAgent,
          Authorization: `Basic ${Buffer.from(
            nickname + ":" + password
          ).toString("base64")}`,
        },
      });

      const json = response.data;
      if (json.error) throw new Error(json.error.message);

      const setCookie = response.headers["set-cookie"];
      if (setCookie) {
        this.config = {
          nickname,
          password,
          auth: setCookie
            .find((cookie: string) => cookie.startsWith("auth="))
            ?.split(";")[0]
            .split("=")[1],
          codetype: json.requiresTwoFactorAuth[0]?.toLowerCase() || "emailotp",
          code: null,
          twofa: null,
        };
      } else {
        throw new Error("Cookie 'set-cookie' not present in the response.");
      }

      if (json.requiresTwoFactorAuth) {
        console.log("Please verify your 2FA code.");
      } else {
        console.log("Connected.");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Error during initial authentication:", error.message);
        if (error.response) {
          const responseData = JSON.stringify(error.response.data, null, 2);
          console.error(
            `API responded with status ${
              error.response.status ?? "Unknown status"
            } and data: ${responseData ?? "No data"}`
          );
        } else {
          console.error("No response data available.");
        }
      } else {
        console.error("Error during initial authentication:", error);
      }
    }
  }

  /**
   * Relaunches the script with the `--twoauth` flag to handle Two-Factor Authentication.
   *
   * @remarks
   * Restarts the script with the `--twoauth` argument, which triggers the 2FA process.
   *
   * // EN: Restarts the script with the --twoauth flag to handle 2FA.
   * // FR: Redémarre le script avec l'argument --twoauth pour gérer la 2FA.
   */
  private relaunchWithTwoAuth() {
    console.log("Restarting the script with --twoauth...");
    const args = process.argv.slice(1).concat("--twoauth");
    spawn("node", args, { stdio: "inherit" });
  }
}

// Ensure the authentication directory exists
// Assurer que le répertoire d'authentification existe
checkDir("auth");

// Initialize the Auth class
// Initialiser la classe Auth
new Auth();
