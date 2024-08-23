import readline from "readline";

/**
 * Function to wait for user input.
 *
 * @param prompt - The prompt message to display to the user.
 * @returns A Promise that resolves with the user's input.
 *
 * // EN: Creates a readline interface to prompt the user for input and returns a Promise that resolves with the user's response.
 * // FR: Crée une interface readline pour demander une saisie utilisateur et retourne une Promise qui se résout avec la réponse de l'utilisateur.
 */
export function waitForUserInput(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    // Create a readline interface for user input
    // Créer une interface readline pour la saisie utilisateur
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Prompt the user with the provided message and wait for their input
    // Demander à l'utilisateur avec le message fourni et attendre sa saisie
    rl.question(prompt, (answer) => {
      // Close the readline interface and resolve the Promise with the user's input
      // Fermer l'interface readline et résoudre la Promise avec la saisie de l'utilisateur
      rl.close();
      resolve(answer);
    });
  });
}
