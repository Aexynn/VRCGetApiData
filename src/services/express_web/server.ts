import express, { Request, Response } from "express";
import { dir, env, cfg } from "../../libs/config";
import fs from "fs";
import path from "path";

/**
 * Ensure USER_ID environment variable is set.
 *
 * @throws {Error} If the USER_ID environment variable is not set.
 *
 * // EN: Verifies that the USER_ID environment variable is defined; throws an error if not.
 * // FR: Vérifie que la variable d'environnement USER_ID est définie ; lance une erreur sinon.
 */
if (!env.user_id) {
  throw new Error("Environment variable USER_ID must be set");
}

// Initialize Express app
// Initialiser l'application Express
const app = express();

/**
 * Serve static files from the 'data' folder.
 *
 * @remarks
 * Configures Express to serve static files from the user directory.
 *
 * // EN: Configures the Express application to serve static files from the specified directory.
 * // FR: Configure l'application Express pour servir des fichiers statiques depuis le répertoire spécifié.
 */
app.use(express.static(path.join(__dirname, dir.user)));

/**
 * Route to get user data.
 *
 * @param req The request object.
 * @param res The response object.
 *
 * // EN: Handles GET requests to retrieve user data from 'user_infos.json' or 'old_method/user_data.json'.
 * // FR: Gère les requêtes GET pour récupérer les données utilisateur depuis 'user_infos.json' ou 'old_method/user_data.json'.
 */
app.get("/api/users", (req: Request, res: Response) => {
  // Define the paths to the JSON files
  const filePath1 = path.join(dir.user, "user_infos.json");
  const filePath2 = path.join(dir.user, "old_method/user_data.json");

  // Check if the first file exists, otherwise check the second file
  fs.access(filePath1, fs.constants.F_OK, (err) => {
    if (!err) {
      // File exists, read it
      fs.readFile(filePath1, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading JSON file:", err);
          return res.status(500).json(cfg.web_api.errorServer);
        }
        try {
          res.set("Content-Type", "application/json");
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (parseError) {
          console.error("Error parsing JSON file:", parseError);
          res.status(500).json(cfg.web_api.errorServer);
        }
      });
    } else {
      // File does not exist, try the second file
      fs.readFile(filePath2, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading JSON file:", err);
          return res.status(500).json(cfg.web_api.errorServer);
        }
        try {
          res.set("Content-Type", "application/json");
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (parseError) {
          console.error("Error parsing JSON file:", parseError);
          res.status(500).json(cfg.web_api.errorServer);
        }
      });
    }
  });
});

/**
 * Route to get groups list.
 *
 * @param req The request object.
 * @param res The response object.
 *
 * // EN: Handles GET requests to retrieve the list of groups from 'user_groups_list.json' or 'old_method/groupsList_data.json'.
 * // FR: Gère les requêtes GET pour récupérer la liste des groupes depuis 'user_groups_list.json' ou 'old_method/groupsList_data.json'.
 */
app.get("/api/users/groups", (req: Request, res: Response) => {
  // Define the paths to the JSON files
  const filePath1 = path.join(dir.user, "user_groups_list.json");
  const filePath2 = path.join(dir.user, "old_method/groupsList_data.json");

  // Check if the first file exists, otherwise check the second file
  fs.access(filePath1, fs.constants.F_OK, (err) => {
    if (!err) {
      // File exists, read it
      fs.readFile(filePath1, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading JSON file:", err);
          return res.status(500).json(cfg.web_api.errorServer);
        }
        try {
          res.set("Content-Type", "application/json");
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (parseError) {
          console.error("Error parsing JSON file:", parseError);
          res.status(500).json(cfg.web_api.errorServer);
        }
      });
    } else {
      // File does not exist, try the second file
      fs.readFile(filePath2, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading JSON file:", err);
          return res.status(500).json(cfg.web_api.errorServer);
        }
        try {
          res.set("Content-Type", "application/json");
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (parseError) {
          console.error("Error parsing JSON file:", parseError);
          res.status(500).json(cfg.web_api.errorServer);
        }
      });
    }
  });
});

/**
 * Route to get represented groups data.
 *
 * @param req The request object.
 * @param res The response object.
 *
 * // EN: Handles GET requests to retrieve data of represented groups from 'user_group_represented.json' or 'old_method/groupsRepresented_data.json'.
 * // FR: Gère les requêtes GET pour récupérer les données des groupes représentés depuis 'user_group_represented.json' ou 'old_method/groupsRepresented_data.json'.
 */
app.get("/api/users/groups/represented", (req: Request, res: Response) => {
  // Define the paths to the JSON files
  const filePath1 = path.join(dir.user, "user_group_represented.json");
  const filePath2 = path.join(
    dir.user,
    "old_method/groupsRepresented_data.json"
  );

  // Check if the first file exists, otherwise check the second file
  fs.access(filePath1, fs.constants.F_OK, (err) => {
    if (!err) {
      // File exists, read it
      fs.readFile(filePath1, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading JSON file:", err);
          return res.status(500).json(cfg.web_api.errorServer);
        }
        try {
          res.set("Content-Type", "application/json");
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (parseError) {
          console.error("Error parsing JSON file:", parseError);
          res.status(500).json(cfg.web_api.errorServer);
        }
      });
    } else {
      // File does not exist, try the second file
      fs.readFile(filePath2, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading JSON file:", err);
          return res.status(500).json(cfg.web_api.errorServer);
        }
        try {
          res.set("Content-Type", "application/json");
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (parseError) {
          console.error("Error parsing JSON file:", parseError);
          res.status(500).json(cfg.web_api.errorServer);
        }
      });
    }
  });
});

if (cfg.activate_group_feature) {
  /**
   * Route to get group data.
   *
   * @param req The request object.
   * @param res The response object.
   *
   * @remarks
   * Handles GET requests to retrieve group data from 'group_infos.json'.
   *
   * // EN: Handles GET requests to retrieve group data from 'group_infos.json'.
   * // FR: Gère les requêtes GET pour récupérer les données du groupe depuis 'group_infos.json'.
   */
  app.get("/api/groups", (req: Request, res: Response) => {
    fs.readFile(
      path.join(dir.groups, "group_infos.json"),
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error reading JSON file:", err);
          return res.status(500).json(cfg.web_api.errorServer);
        }
        try {
          res.set("Content-Type", "application/json");
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (parseError) {
          console.error("Error parsing JSON file:", parseError);
          res.status(500).json(cfg.web_api.errorServer);
        }
      }
    );
  });

  /**
   * Route to get group members data.
   *
   * @param req The request object.
   * @param res The response object.
   *
   * @remarks
   * Handles GET requests to retrieve group members data from 'group_members.json'.
   *
   * // EN: Handles GET requests to retrieve group members data from 'group_members.json'.
   * // FR: Gère les requêtes GET pour récupérer les données des membres du groupe depuis 'group_members.json'.
   */
  app.get("/api/groups/members", (req: Request, res: Response) => {
    fs.readFile(
      path.join(dir.groups, "group_members.json"),
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error reading JSON file:", err);
          return res.status(500).json(cfg.web_api.errorServer);
        }
        try {
          res.set("Content-Type", "application/json");
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (parseError) {
          console.error("Error parsing JSON file:", parseError);
          res.status(500).json(cfg.web_api.errorServer);
        }
      }
    );
  });

  /**
   * Route to get group ban data.
   *
   * @param req The request object.
   * @param res The response object.
   *
   * @remarks
   * Handles GET requests to retrieve group ban data from 'group_bans.json'.
   *
   * // EN: Handles GET requests to retrieve group ban data from 'group_bans.json'.
   * // FR: Gère les requêtes GET pour récupérer les données des bannis du groupe depuis 'group_bans.json'.
   */
  app.get("/api/groups/members/bans", (req: Request, res: Response) => {
    fs.readFile(
      path.join(dir.groups, "group_bans.json"),
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error reading JSON file:", err);
          return res.status(500).json(cfg.web_api.errorServer);
        }
        try {
          res.set("Content-Type", "application/json");
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (parseError) {
          console.error("Error parsing JSON file:", parseError);
          res.status(500).json(cfg.web_api.errorServer);
        }
      }
    );
  });
} else {
  /**
   * Route to indicate that the group feature is disabled.
   *
   * @param req The request object.
   * @param res The response object.
   *
   * @remarks
   * Handles GET requests for '/api/groups', '/api/groups/members', and '/api/groups/members/bans' when the group feature is disabled.
   *
   * // EN: Handles GET requests to indicate that the group feature is disabled.
   * // FR: Gère les requêtes GET pour indiquer que la fonctionnalité des groupes est désactivée.
   */
  app.get("/api/groups", (req: Request, res: Response) => {
    res.status(404).json({ error: cfg.web_api.groupFeature });
  });

  app.get("/api/groups/members", (req: Request, res: Response) => {
    res.status(404).json({ error: cfg.web_api.groupFeature });
  });

  app.get("/api/groups/members/bans", (req: Request, res: Response) => {
    res.status(404).json({ error: cfg.web_api.groupFeature });
  });
}

/**
 * Handle 404 - Not Found.
 *
 * @param req The request object.
 * @param res The response object.
 *
 * // EN: Handles 404 errors by redirecting to a specified URL.
 * // FR: Gère les erreurs 404 en redirigeant vers une URL spécifiée.
 */
app.use((req: Request, res: Response) => {
  res.status(404).redirect(302, cfg.web_api.redirect404);
});

/**
 * Handle 500 - Internal Server Error.
 *
 * @param err The error object.
 * @param req The request object.
 * @param res The response object.
 *
 * // EN: Handles 500 errors by logging the error and responding with a server error message.
 * // FR: Gère les erreurs 500 en enregistrant l'erreur et en répondant avec un message d'erreur serveur.
 */
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: cfg.web_api.errorServer });
});

/**
 * Start the server.
 *
 * @remarks
 * Starts the Express server and logs the port it is running on.
 *
 * // EN: Starts the Express server and logs the port number.
 * // FR: Démarre le serveur Express et enregistre le numéro de port.
 */
app.listen(env.web_api_port, () => {
  console.log(`Server is running at port ${env.web_api_port}`);
});
