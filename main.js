const { spawn } = require("child_process");

// Define the command to be executed
// Définir la commande à exécuter
const command = "npm";

// Define the arguments for the command
// Définir les arguments pour la commande
const args = ["run", "start"];

// Spawn a new process to run the command with the specified arguments
// Options:
// - stdio: "inherit" means the child process will use the same standard input/output/error streams as the parent process
// - shell: true allows the command to be run in a shell, which is necessary for some commands
// Créer un nouveau processus pour exécuter la commande avec les arguments spécifiés
// Options :
// - stdio: "inherit" signifie que le processus enfant utilisera les mêmes flux d'entrée/sortie/erreur que le processus parent
// - shell: true permet d'exécuter la commande dans un shell, ce qui est nécessaire pour certaines commandes
const process = spawn(command, args, { stdio: "inherit", shell: true });

// Event handler for when the child process exits
// Logs the exit code of the child process
// Gestionnaire d'événements pour lorsque le processus enfant se termine
// Enregistre le code de sortie du processus enfant
process.on("close", (code) => {
  console.log(`The child process ended with the code: ${code}`);
});

// Event handler for errors that occur during the command execution
// Logs the error message if the command fails
// Gestionnaire d'événements pour les erreurs qui se produisent lors de l'exécution de la commande
// Enregistre le message d'erreur si la commande échoue
process.on("error", (error) => {
  console.error(`Error during command execution: ${error.message}`);
});

// Optional: Catch any errors in the main try block to handle unexpected failures
// Optionnel : Capturer toutes les erreurs dans le bloc try principal pour gérer les échecs inattendus
try {
  // Spawn a new process securely
  // Créer un nouveau processus en toute sécurité
  const process = spawn(command, args, { stdio: "inherit", shell: true });

  process.on("close", (code) => {
    console.log(`The child process ended with the code: ${code}`);
  });

  process.on("error", (error) => {
    console.error(`Error during command execution: ${error.message}`);
  });
} catch (error) {
  console.error(`Failed to spawn the process: ${error.message}`);
}
