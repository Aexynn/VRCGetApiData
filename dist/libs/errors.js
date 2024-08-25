"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isErrorWithMessage = isErrorWithMessage;
exports.isAxiosError = isAxiosError;
function isErrorWithMessage(error) {
    return error && typeof error.message === "string";
}
function isAxiosError(error) {
    return error.isAxiosError === true;
}
//# sourceMappingURL=errors.js.map