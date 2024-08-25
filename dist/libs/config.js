"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selector = exports.urls = exports.dir = exports.env = exports.cfg = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.cfg = {
    vrchat_domain: "https://vrchat.com",
    browser: {
        headless: true,
        width: 1389,
        height: 1818,
    },
    data_folder: "data",
    web_api: {
        redirect404: "https://github.com/Kyuddle/VRCGetApiData",
        errorServer: "An internal server error has occurred. Please try again later.",
        groupFeature: "Group feature is disabled",
    },
    activate_user_feature: true,
    activate_group_feature: true,
    activate_loop_fetching: true,
};
exports.env = {
    user_id: process.env.USER_ID,
    nickname: process.env.NICKNAME,
    web_api_port: process.env.PORT || 3000,
    userAgent: process.env.USER_AGENT,
};
if (!exports.env.user_id || !exports.env.nickname || !exports.env.userAgent) {
    throw new Error("USER_ID and/or NICKNAME and/or USER_AGENT is not set. Please check your environment variables (.env).");
}
exports.dir = {
    user: `${exports.cfg.data_folder}/users/${process.env.USER_ID}`,
    groups: `${exports.cfg.data_folder}/groups/${process.env.GROUP_ID}`,
    auth: `${exports.cfg.data_folder}/auth`,
};
exports.urls = {
    login: `${exports.cfg.vrchat_domain}/home/login`,
    twoFA: `${exports.cfg.vrchat_domain}/home/emailtwofactorauth`,
    profile: `${exports.cfg.vrchat_domain}/home/user/${process.env.USER_ID}`,
    api: {
        users: `${exports.cfg.vrchat_domain}/api/1/users/${process.env.USER_ID}`,
        groups: {
            list: `${exports.cfg.vrchat_domain}/api/1/users/${process.env.USER_ID}/groups`,
            represented: `${exports.cfg.vrchat_domain}/api/1/users/${process.env.USER_ID}/groups/represented`,
        },
        group_data: {
            infos: `${exports.cfg.vrchat_domain}/api/1/groups/${process.env.GROUP_ID}`,
            members: `${exports.cfg.vrchat_domain}/api/1/groups/${process.env.GROUP_ID}/members`,
            bans: `${exports.cfg.vrchat_domain}/api/1/groups/${process.env.GROUP_ID}/bans`,
        },
    },
};
if (!process.env.GROUP_ID && exports.cfg.activate_group_feature) {
    throw new Error("GROUP_ID is not set. Please check your environment variables (.env) / If you don't need just desactivate in CFG const.");
}
exports.selector = {
    field: {
        username: "#username_email",
        password: "#password",
        twoFA: 'input[name="code"]',
    },
    button: {
        privacy: "#onetrust-accept-btn-handler",
        login: 'button[aria-label="Login"]',
        next2FA: 'button[type="submit"]',
    },
};
const config = exports.cfg;
//# sourceMappingURL=config.js.map