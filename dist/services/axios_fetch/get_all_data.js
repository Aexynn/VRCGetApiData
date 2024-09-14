"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const config_1 = require("../../libs/config");
const times_wait_1 = require("../../libs/times_wait");
const check_requirements_1 = require("../../libs/check_requirements");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
function logSkippedCommand(environment, activateCommand, commandName, cfgName) {
    if (!activateCommand) {
        console.log(`[Infos] '${environment === "development" ? `${commandName}` : `dist/${commandName}`}' command is skipped because '${cfgName}' is set to ${activateCommand}.`);
    }
}
function getCommands(environment, activateGroupsFeatures, activateUsersFeatures) {
    logSkippedCommand(environment, activateGroupsFeatures, "api:group", "cfg.activate_group_feature");
    logSkippedCommand(environment, activateUsersFeatures, "api:user", "cfg.activate_user_feature");
    logSkippedCommand(environment, activateUsersFeatures, "api:user:groups", "cfg.activate_user_feature");
    const baseCommands = [];
    if ((0, check_requirements_1.checkDir)("auth")) {
        if (activateUsersFeatures) {
            baseCommands.push(environment === "development"
                ? "npm run api:user"
                : "npm run dist/api:user");
            baseCommands.push(environment === "development"
                ? "npm run api:user:groups"
                : "npm run dist/api:user:groups");
        }
        if (activateGroupsFeatures) {
            baseCommands.push(environment === "development"
                ? "npm run api:group"
                : "npm run dist/api:group");
        }
    }
    else {
        baseCommands.push(environment === "development"
            ? "npm run scrape:auth"
            : "npm run dist/scrape:user");
    }
    return baseCommands;
}
async function runCommands(commands, environment) {
    console.log(`Starting commands execution for ${environment} environment.`);
    const minWait = 1 * 60 * 1000;
    const maxWait = 1 * 60 * 1000 + 20 * 1000;
    for (const command of commands) {
        try {
            console.log(`Executing: ${command}`);
            const { stdout, stderr } = await execPromise(command);
            if (stdout)
                console.log(stdout);
            if (stderr)
                console.error(stderr);
            const waitTime = Math.floor(Math.random() * (maxWait - minWait + 1)) + minWait;
            console.log(`[Infos] Waiting for ${(0, times_wait_1.formatTime)(waitTime)} before the next command.`);
            await (0, times_wait_1.wait)(waitTime);
        }
        catch (error) {
            console.error(`Error executing command: ${command}`, error);
            process.exit(1);
        }
    }
    console.log(`All commands executed for ${environment} environment.`);
}
async function main() {
    const environment = config_1.isDev
        ? "development"
        : "production";
    console.log(`[Infos] This process will execute the commands and wait between 1 and 1m 20s between each command to avoid overloading the API and minimize the risk of account bans.`);
    const shouldLoop = config_1.cfg.activate_loop_fetching;
    const commands = getCommands(environment, config_1.cfg.activate_group_feature, config_1.cfg.activate_user_feature);
    if (shouldLoop) {
        console.log(`[Infos] Loop fetching is activated. Starting the loop.`);
        while (true) {
            console.log(`Executing commands...`);
            await runCommands(commands, environment);
            await (0, times_wait_1.waitRandomPeriod)();
        }
    }
    else {
        console.log(`[Infos] Loop fetching is not activated. Running commands once.`);
        console.log(`Executing commands...`);
        await runCommands(commands, environment);
    }
}
main().catch((error) => {
    console.error("An error occurred in the main function:", error);
    process.exit(1);
});
//# sourceMappingURL=get_all_data.js.map