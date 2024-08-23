import puppeteer, { Page } from "puppeteer";
import { config } from "dotenv";
import { cfg, dir, urls, selector, env } from "../../libs/config";
import { waitForUserInput } from "../../libs/user_action";
import { checkDir } from "../../libs/check_requirements";
import {
  checkIfMidnight,
  formatTime,
  wait,
  waitForLoadingToDisappear,
  waitTime,
} from "../../libs/times_wait";
import fs from "fs";
import path from "path";

// Load environment variables
// Charger les variables d'environnement
config();

// Types for data
// Types pour les données
interface WorldData {
  title: string;
  image: string;
  online_players: string;
  favorites: string;
  last_updated: string;
  open_world_page: string;
  platform: {
    windows: boolean;
    android: boolean;
  };
}

interface UserData {
  manual: {
    user_rank: string;
    last_login: string;
    user_status: string;
  };
  api: Record<string, unknown>;
}

interface GroupsData {
  represented: Record<string, unknown>;
  list: Record<string, unknown>;
}

interface Data {
  user: UserData;
  worlds: WorldData[];
  groups: GroupsData;
}

// Create the data directory if it does not exist
// Créer le répertoire de données si nécessaire
checkDir("user");

/**
 * Function to fetch JSON data from a URL.
 *
 * @param page - The Puppeteer Page object.
 * @param url - The URL to fetch data from.
 * @returns The JSON data fetched from the URL.
 *
 * // EN: Fetches JSON data from a specified URL by navigating the page and extracting the content.
 * // FR: Récupère les données JSON depuis une URL spécifiée en naviguant sur la page et en extrayant le contenu.
 */
async function fetchJsonFromUrl(page: Page, url: string): Promise<any> {
  try {
    // Navigate to the URL and wait until network is idle
    // Naviguer vers l'URL et attendre que le réseau soit inactif
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extract the JSON content from the page
    // Extraire le contenu JSON de la page
    const content = await page.evaluate(
      () => document.querySelector("body")?.innerText || ""
    );
    console.log(`Successfully fetched ${url} data.`);
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return null;
  }
}

/**
 * Function to save data.
 *
 * @param page - The Puppeteer Page object.
 * @param url - The base URL for API requests.
 * @param dataDir - The directory to save the data.
 * @param user_id - The user ID for API requests.
 *
 * @returns A promise that resolves when the data is saved.
 *
 * // EN: Scrapes data from the page, fetches additional data from APIs, and saves all data to JSON files.
 * // FR: Extrait les données de la page, récupère des données supplémentaires depuis les API, et sauvegarde toutes les données dans des fichiers JSON.
 */
async function saveData(
  page: Page,
  url: string,
  dataDir: string,
  user_id: string
): Promise<void> {
  // Initialize the data object
  // Initialiser l'objet de données
  const data: Data = {
    user: {
      manual: { user_rank: "", last_login: "", user_status: "" },
      api: {},
    },
    worlds: [],
    groups: { represented: {}, list: {} },
  };

  try {
    console.log("Starting data scraping...");
    // Démarrage de l'extraction des données

    // Wait for the necessary elements to be visible before scraping
    // Attendre que les éléments nécessaires soient visibles avant l'extraction
    await page.waitForSelector('div[title="User Rank"]', { visible: true });
    await page.waitForSelector('div[title^="Last online"]', { visible: true });

    // Extract user rank
    // Extraire le rang de l'utilisateur
    data.user.manual.user_rank = await page.$eval(
      'div[title="User Rank"]',
      (el: HTMLElement) => el.textContent?.trim() || ""
    );
    console.log("User rank scraped:", data.user.manual.user_rank);

    // Extract last login
    // Extraire la dernière connexion
    data.user.manual.last_login = await page.$eval(
      'div[title^="Last online"]',
      (el: HTMLElement) => el.textContent?.trim() || ""
    );
    console.log("Last login scraped:", data.user.manual.last_login);

    // Extract user status
    // Extraire le statut de l'utilisateur
    data.user.manual.user_status = await page.$eval(
      'div[role="note"][aria-label^="User Status: "]',
      (el: HTMLElement) =>
        el.getAttribute("aria-label")?.replace("User Status: ", "").trim() || ""
    );
    console.log("User Status scraped:", data.user.manual.user_status);

    // Extract world data from the page
    // Extraire les données des mondes depuis la page
    const worldElements = await page.$$(
      'div[data-scrollkey^="wrld_"][aria-label="World Card"]'
    );
    for (const worldElement of worldElements) {
      const worldData: WorldData = {
        title: await worldElement.$eval(
          'a[aria-label="Open World Page"] h4',
          (el: HTMLElement) => el.textContent?.trim() || ""
        ),
        image: await worldElement.$eval(
          'a[aria-label="World Image"] img',
          (el: HTMLImageElement) => el.src || ""
        ),
        online_players: await worldElement.$eval(
          'div[title="Online Players"]',
          (el: HTMLElement) => el.textContent?.trim() || ""
        ),
        favorites: await worldElement.$eval(
          'div[title="Favorites"]',
          (el: HTMLElement) => el.textContent?.trim() || ""
        ),
        last_updated: await worldElement.$eval(
          'div[title="Updated"]',
          (el: HTMLElement) => el.textContent?.trim() || ""
        ),
        open_world_page: await worldElement.$eval(
          'a[aria-label="Open World Page"]',
          (el: HTMLAnchorElement) => el.href || ""
        ),
        platform: {
          windows:
            (await worldElement.$eval(
              'a[aria-label="World Image"] div div[role="note"][title="Is a PC World"]',
              (el: HTMLElement) => el !== null
            )) || false,
          android:
            (await worldElement.$eval(
              'a[aria-label="World Image"] div div[role="note"][title="Is a Quest World"]',
              (el: HTMLElement) => el !== null
            )) || false,
        },
      };
      data.worlds.push(worldData);
      console.log("World data scraped:", worldData);
    }

    // Fetch API data for user and groups
    // Récupérer les données de l'API pour l'utilisateur et les groupes
    const apiUserUrl = `${url}/${user_id}`;
    const apiRepresentedGroupUrl = `${apiUserUrl}/groups/represented`;

    console.log("Fetching JSON data from API...");
    data.user.api = await fetchJsonFromUrl(page, apiUserUrl);
    data.groups.represented = await fetchJsonFromUrl(
      page,
      apiRepresentedGroupUrl
    );

    // Save the fetched data to JSON files
    // Sauvegarder les données récupérées dans des fichiers JSON
    fs.writeFileSync(
      path.join(dataDir, `old_method/user_data.json`),
      JSON.stringify(data.user, null, 2)
    );
    fs.writeFileSync(
      path.join(dataDir, `old_method/worlds_data.json`),
      JSON.stringify(data.worlds, null, 2)
    );
    fs.writeFileSync(
      path.join(dataDir, `old_method/groupsRepresented_data.json`),
      JSON.stringify(data.groups.represented, null, 2)
    );

    // If it is midnight, fetch the list of groups from the API
    // Si c'est minuit, récupérer la liste des groupes depuis l'API
    if (await checkIfMidnight()) {
      console.log("Fetching list of groups from API...");
      const apiGroupsUrl = `${apiUserUrl}/groups`;
      data.groups.list = await fetchJsonFromUrl(page, apiGroupsUrl);
      fs.writeFileSync(
        path.join(dataDir, `old_method/groupsList_data.json`),
        JSON.stringify(data.groups.list, null, 2)
      );
    } else {
      console.log("Not midnight. Skipping groups list fetch.");
    }

    console.log("Data saved successfully.");
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// Main script
(async () => {
  // Define environment variables
  // Définir les variables d'environnement
  const password =
    process.env.PASSWORD ||
    (await waitForUserInput(
      "Password not found in environment. Please enter your password: "
    ));

  // Ensure that env.password is defined before use
  // Assurer que env.password est défini avant utilisation
  if (!password) {
    throw new Error("Password is required but not provided.");
  }

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
  const navigationTimeout = 60000;

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
      );
      // Le nombre de champs d'entrée 2FA ne correspond pas à la longueur du code
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

    // Wait for navigation to profile page
    // Attendre la navigation vers la page de profil
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });

    // Navigate to the user's profile page
    // Naviguer vers la page de profil de l'utilisateur
    await page.goto(urls.profile, {
      waitUntil: "networkidle2",
      timeout: navigationTimeout,
    });
    console.log("Navigated to user page.");
    // Navigué vers la page utilisateur

    while (true) {
      // Wait for loading div to disappear
      // Attendre que le div de chargement disparaisse
      await waitForLoadingToDisappear(page);
      await wait(20000); // Wait 20 seconds before taking a screenshot

      // Take and save a screenshot of the profile page
      // Prendre et sauvegarder une capture d'écran de la page de profil
      const screenshotPath = path.join(dir.user, "screenshot.png");
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(
        `Latest profile screenshot taken and saved to ${screenshotPath}.`
      );
      // Dernière capture d'écran du profil prise et sauvegardée

      // Save the data to JSON files
      // Sauvegarder les données dans des fichiers JSON
      await saveData(page, urls.api.users, dir.user, env.user_id);
      console.log("Data saved.");
      // Données sauvegardées

      // Wait for a random time between 1 and 2 hours before the next run
      // Attendre un temps aléatoire entre 1 et 2 heures avant la prochaine exécution
      console.log(`Waiting for ${formatTime(waitTime)} before the next run...`);
      await wait(waitTime);

      // Navigate to the user's profile page again
      // Naviguer à nouveau vers la page de profil de l'utilisateur
      await page.goto(urls.profile, {
        waitUntil: "networkidle2",
        timeout: navigationTimeout,
      });
      console.log("Navigated to user page.");
      // Navigué vers la page utilisateur
    }
  } catch (error) {
    console.error("An error occurred:", error);
    // Une erreur s'est produite
  } finally {
    // Close the browser
    // Fermer le navigateur
    await browser.close();
  }
})();
