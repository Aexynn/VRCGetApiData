"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitTime = void 0;
exports.wait = wait;
exports.formatTime = formatTime;
exports.checkIfMidnight = checkIfMidnight;
exports.waitForLoadingToDisappear = waitForLoadingToDisappear;
exports.waitRandomPeriod = waitRandomPeriod;
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const parts = [];
    if (hours > 0) {
        parts.push(`${hours.toString().padStart(2, "0")}h`);
    }
    if (minutes > 0) {
        parts.push(`${minutes.toString().padStart(2, "0")}m`);
    }
    if (seconds > 0 || (hours === 0 && minutes === 0)) {
        parts.push(`${seconds.toString().padStart(2, "0")}s`);
    }
    return parts.join(" ");
}
async function checkIfMidnight() {
    const currentTime = new Date();
    return (currentTime.getHours() === 0 &&
        currentTime.getMinutes() === 0 &&
        currentTime.getSeconds() === 0);
}
exports.waitTime = Math.floor(Math.random() * (2 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000)) +
    1 * 60 * 60 * 1000;
async function waitForLoadingToDisappear(page) {
    try {
        await page.waitForSelector("#loading", { hidden: true });
        console.log("Loading div disappeared.");
    }
    catch (error) {
        console.error("Error while waiting for the loading div to disappear:", error);
    }
}
async function waitRandomPeriod() {
    const minWait = 1 * 60 * 60 * 1000;
    const maxWait = 2 * 60 * 60 * 1000;
    const waitTime = Math.floor(Math.random() * (maxWait - minWait + 1)) + minWait;
    console.log(`[Infos] Waiting for ${formatTime(waitTime)} before the next execution.`);
    return new Promise((resolve) => setTimeout(() => resolve(), waitTime));
}
//# sourceMappingURL=times_wait.js.map