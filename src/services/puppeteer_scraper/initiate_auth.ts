import puppeteer from "puppeteer";
import { config } from "dotenv";
import { Base64 } from "js-base64";
import { cfg, dir, urls, selector, env } from "../../libs/config";
import { waitForUserInput } from "../../libs/user_action";
import { wait } from "../../libs/times_wait";
import { areAuthFilesValid, checkDir } from "../../libs/check_requirements";
import fs from "fs";
import path from "path";

// Load environment variables
config(); // EN: Load environment variables from a .env file.
// FR: Charger les variables d'environnement depuis un fichier .env.

// Create the auth directory if it does not exist
checkDir("auth"); // EN: Ensure the "auth" directory exists; create it if necessary.
// FR: S'assurer que le répertoire "auth" existe; le créer si nécessaire.

// Parse command-line arguments
const args = process.argv.slice(2);
const force = args.includes("--force"); // EN: Check if the script was run with the "--force" argument.
// FR: Vérifier si le script a été lancé avec l'argument "--force".

// EN: If the auth files are valid and the "--force" flag is not used, skip the login process.
// FR: Si les fichiers d'authentification sont valides et que le drapeau "--force" n'est pas utilisé, sauter le processus de connexion.
if (!force && areAuthFilesValid()) {
  console.log("Auth files are valid. Skipping login process.");
  process.exit(0);
}

/**
 * Encode login credentials in Base64.
 *
 * @param nickname The user's nickname.
 * @param password The user's password.
 * @returns A Base64 encoded string of the login credentials.
 *
 * // EN: Encodes the login credentials (nickname and password) in Base64 format.
 * // FR: Encode les informations de connexion (pseudo et mot de passe) au format Base64.
 */
function encodeLogin(nickname: string, password: string): string {
  const encodedCredentials = `${encodeURIComponent(
    nickname
  )}:${encodeURIComponent(password)}`;
  return Base64.encode(encodedCredentials);
}

(async (): Promise<void> => {
  // EN: Retrieve the password from environment variables or prompt the user if not found.
  // FR: Récupérer le mot de passe depuis les variables d'environnement ou demander à l'utilisateur si non trouvé.
  const password: string =
    process.env.PASSWORD ||
    (await waitForUserInput(
      "Password not found in environment. Please enter your password: "
    ));

  if (!password) {
    throw new Error("Password is required but not provided.");
  }

  const encodedLogin = encodeLogin(env.nickname, password);

  const requirementsFilePath = path.join(dir.auth, "requirements.json");

  const data = {
    encoded_login: encodedLogin,
  };

  // EN: Save the encoded login information to a file for future use.
  // FR: Enregistrer les informations de connexion encodées dans un fichier pour une utilisation future.
  fs.writeFileSync(requirementsFilePath, JSON.stringify(data, null, 2));
  console.log(
    `Encoded login information saved to ${requirementsFilePath} for future use (Thanks, VRChat API...).`
  );

  const browser = await puppeteer.launch({
    headless: cfg.browser.headless,
    args: [`--window-size=${cfg.browser.width},${cfg.browser.height}`],
    defaultViewport: {
      width: cfg.browser.width,
      height: cfg.browser.height,
    },
  });

  const page = await browser.newPage();
  const navigationTimeout: number = 60000; // EN: Timeout for navigation in milliseconds.
  // FR: Délai d'attente pour la navigation en millisecondes.

  try {
    await page.setDefaultNavigationTimeout(navigationTimeout);

    const response = await page.goto(urls.login, { waitUntil: "networkidle2" });
    console.log("Request status: ", response?.status());

    // EN: Accept privacy settings if required.
    // FR: Accepter les paramètres de confidentialité si nécessaire.
    await page.waitForSelector(selector.button.privacy, {
      timeout: navigationTimeout,
    });
    await page.evaluate((selector: string) => {
      const button = document.querySelector<HTMLElement>(selector);
      button?.click();
    }, selector.button.privacy);
    console.log("Privacy button clicked.");

    await page.waitForSelector(selector.field.username, {
      timeout: navigationTimeout,
    });
    await page.waitForSelector(selector.field.password, {
      timeout: navigationTimeout,
    });

    console.log("Logging in...");
    await page.type(selector.field.username, env.nickname, { delay: 100 });
    await page.type(selector.field.password, password, { delay: 100 });

    await page.click(selector.button.login);
    console.log("Login button clicked. Waiting for 2FA page...");

    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    if (page.url() !== urls.twoFA) {
      throw new Error("Failed to navigate to the 2FA page");
    }
    console.log("Navigated to the 2FA page.");

    await page.waitForSelector(selector.field.twoFA, {
      timeout: navigationTimeout,
    });

    const twoFA = await waitForUserInput(
      "Please enter your 2FA code and press Enter: "
    );

    const inputFields = await page.$$(selector.field.twoFA);
    if (inputFields.length !== twoFA.length) {
      throw new Error(
        "The number of 2FA input fields does not match the code length."
      );
    }

    for (let i = 0; i < inputFields.length; i++) {
      await inputFields[i].type(twoFA[i], { delay: 100 });
    }
    console.log("2FA code entered.");

    // EN: Wait for the 2FA next button to be enabled and then click it.
    // FR: Attendre que le bouton suivant de la 2FA soit activé puis cliquer dessus.
    await page.waitForFunction(
      (selector: string) => {
        const button = document.querySelector(selector) as HTMLButtonElement;
        return button && !button.disabled && button.offsetParent !== null;
      },
      { timeout: navigationTimeout },
      selector.button.next2FA
    );

    await wait(500); // EN: Small delay before clicking the next button.
    // FR: Petit délai avant de cliquer sur le bouton suivant.

    await page.evaluate((selector: string) => {
      const button = document.querySelector<HTMLElement>(selector);
      button?.click();
    }, selector.button.next2FA);
    console.log("2FA button clicked.");

    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    // EN: Filter and save authentication cookies and local storage data.
    // FR: Filtrer et enregistrer les cookies d'authentification et les données de stockage local.
    const cookies = (await page.cookies()).filter((cookie) =>
      ["auth", "twoFactorAuth"].some((term) => cookie.name.includes(term))
    );

    const localStorageData = await page.evaluate(() => {
      const json: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes("auth") || key.includes("twoFactorAuth"))) {
          json[key] = localStorage.getItem(key);
        }
      }
      return json;
    });

    fs.writeFileSync(
      path.join(dir.auth, `cookies.json`),
      JSON.stringify(cookies, null, 2)
    );

    fs.writeFileSync(
      path.join(dir.auth, `storage.json`),
      JSON.stringify(localStorageData, null, 2)
    );

    console.log("Filtered cookies and storage data saved successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await browser.close(); // EN: Close the browser instance to free up resources.
    // FR: Fermer l'instance du navigateur pour libérer des ressources.
  }
})();
