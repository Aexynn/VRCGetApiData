import fs from "fs";
import path from "path";
import axios from "axios";
import { cfg, dir, env, isDev, urls } from "../../libs/config";
import { checkDir } from "../../libs/check_requirements";
import { isAxiosError, isErrorWithMessage } from "../../libs/errors";

export async function _initiateAuth(): Promise<void> {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const check = args.includes("--check");
  const isAuth = force ? false : checkDir("auth") || checkDir("auth");

  if (check) {
    console.log(
      checkDir("auth")
        ? "[Infos] You have all the data you need to connect to the VRChat API and continue processing commands."
        : `[Infos] You don't have the necessary data for authentication, please use the command: ${
            isDev ? "api:auth" : "dist/api:auth"
          }`
    );
    process.exit(0);
  } else {
    if (!isAuth) {
      /**
       * Create the auth directory if it does not exist.
       *
       * @remarks
       * Calls the `checkDir` function to ensure the auth directory exists.
       *
       * // EN: Ensures that the auth directory exists by calling the `checkDir` function.
       * // FR: Assure que le répertoire utilisateur existe en appelant la fonction `checkDir`.
       */
      checkDir("auth");

      /**
       * Save user information to a JSON file.
       *
       * @param authInfos The user information to save.
       *
       * // EN: Saves the provided user information to a JSON file.
       * // FR: Enregistre les informations utilisateur fournies dans un fichier JSON.
       */
      function saveAuthInfosToFile(authInfos: any): void {
        const authDir = dir.auth;

        // Ensure the user directory exists
        // S'assurer que le répertoire utilisateur existe
        try {
          if (!fs.existsSync(authDir)) {
            fs.mkdirSync(authDir, { recursive: true });
          }

          // Define the file path for saving user information
          // Définir le chemin du fichier pour enregistrer les informations utilisateur
          const filePath = path.join(authDir, "auth_infos.json");

          // Write the user information to the file
          // Écrire les informations utilisateur dans le fichier
          fs.writeFileSync(filePath, JSON.stringify(authInfos, null, 2));
          console.log(`Auth infos saved to ${filePath}`);
        } catch (error) {
          if (isErrorWithMessage(error)) {
            console.error(
              `Failed to save auth infos to file ${path.join(
                authDir,
                "auth_infos.json"
              )}: ${error.message}`
            );
          } else {
            console.error(
              `Failed to save auth infos to file ${path.join(
                authDir,
                "auth_infos.json"
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
      async function authUserInfos(): Promise<void> {
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
          saveAuthInfosToFile(response.data);

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

      authUserInfos();
    } else {
      console.log(
        `[Infos] You are already logged in. To force re-authentication, use the command npm run ${
          isDev ? "api:auth:force" : "dist/api:auth:force"
        }.`
      );
      process.exit(0);
    }
  }
}

_initiateAuth();
