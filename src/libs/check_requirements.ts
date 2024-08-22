import { dir } from "./config";
import fs from "fs";

export function checkDir(target: string) {
  switch (target) {
    case "auth":
      // Create the auth directory if it does not exist
      // Créer le répertoire d'auth si nécessaire
      if (!fs.existsSync(dir.auth)) {
        console.log(`Creating directory: ${dir.auth}`);
        fs.mkdirSync(dir.auth, { recursive: true });
      }
      break;
    case "user":
      // Create the data directory if it does not exist
      // Créer le répertoire de données si nécessaire
      if (!fs.existsSync(dir.user)) {
        console.log(`Creating directory: ${dir.user}`);
        fs.mkdirSync(dir.user, { recursive: true });
      }
      break;
    default:
      throw Error("checkDir need a target.");
  }
}
