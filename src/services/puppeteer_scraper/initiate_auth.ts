import puppeteer from "puppeteer";
import { config } from "dotenv";
import { Base64 } from "js-base64";
import { cfg, dir, urls, selector, env } from "../../libs/config";
import { waitForUserInput } from "../../libs/user_action";
import { wait } from "../../libs/times_wait";
import { checkDir } from "../../libs/check_requirements";
import fs from "fs";
import path from "path";

// Load environment variables
// Charger les variables d'environnement
config();

// Create the auth directory if it does not exist
// Créer le répertoire d'auth si nécessaire
checkDir("auth");

/**
 * Function to encode the login credentials in Base64.
 *
 * @param nickname - The user's nickname.
 * @param password - The user's password.
 * @returns The Base64 encoded credentials.
 *
 * // EN: Encodes the user's nickname and password into a Base64 string after URI encoding them.
 * // FR: Encode le nom d'utilisateur et le mot de passe en une chaîne Base64 après les avoir encodés en URI.
 */
function encodeLogin(nickname: string, password: string): string {
  // URI encode the username and password, then join them with a colon
  // Encoder en URI le nom d'utilisateur et le mot de passe, puis les joindre avec un deux-points
  const encodedCredentials = `${encodeURIComponent(
    nickname
  )}:${encodeURIComponent(password)}`;

  // Base64 encode the joined string
  // Encoder en Base64 la chaîne jointe
  return Base64.encode(encodedCredentials);
}

(async (): Promise<void> => {
  // Define environment variables
  // Définir les variables d'environnement
  const password: string =
    process.env.PASSWORD ||
    (await waitForUserInput(
      "Password not found in environment. Please enter your password: "
    ));

  // Ensure that env.password is defined before use
  // Assurer que env.password est défini avant utilisation
  if (!password) {
    throw new Error("Password is required but not provided.");
  }

  // Encode the login credentials
  // Encoder les identifiants de connexion
  const encodedLogin = encodeLogin(env.nickname, password);

  // Define the path to save the requirements.json file
  // Définir le chemin pour enregistrer le fichier requirements.json
  const requirementsFilePath = path.join(dir.auth, "requirements.json");

  // Create the data object to save in the JSON file
  // Créer l'objet de données à enregistrer dans le fichier JSON
  const data = {
    encoded_login: encodedLogin,
  };

  // Write the encoded login information to the JSON file
  // Écrire les informations de connexion encodées dans le fichier JSON
  fs.writeFileSync(requirementsFilePath, JSON.stringify(data, null, 2));
  console.log(
    `Encoded login information saved to ${requirementsFilePath} for future use (Thanks, VRChat API...).`
  );

  // Launch Puppeteer browser instance
  // Lancer l'instance de navigateur Puppeteer
  const browser = await puppeteer.launch({
    headless: cfg.browser.headless,
    args: [`--window-size=${cfg.browser.width},${cfg.browser.height}`],
    defaultViewport: {
      width: cfg.browser.width,
      height: cfg.browser.height,
    },
  });

  const page = await browser.newPage();
  const navigationTimeout: number = 60000;

  try {
    await page.setDefaultNavigationTimeout(navigationTimeout);

    // Navigate to the login page
    // Naviguer vers la page de connexion
    const response = await page.goto(urls.login, { waitUntil: "networkidle2" });
    console.log("Request status: ", response?.status());
    // Statut de la requête

    // Wait for and accept the privacy policy
    // Attendre et accepter la politique de confidentialité
    await page.waitForSelector(selector.button.privacy, {
      timeout: navigationTimeout,
    });
    await page.evaluate((selector: string) => {
      const button = document.querySelector<HTMLElement>(selector);
      button?.click();
    }, selector.button.privacy);
    console.log("Privacy button clicked.");
    // Bouton de confidentialité cliqué

    // Wait for username and password fields to be visible
    // Attendre que les champs d'entrée du nom d'utilisateur et du mot de passe soient visibles
    await page.waitForSelector(selector.field.username, {
      timeout: navigationTimeout,
    });
    await page.waitForSelector(selector.field.password, {
      timeout: navigationTimeout,
    });

    console.log("Logging in...");
    // Connexion...
    await page.type(selector.field.username, env.nickname, { delay: 100 });
    await page.type(selector.field.password, password, { delay: 100 });

    // Click the login button
    // Cliquer sur le bouton de connexion
    await page.click(selector.button.login);
    console.log("Login button clicked. Waiting for 2FA page...");
    // Bouton de connexion cliqué. Attente de la page 2FA...

    // Wait for navigation to 2FA page
    // Attendre la navigation vers la page 2FA
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    // Check if we navigated to the 2FA page
    // Vérifier si nous avons navigué vers la page 2FA
    if (page.url() !== urls.twoFA) {
      throw new Error("Failed to navigate to the 2FA page");
      // Échec de la navigation vers la page 2FA
    }
    console.log("Navigated to the 2FA page.");
    // Navigué vers la page 2FA

    // Wait for the 2FA input field to be visible
    // Attendre que le champ d'entrée 2FA soit visible
    await page.waitForSelector(selector.field.twoFA, {
      timeout: navigationTimeout,
    });

    // Prompt user to enter 2FA code
    // Demander à l'utilisateur de saisir le code 2FA
    const twoFA = await waitForUserInput(
      "Please enter your 2FA code and press Enter: "
    );

    // Verify the number of input fields matches the length of the 2FA code
    // Vérifier que le nombre de champs d'entrée correspond à la longueur du code 2FA
    const inputFields = await page.$$(selector.field.twoFA);
    if (inputFields.length !== twoFA.length) {
      throw new Error(
        "The number of 2FA input fields does not match the code length."
        // Le nombre de champs d'entrée 2FA ne correspond pas à la longueur du code
      );
    }

    // Enter the 2FA code into the input fields
    // Saisir le code 2FA dans les champs d'entrée
    for (let i = 0; i < inputFields.length; i++) {
      await inputFields[i].type(twoFA[i], { delay: 100 });
    }
    console.log("2FA code entered.");
    // Code 2FA entré

    // Wait for the 2FA button to be enabled and visible
    // Attendre que le bouton 2FA soit activé et visible
    await page.waitForFunction(
      (selector: string) => {
        const button = document.querySelector(selector) as HTMLButtonElement;
        return button && !button.disabled && button.offsetParent !== null;
      },
      { timeout: navigationTimeout },
      selector.button.next2FA
    );

    // Wait a short delay before clicking the 2FA button
    // Attendre un court délai avant de cliquer sur le bouton 2FA
    await wait(500);

    // Click the 2FA button
    // Cliquer sur le bouton 2FA
    await page.evaluate((selector: string) => {
      const button = document.querySelector<HTMLElement>(selector);
      button?.click();
    }, selector.button.next2FA);
    console.log("2FA button clicked.");
    // Bouton 2FA cliqué

    // Wait for a successful 2FA authentication and navigation to the profile page
    // Attendre une authentification 2FA réussie et la navigation vers la page de profil
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    // Filter the cookies to keep only those related to authentication
    // Filtrer les cookies pour conserver uniquement ceux relatifs à l'authentification
    const cookies = (await page.cookies()).filter((cookie) =>
      ["auth", "twoFactorAuth"].some((term) => cookie.name.includes(term))
    );

    // Extract the relevant local storage data
    // Extraire les données locales pertinentes
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

    // Save the filtered cookies to a JSON file
    // Enregistrer les cookies filtrés dans un fichier JSON
    fs.writeFileSync(
      path.join(dir.auth, `cookies.json`),
      JSON.stringify(cookies, null, 2)
    );

    // Save the filtered local storage data to a JSON file
    // Enregistrer les données locales filtrées dans un fichier JSON
    fs.writeFileSync(
      path.join(dir.auth, `storage.json`),
      JSON.stringify(localStorageData, null, 2)
    );

    console.log("Filtered cookies and storage data saved successfully.");
    // Cookies filtrés et données locales enregistrées avec succès
  } catch (error) {
    console.error("An error occurred:", error);
    // Une erreur est survenue
  } finally {
    // Close the browser, whether the process was successful or not
    // Fermer le navigateur, que le processus ait réussi ou non
    await browser.close();
  }
})();
