import { AxiosError } from "axios";

/**
 * Check if an error object has a `message` property of type string.
 *
 * @param error The error object to check.
 * @returns True if the error object has a `message` property of type string, false otherwise.
 *
 * // EN: Determines if the provided error object has a `message` property that is a string.
 * // FR: Détermine si l'objet d'erreur fourni a une propriété `message` de type chaîne.
 */
export function isErrorWithMessage(error: any): error is { message: string } {
  return error && typeof error.message === "string";
}

/**
 * Check if an error is an AxiosError.
 *
 * @param error The error object to check.
 * @returns True if the error is an instance of AxiosError, false otherwise.
 *
 * // EN: Determines if the provided error object is an AxiosError.
 * // FR: Détermine si l'objet d'erreur fourni est une instance d'AxiosError.
 */
export function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}
