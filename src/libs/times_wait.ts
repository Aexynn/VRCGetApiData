import { Page } from "puppeteer";

/**
 * Wait for a specified delay.
 *
 * @param ms The delay duration in milliseconds.
 * @returns A promise that resolves after the specified delay.
 *
 * // EN: Waits for the given number of milliseconds before resolving.
 * // FR: Attend le nombre de millisecondes spécifié avant de se résoudre.
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format milliseconds into a readable time string.
 *
 * @param ms The duration in milliseconds to format.
 * @returns A string representing the time in hours, minutes, and seconds.
 *
 * // EN: Converts milliseconds into a string formatted as "Xh Ym Zs".
 * // FR: Convertit les millisecondes en une chaîne formatée comme "Xh Ym Zs".
 */
export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60));

  return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Check if the current time is exactly midnight.
 *
 * @returns A promise that resolves to true if it is midnight, false otherwise.
 *
 * // EN: Checks if the current time is exactly midnight (00:00:00).
 * // FR: Vérifie si l'heure actuelle est exactement minuit (00:00:00).
 */
export async function checkIfMidnight(): Promise<boolean> {
  const currentTime = new Date();
  // Check if current time is midnight (00:00:00)
  // Vérifier si l'heure actuelle est minuit (00:00:00)
  return (
    currentTime.getHours() === 0 &&
    currentTime.getMinutes() === 0 &&
    currentTime.getSeconds() === 0
  );
}

// Randomly generate a wait time between 1 and 2 hours.
export const waitTime: number =
  Math.floor(Math.random() * (2 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000)) +
  1 * 60 * 60 * 1000;

/**
 * Wait for a specific loading element to disappear from the page.
 *
 * @param page The Puppeteer Page instance to interact with.
 *
 * // EN: Waits until the loading element identified by the selector "#loading" is no longer visible.
 * // FR: Attend que l'élément de chargement identifié par le sélecteur "#loading" ne soit plus visible.
 */
export async function waitForLoadingToDisappear(page: Page): Promise<void> {
  try {
    // Wait until the loading div is hidden
    // Attendre que le div de chargement soit caché
    await page.waitForSelector("#loading", { hidden: true });
    console.log("Loading div disappeared.");
  } catch (error) {
    console.error(
      "Error while waiting for the loading div to disappear:",
      error
    );
  }
}
