import { dir } from "./config";
import { isErrorWithMessage } from "./errors";
import fs from "fs";
import path from "path";

/**
 * Checks and creates directories as needed, and validates required JSON files.
 *
 * @param target The target directory to check or create.
 *               Possible values are "auth" and "user".
 *
 * // EN: This function creates the necessary directories and ensures that required JSON files exist and are valid.
 * // FR: Cette fonction crée les répertoires nécessaires et vérifie que les fichiers JSON requis existent et sont valides.
 */
export function checkDir(target: string) {
  switch (target) {
    case "auth":
      // Create the auth directory if it does not exist
      // EN: If the 'auth' directory does not exist, create it.
      // FR: Si le répertoire 'auth' n'existe pas, créez-le.
      if (!fs.existsSync(dir.auth)) {
        console.log(`Creating directory: ${dir.auth}`);
        fs.mkdirSync(dir.auth, { recursive: true });
      }

      // Define required JSON files
      // EN: List of required JSON files in the 'auth' directory.
      // FR: Liste des fichiers JSON requis dans le répertoire 'auth'.
      const requiredFiles = [
        "cookies.json",
        "requirements.json",
        "storage.json",
      ];

      // Check if all required JSON files exist
      // EN: Check if each required JSON file exists and log a message if missing.
      // FR: Vérifiez si chaque fichier JSON requis existe et affichez un message s'il est manquant.
      requiredFiles.forEach((file) => {
        const filePath = path.join(dir.auth, file);
        if (!fs.existsSync(filePath)) {
          console.error(`Missing file: ${filePath}`);
        }
      });

      // Load and validate the required files
      // EN: Load and validate the contents of the required JSON files.
      // FR: Chargez et validez le contenu des fichiers JSON requis.
      try {
        // Define file paths
        // EN: Paths to the required JSON files.
        // FR: Chemins vers les fichiers JSON requis.
        const requirementsFilePath = path.join(dir.auth, "requirements.json");
        const cookiesFilePath = path.join(dir.auth, "cookies.json");
        const storageFilePath = path.join(dir.auth, "storage.json");

        // Function to read and parse a JSON file
        // EN: Reads and parses a JSON file.
        // FR: Lit et analyse un fichier JSON.
        const loadJSON = (filePath: string) => {
          if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, "utf-8");
            return JSON.parse(data);
          }
          return null;
        };

        // Load the JSON files
        // EN: Load data from the JSON files.
        // FR: Charge les données des fichiers JSON.
        const requirements = loadJSON(requirementsFilePath);
        const cookies = loadJSON(cookiesFilePath);
        const storage = loadJSON(storageFilePath);

        // Check if requirements and cookies have content
        // EN: Ensure that 'requirements.json' and 'cookies.json' contain data.
        // FR: Assurez-vous que 'requirements.json' et 'cookies.json' contiennent des données.
        if (!requirements || Object.keys(requirements).length === 0) {
          throw new Error(
            "Requirements file is missing or empty. Please run the appropriate command."
          );
        }

        if (!cookies || Object.keys(cookies).length === 0) {
          throw new Error(
            "Cookies file is missing or empty. Please run the appropriate command."
          );
        }

        if (!storage) {
          console.log(
            "Storage file is empty or missing. Proceeding without it."
          );
        }
      } catch (error) {
        if (isErrorWithMessage(error)) {
          // Handle errors and provide instructions
          // EN: Handle errors and provide instructions for running the appropriate command.
          // FR: Gérez les erreurs et fournissez des instructions pour exécuter la commande appropriée.
          console.error(error.message);
          // Provide instructions based on environment
          // EN: Determine the command to run based on the environment (development or production).
          // FR: Déterminez la commande à exécuter en fonction de l'environnement (développement ou production).
          const isDev = process.env.NODE_ENV === "development";
          const command = isDev ? "scrape:auth" : "dist/scrape:auth";
          console.error(
            `Error in auth directory. Please run the command: ${command}`
          );
          return false;
        }
      }

      return true;
    case "user":
      // Create the user directory if it does not exist
      // EN: If the 'users' directory does not exist, create it.
      // FR: Si le répertoire 'users' n'existe pas, créez-le.
      if (!fs.existsSync(dir.user)) {
        console.log(`Creating directory: ${dir.user}`);
        fs.mkdirSync(dir.user, { recursive: true });
      }
      break;

    case "group":
      // Create the group directory if it does not exist
      // EN: If the 'groups' directory does not exist, create it.
      // FR: Si le répertoire 'groups' n'existe pas, créez-le.
      if (!fs.existsSync(dir.groups)) {
        console.log(`Creating directory: ${dir.groups}`);
        fs.mkdirSync(dir.groups, { recursive: true });
      }
      break;

    default:
      // Throw an error if the target is not recognized
      // EN: Throw an error if the provided target is not valid.
      // FR: Lancez une erreur si la cible fournie n'est pas valide.
      throw new Error("checkDir needs a valid target.");
  }
}
