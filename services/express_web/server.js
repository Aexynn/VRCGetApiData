const express = require("express");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const env = {
  user_id: process.env.USER_ID,
  data: "data",
};

if (!env.user_id) {
  throw new Error("Environment variables USER_ID must be set");
}

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, env.data)));
let error_server =
  '{"error": "An internal server error has occurred. Please try again later."}';

app.get("/api/users", (req, res) => {
  fs.readFile(
    `${env.data}/${env.user_id}_user_data.json`,
    "utf8",
    (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        return res.status(500).json(error_server);
      }
      try {
        res.set("Content-Type", "application/json");
        const jsonData = JSON.parse(data);

        res.json(jsonData);
      } catch (parseError) {
        console.error("Error parsing JSON file:", parseError);
        res.status(500).json(error_server);
      }
    }
  );
});

app.get("/api/users/worlds", (req, res) => {
  fs.readFile(
    `${env.data}/${env.user_id}_worlds_data.json`,
    "utf8",
    (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        return res.status(500).json(error_server);
      }
      try {
        res.set("Content-Type", "application/json");
        const jsonData = JSON.parse(data);

        res.json(jsonData);
      } catch (parseError) {
        console.error("Error parsing JSON file:", parseError);
        res.status(500).json(error_server);
      }
    }
  );
});

app.get("/api/users/groups", (req, res) => {
  fs.readFile(
    `${env.data}/${env.user_id}_groupsList_data.json`,
    "utf8",
    (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        return res.status(500).json(error_server);
      }
      try {
        res.set("Content-Type", "application/json");
        const jsonData = JSON.parse(data);

        res.json(jsonData);
      } catch (parseError) {
        console.error("Error parsing JSON file:", parseError);
        res.status(500).json(error_server);
      }
    }
  );
});

app.get("/api/users/groups/represented", (req, res) => {
  fs.readFile(
    `${env.data}/${env.user_id}_groupsRepresented_data.json`,
    "utf8",
    (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        return res.status(500).json(error_server);
      }
      try {
        res.set("Content-Type", "application/json");
        const jsonData = JSON.parse(data);

        res.json(jsonData);
      } catch (parseError) {
        console.error("Error parsing JSON file:", parseError);
        res.status(500).json(error_server);
      }
    }
  );
});

app.get("/api/users/screenshot", (req, res) => {
  fs.readFile(`${env.data}/${env.user_id}_screenshot.png`, (err, data) => {
    if (err) {
      console.error("Error reading screenshot file:", err);
      return res.status(500).json(error_server);
    }

    res.set("Content-Type", "image/png");
    res.send(data);
  });
});

app.use((req, res, next) => {
  res.status(404).redirect("https://github.com/Kyuddle/VRCScraperUserData");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(error_server);
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
