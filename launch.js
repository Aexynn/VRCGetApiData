const { spawn } = require("child_process");

const command = "npm";
const args = ["run", "start"];

const process = spawn(command, args, { stdio: "inherit", shell: true });

process.on("close", (code) => {
  console.log(`The child process ended with the code: ${code}`);
});

process.on("error", (error) => {
  console.error(`Error during command execution: ${error.message}`);
});
