import { exec } from "child_process";
import { promisify } from "util";
import { cfg } from "../../libs/config";
import { formatTime, wait, waitRandomPeriod } from "../../libs/times_wait";

const execPromise = promisify(exec);

/**
 * Logs a message indicating that a specific command is skipped due to a configuration setting.
 *
 * @param environment - The current environment in which the commands are executed. It should be either "development" or "production".
 * @param activateCommand - A boolean indicating whether the command should be activated or not. If false, the command is skipped.
 * @param commandName - The name of the command that is potentially skipped. For example, "api:group".
 * @param cfgName - The name of the configuration setting that determines if the command is activated or not. For example, "cfg.activate_group_feature".
 *
 * @remarks
 * This function outputs a log message when a command is skipped based on a configuration setting.
 * It helps to understand why certain commands are not being executed, based on the value of a configuration flag.
 *
 * The message format varies depending on the environment:
 * - For "development", it logs: `"[Infos] 'api:group' command is skipped because 'cfg.activate_group_feature' is set to false."`
 * - For "production", it logs: `"[Infos] 'dist/api:group' command is skipped because 'cfg.activate_group_feature' is set to false."`
 *
 * This function is useful for debugging and ensuring that the correct commands are being run or skipped.
 *
 * // EN: Logs a message when a command is skipped due to a configuration setting.
 * // FR: Journalise un message lorsqu'une commande est ignorée en raison d'un paramètre de configuration.
 */
function logSkippedCommand(
  environment: "development" | "production",
  activateCommand: boolean,
  commandName: string,
  cfgName: string
) {
  if (!activateCommand) {
    console.log(
      `[Infos] '${
        environment === "development" ? `${commandName}` : `dist/${commandName}`
      }' command is skipped because '${cfgName}' is set to ${activateCommand}.`
    );
  }
}

/**
 * Generates an array of commands to run based on the environment and configuration.
 *
 * @param environment - The environment ('development' or 'production').
 * @param activateGroupFunction - Whether to include the 'api:group' command.
 * @returns An array of npm commands to execute.
 */
function getCommands(
  environment: "development" | "production",
  activateGroupFunction: boolean
): string[] {
  logSkippedCommand(
    environment,
    activateGroupFunction,
    "api:group",
    "cfg.activate_group_feature"
  );

  const baseCommands = [
    environment === "development"
      ? "npm run api:user"
      : "npm run dist/api:user",
    environment === "development"
      ? "npm run api:user:groups"
      : "npm run dist/api:user:groups",
  ];

  if (activateGroupFunction) {
    baseCommands.push(
      environment === "development"
        ? "npm run api:group"
        : "npm run dist/api:group"
    );
  }

  return baseCommands;
}

/**
 * Executes a list of npm commands sequentially with optional logging.
 *
 * @param commands - An array of npm commands to execute.
 * @param environment - The environment ('development' or 'production').
 *
 * @remarks
 * This function executes each command in the provided array one by one, waits for the previous command
 * to complete before starting the next one. Includes a delay between commands to avoid overloading the API
 * and to reduce the risk of rate limiting or account bans.
 *
 * // EN: Executes a list of npm commands sequentially, logs output, handles errors, and waits between commands.
 * // FR: Exécute une liste de commandes npm de manière séquentielle, journalise la sortie, gère les erreurs et attend entre les commandes.
 */
async function runCommands(
  commands: string[],
  environment: "development" | "production"
): Promise<void> {
  console.log(`Starting commands execution for ${environment} environment.`);

  const minWait = 1 * 60 * 1000; // 1 minute in milliseconds
  const maxWait = 1 * 60 * 1000 + 20 * 1000; // 1 minute + 20 seconds in milliseconds

  for (const command of commands) {
    try {
      console.log(`Executing: ${command}`);
      const { stdout, stderr } = await execPromise(command);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);

      // Wait for a random period between 1 minute and 1 minute 20 seconds
      const waitTime =
        Math.floor(Math.random() * (maxWait - minWait + 1)) + minWait;
      console.log(
        `[Infos] Waiting for ${formatTime(waitTime)} before the next command.`
      );

      await wait(waitTime); // Pause to avoid overloading the API
    } catch (error) {
      console.error(`Error executing command: ${command}`, error);
      // Optionally, you can decide to exit or continue based on the error.
      process.exit(1);
    }
  }

  console.log(`All commands executed for ${environment} environment.`);
}

/**
 * Main function to decide the environment and execute the corresponding commands.
 *
 * @remarks
 * This function determines whether the environment is 'development' or 'production',
 * and executes the appropriate set of npm commands. If 'cfg.activate_loop_fetching' is true,
 * it will run the commands in a loop with random wait periods to prevent overwhelming the API.
 * If 'cfg.activate_loop_fetching' is false, it will execute the commands only once.
 *
 * // EN: Determines the environment and runs the corresponding set of npm commands in a loop with random wait periods if configured to do so.
 * // FR: Détermine l'environnement et exécute le jeu de commandes npm correspondant dans une boucle avec des périodes d'attente aléatoires si configuré pour le faire.
 */
async function main(): Promise<void> {
  const rawEnvironment = process.env.NODE_ENV;
  const environment: "development" | "production" =
    rawEnvironment === "production" ? "production" : "development";

  console.log(
    `[Infos] This process will execute the commands and wait between 1 and 1m 20s between each command to avoid overloading the API and minimize the risk of account bans.`
  );

  const shouldLoop = cfg.activate_loop_fetching;
  const commands = getCommands(environment, cfg.activate_group_feature);

  if (shouldLoop) {
    console.log(`[Infos] Loop fetching is activated. Starting the loop.`);
    while (true) {
      console.log(`Executing commands...`);
      await runCommands(commands, environment);

      await waitRandomPeriod(); // Waits and logs internally to control the execution frequency.
    }
  } else {
    console.log(
      `[Infos] Loop fetching is not activated. Running commands once.`
    );
    console.log(`Executing commands...`);
    await runCommands(commands, environment);
  }
}

// Start the command execution process
main().catch((error) => {
  console.error("An error occurred in the main function:", error);
  process.exit(1);
});
