import fs from "fs";
import path from "path";
import axios from "axios";
import { dir, env, urls } from "../../../libs/config";
import { checkDir } from "../../../libs/check_requirements";
import { isAxiosError, isErrorWithMessage } from "../../../libs/errors";

export async function _getUserInfos(): Promise<void> {
  /**
   * Create the user directory if it does not exist.
   *
   * @remarks
   * Calls the `checkDir` function to ensure the user directory exists.
   *
   * // EN: Ensures that the user directory exists by calling the `checkDir` function.
   * // FR: Assure que le répertoire utilisateur existe en appelant la fonction `checkDir`.
   */
  checkDir("user");

  /**
   * Load JSON data from a file.
   *
   * @param filePath The path to the JSON file to load.
   * @returns The parsed JSON data, or null if the file does not exist or cannot be read.
   *
   * // EN: Reads and parses JSON data from a file, returning null if the file does not exist or an error occurs.
   * // FR: Lit et analyse les données JSON depuis un fichier, renvoyant null si le fichier n'existe pas ou si une erreur se produit.
   */
  function loadJSON(filePath: string): any {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
      } else {
        console.error(`File not found: ${filePath}`);
        return null;
      }
    } catch (error) {
      if (isErrorWithMessage(error)) {
        console.error(
          `Failed to load JSON from file ${filePath}: ${error.message}`
        );
      } else {
        console.error(
          `Failed to load JSON from file ${filePath}: Unknown error`
        );
      }
      return null;
    }
  }

  // Load cookies, requirements and local storage data
  // Charger les cookies, les requis et les données du localStorage
  const requirements = loadJSON(path.join(dir.auth, "requirements.json"));
  const cookies = loadJSON(path.join(dir.auth, "cookies.json"));
  const storage = loadJSON(path.join(dir.auth, "storage.json"));

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
    throw new Error(
      "Requirements are missing or empty. Authentication cannot proceed."
    );
  }

  if (!cookies || Object.keys(cookies).length === 0) {
    throw new Error(
      "Cookies are missing or empty. Authentication cannot proceed."
    );
  }

  if (!storage || Object.keys(storage).length === 0) {
    console.log("Local storage data is empty, proceeding without it.");
  }

  /**
   * Save user information to a JSON file.
   *
   * @param userInfo The user information to save.
   *
   * // EN: Saves the provided user information to a JSON file.
   * // FR: Enregistre les informations utilisateur fournies dans un fichier JSON.
   */
  function saveUserInfoToFile(userInfo: any): void {
    const userDir = dir.user;

    // Ensure the user directory exists
    // S'assurer que le répertoire utilisateur existe
    try {
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Define the file path for saving user information
      // Définir le chemin du fichier pour enregistrer les informations utilisateur
      const filePath = path.join(userDir, "user_infos.json");

      // Write the user information to the file
      // Écrire les informations utilisateur dans le fichier
      fs.writeFileSync(filePath, JSON.stringify(userInfo, null, 2));
      console.log(`User info saved to ${filePath}`);
    } catch (error) {
      if (isErrorWithMessage(error)) {
        console.error(
          `Failed to save user info to file ${path.join(
            userDir,
            "user_infos.json"
          )}: ${error.message}`
        );
      } else {
        console.error(
          `Failed to save user info to file ${path.join(
            userDir,
            "user_infos.json"
          )}: Unknown error`
        );
      }
    }
  }

  /**
   * Make an API request to retrieve user information and save it to a file.
   *
   * @remarks
   * Constructs an API request with the appropriate headers and cookies, retrieves user information, and saves it to a file.
   *
   * // EN: Performs an API request to get user information and saves the result to a file.
   * // FR: Effectue une requête API pour obtenir les informations utilisateur et sauvegarde le résultat dans un fichier.
   */
  async function getUserInfos(): Promise<void> {
    try {
      // Build header
      // Construire l'en-tête
      const headers = {
        Cookie: cookies
          .map((cookie: any) => `${cookie.name}=${cookie.value}`)
          .join("; "),
        "User-Agent": env.userAgent,
        "Accept-Encoding": "gzip, compress, deflate, br",
        Accept: "application/json, text/plain, */*",
      };

      // Set up the request with headers, including cookies
      // Configurer la requête avec les en-têtes, y compris les cookies
      const response = await axios.get(urls.api.users, { headers });

      // Save the retrieved user information to a file
      // Enregistrer les informations utilisateur récupérées dans un fichier
      saveUserInfoToFile(response.data);

      console.log("User info retrieved and saved successfully.");
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(`Failed to retrieve user info: ${error.message}`);
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
        console.error("An unknown error occurred:", error);
      }
    }
  }

  // Execute the function
  // Exécuter la fonction
  getUserInfos();
}

_getUserInfos();
