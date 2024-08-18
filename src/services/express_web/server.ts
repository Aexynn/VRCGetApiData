import express, { Request, Response } from "express";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
// Charger les variables d'environnement
config();

// Define configuration variables and data folder path
// Définir les variables de configuration et le chemin du dossier de données
const cfg = {
  redirect404: "https://github.com/Kyuddle/VRCScraperUserData",
  data_folder: "data",
  // Define error message for server issues
  // Définir le message d'erreur pour les problèmes de serveur
  errorServer:
    '{"error": "An internal server error has occurred. Please try again later."}',
};

// Define environment variables
// Définir les variables d'environnement
const env = {
  user_id: process.env.USER_ID!,
  data: "data",
};

// Ensure USER_ID environment variable is set
// S'assurer que la variable d'environnement USER_ID est définie
if (!env.user_id) {
  throw new Error("Environment variable USER_ID must be set");
}

// Initialize Express app
// Initialiser l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'data' folder
// Servir les fichiers statiques depuis le dossier 'data'
app.use(express.static(path.join(__dirname, env.data)));

// Route to get user data
// Route pour obtenir les données utilisateur
app.get("/api/users", (req: Request, res: Response) => {
  fs.readFile(
    path.join(env.data, env.user_id, "user_data.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        return res.status(500).json(cfg.errorServer);
      }
      try {
        res.set("Content-Type", "application/json");
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (parseError) {
        console.error("Error parsing JSON file:", parseError);
        res.status(500).json(cfg.errorServer);
      }
    }
  );
});

// Route to get worlds data
// Route pour obtenir les données des mondes
app.get("/api/users/worlds", (req: Request, res: Response) => {
  fs.readFile(
    path.join(env.data, env.user_id, "worlds_data.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        return res.status(500).json(cfg.errorServer);
      }
      try {
        res.set("Content-Type", "application/json");
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (parseError) {
        console.error("Error parsing JSON file:", parseError);
        res.status(500).json(cfg.errorServer);
      }
    }
  );
});

// Route to get groups list
// Route pour obtenir la liste des groupes
app.get("/api/users/groups", (req: Request, res: Response) => {
  fs.readFile(
    path.join(env.data, env.user_id, "groupsList_data.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        return res.status(500).json(cfg.errorServer);
      }
      try {
        res.set("Content-Type", "application/json");
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (parseError) {
        console.error("Error parsing JSON file:", parseError);
        res.status(500).json(cfg.errorServer);
      }
    }
  );
});

// Route to get represented groups data
// Route pour obtenir les données des groupes représentés
app.get("/api/users/groups/represented", (req: Request, res: Response) => {
  fs.readFile(
    path.join(env.data, env.user_id, "groupsRepresented_data.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        return res.status(500).json(cfg.errorServer);
      }
      try {
        res.set("Content-Type", "application/json");
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (parseError) {
        console.error("Error parsing JSON file:", parseError);
        res.status(500).json(cfg.errorServer);
      }
    }
  );
});

// Route to get screenshot
// Route pour obtenir la capture d'écran
app.get("/api/users/screenshot", (req: Request, res: Response) => {
  fs.readFile(
    path.join(env.data, env.user_id, "screenshot.png"),
    (err, data) => {
      if (err) {
        console.error("Error reading screenshot file:", err);
        return res.status(500).json(cfg.errorServer);
      }

      res.set("Content-Type", "image/png");
      res.send(data);
    }
  );
});

// Handle 404 - Not Found
// Gérer les erreurs 404 - Non trouvé
app.use((req: Request, res: Response) => {
  res.status(404).redirect(cfg.redirect404);
});

// Handle 500 - Internal Server Error
// Gérer les erreurs 500 - Erreur interne du serveur
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json(cfg.errorServer);
});

// Start the server
// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
