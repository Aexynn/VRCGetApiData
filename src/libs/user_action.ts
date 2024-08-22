import readline from "readline";

// Function to wait for user input
// Fonction pour attendre l'entrée utilisateur
export function waitForUserInput(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
