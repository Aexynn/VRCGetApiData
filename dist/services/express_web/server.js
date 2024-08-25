"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("../../libs/config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
if (!config_1.env.user_id) {
    throw new Error("Environment variable USER_ID must be set");
}
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, config_1.dir.user)));
app.get("/api/users", (req, res) => {
    const filePath1 = path_1.default.join(config_1.dir.user, "user_infos.json");
    const filePath2 = path_1.default.join(config_1.dir.user, "old_method/user_data.json");
    fs_1.default.access(filePath1, fs_1.default.constants.F_OK, (err) => {
        if (!err) {
            fs_1.default.readFile(filePath1, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading JSON file:", err);
                    return res.status(500).json(config_1.cfg.web_api.errorServer);
                }
                try {
                    res.set("Content-Type", "application/json");
                    const jsonData = JSON.parse(data);
                    res.json(jsonData);
                }
                catch (parseError) {
                    console.error("Error parsing JSON file:", parseError);
                    res.status(500).json(config_1.cfg.web_api.errorServer);
                }
            });
        }
        else {
            fs_1.default.readFile(filePath2, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading JSON file:", err);
                    return res.status(500).json(config_1.cfg.web_api.errorServer);
                }
                try {
                    res.set("Content-Type", "application/json");
                    const jsonData = JSON.parse(data);
                    res.json(jsonData);
                }
                catch (parseError) {
                    console.error("Error parsing JSON file:", parseError);
                    res.status(500).json(config_1.cfg.web_api.errorServer);
                }
            });
        }
    });
});
app.get("/api/users/groups", (req, res) => {
    const filePath1 = path_1.default.join(config_1.dir.user, "user_groups_list.json");
    const filePath2 = path_1.default.join(config_1.dir.user, "old_method/groupsList_data.json");
    fs_1.default.access(filePath1, fs_1.default.constants.F_OK, (err) => {
        if (!err) {
            fs_1.default.readFile(filePath1, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading JSON file:", err);
                    return res.status(500).json(config_1.cfg.web_api.errorServer);
                }
                try {
                    res.set("Content-Type", "application/json");
                    const jsonData = JSON.parse(data);
                    res.json(jsonData);
                }
                catch (parseError) {
                    console.error("Error parsing JSON file:", parseError);
                    res.status(500).json(config_1.cfg.web_api.errorServer);
                }
            });
        }
        else {
            fs_1.default.readFile(filePath2, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading JSON file:", err);
                    return res.status(500).json(config_1.cfg.web_api.errorServer);
                }
                try {
                    res.set("Content-Type", "application/json");
                    const jsonData = JSON.parse(data);
                    res.json(jsonData);
                }
                catch (parseError) {
                    console.error("Error parsing JSON file:", parseError);
                    res.status(500).json(config_1.cfg.web_api.errorServer);
                }
            });
        }
    });
});
app.get("/api/users/groups/represented", (req, res) => {
    const filePath1 = path_1.default.join(config_1.dir.user, "user_group_represented.json");
    const filePath2 = path_1.default.join(config_1.dir.user, "old_method/groupsRepresented_data.json");
    fs_1.default.access(filePath1, fs_1.default.constants.F_OK, (err) => {
        if (!err) {
            fs_1.default.readFile(filePath1, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading JSON file:", err);
                    return res.status(500).json(config_1.cfg.web_api.errorServer);
                }
                try {
                    res.set("Content-Type", "application/json");
                    const jsonData = JSON.parse(data);
                    res.json(jsonData);
                }
                catch (parseError) {
                    console.error("Error parsing JSON file:", parseError);
                    res.status(500).json(config_1.cfg.web_api.errorServer);
                }
            });
        }
        else {
            fs_1.default.readFile(filePath2, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading JSON file:", err);
                    return res.status(500).json(config_1.cfg.web_api.errorServer);
                }
                try {
                    res.set("Content-Type", "application/json");
                    const jsonData = JSON.parse(data);
                    res.json(jsonData);
                }
                catch (parseError) {
                    console.error("Error parsing JSON file:", parseError);
                    res.status(500).json(config_1.cfg.web_api.errorServer);
                }
            });
        }
    });
});
if (config_1.cfg.activate_group_feature) {
    app.get("/api/groups", (req, res) => {
        fs_1.default.readFile(path_1.default.join(config_1.dir.groups, "group_infos.json"), "utf8", (err, data) => {
            if (err) {
                console.error("Error reading JSON file:", err);
                return res.status(500).json(config_1.cfg.web_api.errorServer);
            }
            try {
                res.set("Content-Type", "application/json");
                const jsonData = JSON.parse(data);
                res.json(jsonData);
            }
            catch (parseError) {
                console.error("Error parsing JSON file:", parseError);
                res.status(500).json(config_1.cfg.web_api.errorServer);
            }
        });
    });
    app.get("/api/groups/members", (req, res) => {
        fs_1.default.readFile(path_1.default.join(config_1.dir.groups, "group_members.json"), "utf8", (err, data) => {
            if (err) {
                console.error("Error reading JSON file:", err);
                return res.status(500).json(config_1.cfg.web_api.errorServer);
            }
            try {
                res.set("Content-Type", "application/json");
                const jsonData = JSON.parse(data);
                res.json(jsonData);
            }
            catch (parseError) {
                console.error("Error parsing JSON file:", parseError);
                res.status(500).json(config_1.cfg.web_api.errorServer);
            }
        });
    });
    app.get("/api/groups/members/bans", (req, res) => {
        fs_1.default.readFile(path_1.default.join(config_1.dir.groups, "group_bans.json"), "utf8", (err, data) => {
            if (err) {
                console.error("Error reading JSON file:", err);
                return res.status(500).json(config_1.cfg.web_api.errorServer);
            }
            try {
                res.set("Content-Type", "application/json");
                const jsonData = JSON.parse(data);
                res.json(jsonData);
            }
            catch (parseError) {
                console.error("Error parsing JSON file:", parseError);
                res.status(500).json(config_1.cfg.web_api.errorServer);
            }
        });
    });
}
else {
    app.get("/api/groups", (req, res) => {
        res.status(404).json({ error: config_1.cfg.web_api.groupFeature });
    });
    app.get("/api/groups/members", (req, res) => {
        res.status(404).json({ error: config_1.cfg.web_api.groupFeature });
    });
    app.get("/api/groups/members/bans", (req, res) => {
        res.status(404).json({ error: config_1.cfg.web_api.groupFeature });
    });
}
app.use((req, res) => {
    res.status(404).redirect(302, config_1.cfg.web_api.redirect404);
});
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ error: config_1.cfg.web_api.errorServer });
});
app.listen(config_1.env.web_api_port, () => {
    console.log(`Server is running at port ${config_1.env.web_api_port}`);
});
//# sourceMappingURL=server.js.map