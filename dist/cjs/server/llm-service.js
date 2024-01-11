"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLLMService = exports.LLMService = void 0;
const OpenAIStream_1 = require("./OpenAIStream");
const utils_1 = require("../shared/utils");
const defaultTemplate = {
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
    temperature: 0.8,
};
class LLMService {
    constructor({ openaiApiKey = "", elvenLabsApiKey = "", replicateApiKey = "", fetcher = fetch, templates = {}, debug = false, isAllowed = () => true, actions = [], }) {
        Object.defineProperty(this, "templates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "openaiApiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "elvenLabsApiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "replicateApiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fetcher", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "debug", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "actions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isAllowed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "customActions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "cosineSimilarity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: utils_1.cosineSimilarity
        });
        Object.defineProperty(this, "scoreEmbeddings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: utils_1.scoreEmbeddings
        });
        this.openaiApiKey = openaiApiKey;
        this.elvenLabsApiKey = elvenLabsApiKey;
        this.replicateApiKey = replicateApiKey;
        this.fetcher = fetcher;
        this.templates = templates;
        this.debug = debug;
        this.isAllowed = isAllowed;
        this.actions = actions;
    }
    registerTemplate(template) {
        this.templates[template.id] = template;
    }
    registerAction(id, action) {
        this.customActions[id] = action;
    }
    async callAction(action, body = {}) {
        if (!this.actions.includes(action) && !this.customActions[action]) {
            throw (0, utils_1.makeErrorResponse)(`Action "${action}" is not allowed`, 400);
        }
        if (action === "chat") {
            return this.chat(body);
        }
        if (action === "transcribe") {
            return this.transcribe(body);
        }
        if (action === "embed") {
            return this.embed(body);
        }
        if (action === "speak") {
            return this.speak(body);
        }
        if (action === "generateImage") {
            return this.generateImage(body);
        }
        if (action === "editImage") {
            return this.editImage(body);
        }
        if (action === "imageVariation") {
            return this.imageVariation(body);
        }
        if (action === "voiceChat") {
            return this.voiceChat(body);
        }
        if (action === "callReplicate") {
            return this.callReplicate(body);
        }
        const actionFunc = this.customActions[action];
        if (!actionFunc) {
            throw (0, utils_1.makeErrorResponse)(`Action "${action}" is not supported`, 400);
        }
        return actionFunc(body);
    }
    prepareChatBody(body) {
        const template = Object.assign(Object.assign({}, defaultTemplate), (this.templates[body.template || ""] || {}));
        let filledMessages = [];
        if (template.systemPrompt) {
            filledMessages.push({
                role: "system",
                content: (0, utils_1.fillPrompt)(template.systemPrompt, body.inputs),
            });
        }
        if (template.userPrompt) {
            filledMessages.push({
                role: "user",
                content: (0, utils_1.fillPrompt)(template.userPrompt, body.inputs),
            });
        }
        if (body.messages) {
            body.messages.forEach((message) => {
                filledMessages.push({
                    role: message.role,
                    content: message.content,
                    user: message.user,
                });
            });
        }
        if (filledMessages.length == 0) {
            throw (0, utils_1.makeErrorResponse)("Empty message list. Please provide at least one message!", 400);
        }
        const preparedBody = {
            messages: filledMessages,
            stream: body.stream,
            user: body.user,
            model: template.model,
            temperature: template.temperature,
            top_p: template.top_p,
            n: template.n,
            max_tokens: template.max_tokens,
            presence_penalty: template.presence_penalty,
            frequency_penalty: template.frequency_penalty,
            logit_bias: template.logit_bias,
        };
        return preparedBody;
    }
    async handle({ body = {}, request, }) {
        if (!(await this.isAllowed({ body, request }))) {
            throw (0, utils_1.makeErrorResponse)("Request not allowed", 405);
        }
        if (!this.openaiApiKey) {
            throw (0, utils_1.makeErrorResponse)("OpenAI API key is required.", 400);
        }
        if (!("$action" in body)) {
            throw (0, utils_1.makeErrorResponse)("`handle` expects a key $action in the body", 400);
        }
        const { $action } = body, rest = __rest(body, ["$action"]);
        const result = await this.callAction($action, rest);
        if ("stream" in body && body.stream) {
            return result;
        }
        return { result: JSON.stringify(result) };
    }
    async chat(body) {
        const preparedBody = this.prepareChatBody(body);
        if (this.debug) {
            console.log("[LLMService] preparedBody", preparedBody);
        }
        if (preparedBody.stream) {
            const result = await (0, OpenAIStream_1.default)({
                body: preparedBody,
                openaiApiKey: this.openaiApiKey,
                fetcher: this.fetcher,
            });
            return { result };
        }
        else {
            const response = await this.fetcher(utils_1.CHAT_COMPLETIONS_API_URL, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.openaiApiKey}`,
                },
                method: "POST",
                body: JSON.stringify(preparedBody),
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            return response.json();
        }
    }
    async embed(options) {
        const { input, user } = options;
        const model = "text-embedding-ada-002";
        if (!input) {
            throw (0, utils_1.makeErrorResponse)("'input' is required", 400);
        }
        if (typeof input !== "string" && !Array.isArray(input)) {
            throw (0, utils_1.makeErrorResponse)("'input' must be a string or a list of strings", 400);
        }
        let santizedInput;
        if (typeof input === "string") {
            santizedInput = input.trim();
        }
        else {
            santizedInput = input.map((s) => {
                const trimmed = s.trim();
                if (!trimmed) {
                    throw (0, utils_1.makeErrorResponse)("'input' must not contain any empty strings");
                }
                return s.trim();
            });
        }
        if (santizedInput.length === 0) {
            throw (0, utils_1.makeErrorResponse)("'input' must not be empty", 400);
        }
        const response = await this.fetcher(utils_1.EMBEDDINGS_API_URL, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.openaiApiKey}`,
            },
            method: "POST",
            body: JSON.stringify({ input, user, model }),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        const { data } = await response.json();
        const embeddings = data.map((d) => d.embedding);
        return { embeddings };
    }
    async transcribe(options) {
        const { audioUrl, language, prompt } = options;
        if (!audioUrl) {
            throw (0, utils_1.makeErrorResponse)("'audioUrl' is required", 400);
        }
        const audioBlob = (0, utils_1.dataURLToBlob)(audioUrl);
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.wav");
        formData.append("model", "whisper-1");
        if (language) {
            formData.append("language", language);
        }
        if (prompt) {
            formData.append("prompt", prompt);
        }
        const response = await this.fetcher(utils_1.AUDIO_TRANSCRIPTIONS_API_URL, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${this.openaiApiKey}`,
            },
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }
    async speak(options) {
        const { text, model_id = utils_1.ELVEN_LABS_DEFAULT_MODEL_ID, voice_id = utils_1.ELVEN_LABS_DEFAULT_VOICE_ID, voice_settings, } = options;
        const response = await this.fetcher((0, utils_1.getTextToSpeechApiUrl)(voice_id), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": this.elvenLabsApiKey,
            },
            body: JSON.stringify({
                text,
                model_id,
                voice_settings,
            }),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        const responseBlob = await response.blob();
        const responseBuffer = Buffer.from(await responseBlob.arrayBuffer());
        const audioUrl = "data:" +
            responseBlob.type +
            ";base64," +
            responseBuffer.toString("base64");
        return { audioUrl };
    }
    async generateImage(options) {
        const { prompt, n = 1, size = "256x256" } = options;
        if (!prompt) {
            throw (0, utils_1.makeErrorResponse)("'prompt' is required", 400);
        }
        const response = await this.fetcher(utils_1.IMAGE_GENERATION_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.openaiApiKey}`,
            },
            body: JSON.stringify({
                prompt,
                n: Math.min(n, 4),
                size: size,
                response_format: "url",
            }),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        const { data } = await response.json();
        const images = data.map((d) => d.url || d.b64_json);
        return { images };
    }
    async editImage(options) {
        const { image, mask, prompt, n, size, user } = options;
        const formData = new FormData();
        formData.append("image", (0, utils_1.dataURLToBlob)(image), `image.${(0, utils_1.dataUrlToExtension)(image)}`);
        mask &&
            formData.append("mask", (0, utils_1.dataURLToBlob)(mask), `mask.${(0, utils_1.dataUrlToExtension)(mask)}`);
        prompt && formData.append("prompt", prompt);
        n && formData.append("n", Math.max(n, 4).toString());
        size && formData.append("size", size);
        user && formData.append("user", user);
        const response = await this.fetcher(utils_1.EDIT_IMAGE_API_URL, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${this.openaiApiKey}`,
            },
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        const { data } = await response.json();
        const images = data.map((d) => d.url || d.b64_json);
        return { images };
    }
    async imageVariation(options) {
        const { image, n, size, user } = options;
        const formData = new FormData();
        formData.append("image", (0, utils_1.dataURLToBlob)(image), `image.${(0, utils_1.dataUrlToExtension)(image)}`);
        n && formData.append("n", Math.max(n, 4).toString());
        size && formData.append("size", size);
        user && formData.append("user", user);
        const response = await this.fetcher(utils_1.IMAGE_VARIATIONS_API_URL, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${this.openaiApiKey}`,
            },
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        const { data } = await response.json();
        const images = data.map((d) => d.url || d.b64_json);
        return { images };
    }
    async voiceChat(options) {
        const { transcribeAudioUrl, transcribeLanguage, transcribePrompt } = options;
        const { text } = await this.transcribe({
            audioUrl: transcribeAudioUrl,
            language: transcribeLanguage,
            prompt: transcribePrompt,
        });
        const { chatMessages, chatTemplate, chatInputs } = options;
        const messages = [...(chatMessages || []), { role: "user", content: text }];
        const chatResult = await this.chat({
            messages,
            template: chatTemplate,
            inputs: chatInputs,
        });
        const { choices } = chatResult;
        const { speakModelId, speechVoideId, speechVoiceSettings } = options;
        const { audioUrl } = await this.speak({
            text: choices[0].message.content,
            model_id: speakModelId,
            voice_id: speechVoideId,
            voice_settings: speechVoiceSettings,
        });
        return {
            audioUrl,
            messages: [
                { role: "user", content: text },
                { role: "assistant", content: choices[0].message.content },
            ],
        };
    }
    async callReplicate(options) {
        const { version, input, timeout = 10000 } = options;
        if (!input) {
            throw (0, utils_1.makeErrorResponse)("'input' is required", 400);
        }
        // Create Prediction Model
        const createPredictionResponse = await this.fetcher(utils_1.REPLICATE_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${this.replicateApiKey}`,
            },
            body: JSON.stringify({
                version: version,
                input: input,
            }),
        });
        if (!createPredictionResponse.ok) {
            throw (0, utils_1.makeErrorResponse)(await createPredictionResponse.text());
        }
        const { id: prediction_id } = await createPredictionResponse.json();
        const GET_PREDICTION_URL = utils_1.REPLICATE_API_URL + "/" + prediction_id;
        // Wait for 10 seconds(by default) to run the model
        const sleep = async (milliseconds) => {
            await new Promise((resolve) => {
                return setTimeout(resolve, milliseconds);
            });
        };
        await sleep(timeout);
        const statusResponse = await this.fetcher(GET_PREDICTION_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${this.replicateApiKey}`,
            },
        });
        if (!statusResponse.ok) {
            throw new Error(await statusResponse.text());
        }
        const getResponse = await statusResponse.json();
        if (getResponse && getResponse.status === "succeeded") {
            return {
                id: getResponse.id,
                urls: getResponse.urls,
                status: getResponse.status,
                output: getResponse.output,
                metrics: getResponse.metrics,
            };
        }
        else {
            return {
                output: "Training Not Completed! Please increase the value of timeout and try again.",
            };
        }
    }
}
exports.LLMService = LLMService;
function createLLMService(options = {}) {
    return new LLMService(options);
}
exports.createLLMService = createLLMService;
