export const CHAT_COMPLETIONS_API_URL = "https://api.flydex.site/v1/chat/completions";
export const AUDIO_TRANSCRIPTIONS_API_URL = "https://api.openai.com/v1/audio/transcriptions";
export const EMBEDDINGS_API_URL = "https://api.openai.com/v1/embeddings";
export const getTextToSpeechApiUrl = (voice_id) => `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;
export const ELVEN_LABS_DEFAULT_MODEL_ID = "eleven_monolingual_v1";
export const ELVEN_LABS_DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
export const IMAGE_GENERATION_API_URL = "https://api.openai.com/v1/images/generations";
export const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
export const EDIT_IMAGE_API_URL = "https://api.openai.com/v1/images/edits";
export const IMAGE_VARIATIONS_API_URL = "https://api.openai.com/v1/images/variations";
export class ResponseError extends Error {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
export function makeErrorResponse(message, status) {
    const error = new ResponseError(JSON.stringify({ message }));
    error.status = status || 500;
    return error;
}
export async function streamOpenAIResponse(response, callback) {
    if (!response.body) {
        throw Error("Response has no body");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let text = "";
    let isFirst = true;
    while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        text += chunkValue;
        const message = { content: text, role: "assistant" };
        callback && callback({ message, isFirst, isLast: done });
        isFirst = false;
    }
    const message = { content: text, role: "assistant" };
    return { message };
}
export function fillPrompt(str, data = {}) {
    return Object.entries(data).reduce((res, [key, value]) => {
        // lookbehind expression, only replaces if mustache was not preceded by a backslash
        const mainRe = new RegExp(`(?<!\\\\){{\\s*${key}\\s*}}`, "g");
        // this regex is actually (?<!\\){{\s*<key>\s*}} but because of escaping it looks like that...
        const escapeRe = new RegExp(`\\\\({{\\s*${key}\\s*}})`, "g");
        // the second regex now handles the cases that were skipped in the first case.
        return res.replace(mainRe, value.toString()).replace(escapeRe, "$1");
    }, str);
}
export function dataURLToBlob(dataurl) {
    var _a;
    let arr = dataurl.split(",");
    if (!arr || arr.length < 2) {
        throw new Error("Invalid data URL");
    }
    let mimeMatch = (_a = arr[0]) === null || _a === void 0 ? void 0 : _a.match(/:(.*?);/);
    if (!mimeMatch || !arr[1]) {
        throw new Error("Invalid data URL");
    }
    let mime = mimeMatch[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}
export function dataUrlToExtension(dataURL) {
    var extension = "";
    if (dataURL.indexOf("/") !== -1 && dataURL.indexOf(";") !== -1) {
        var startIndex = dataURL.indexOf("/") + 1;
        var endIndex = dataURL.indexOf(";");
        extension = dataURL.substring(startIndex, endIndex);
    }
    return extension;
}
function dotProduct(vecA, vecB) {
    let product = 0;
    if (vecA.length !== vecB.length)
        throw new Error("Vectors must be same length");
    for (let i = 0; i < vecA.length; i++) {
        product += vecA[i] * vecB[i];
    }
    return product;
}
function magnitude(vec) {
    let sum = 0;
    for (let i = 0; i < vec.length; i++) {
        sum += vec[i] * vec[i];
    }
    return Math.sqrt(sum);
}
export function cosineSimilarity(vecA, vecB) {
    return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}
export function scoreEmbeddings(options) {
    const { embeddings, query, top } = options;
    const scores = embeddings.map((vector) => cosineSimilarity(query, vector));
    const sortedScores = scores
        .map((score, index) => ({ score, index }))
        .sort((a, b) => b.score - a.score)
        .slice(0, top || undefined);
    return sortedScores;
}
