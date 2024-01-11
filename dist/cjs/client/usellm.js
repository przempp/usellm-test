"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const utils_1 = require("../shared/utils");
const llm_provider_1 = require("./llm-provider");
function useLLM({ serviceUrl: argServiceUrl, fetcher = fetch, } = {}) {
    const { serviceUrl: contextServiceUrl } = (0, react_1.useContext)(llm_provider_1.LLMContext);
    const serviceUrl = argServiceUrl || contextServiceUrl || "";
    if (!serviceUrl) {
        throw new Error("No serviceUrl provided. Provide one or use LLMProvider to set it globally.");
    }
    async function chat({ messages = [], stream = false, template, inputs, onStream, }) {
        const response = await fetcher(`${serviceUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages,
                stream,
                $action: "chat",
                template,
                inputs,
            }),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        if (stream) {
            return (0, utils_1.streamOpenAIResponse)(response, onStream);
        }
        else {
            const resJson = await response.json();
            const message = resJson.choices[0].message;
            return { message };
        }
    }
    const recordingRef = (0, react_1.useRef)(null);
    async function record({ deviceId } = {}) {
        const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: deviceId ? { deviceId } : true,
        });
        const mediaRecorder = new MediaRecorder(audioStream);
        const audioChunks = [];
        recordingRef.current = { mediaRecorder, audioChunks, audioStream };
        mediaRecorder.addEventListener("dataavailable", (event) => {
            audioChunks.push(event.data);
        });
        mediaRecorder.start();
    }
    async function stopRecording() {
        return new Promise((resolve, reject) => {
            if (!recordingRef.current) {
                reject("No recording in progress");
                return;
            }
            const { mediaRecorder, audioChunks, audioStream } = recordingRef.current;
            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, {
                    type: "audio/ogg; codecs=opus",
                });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result;
                    resolve({ audioUrl: base64data });
                };
                reader.readAsDataURL(audioBlob);
            });
            mediaRecorder.stop();
            audioStream.getTracks().forEach((track) => track.stop());
        });
    }
    async function transcribe({ audioUrl, language, prompt, }) {
        const response = await fetcher(`${serviceUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                audioUrl,
                language,
                prompt,
                $action: "transcribe",
            }),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }
    async function embed({ input, user }) {
        const response = await fetcher(`${serviceUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                input,
                user,
                $action: "embed",
            }),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }
    async function speak(options) {
        const response = await fetcher(`${serviceUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.assign(Object.assign({}, options), { $action: "speak" })),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }
    async function generateImage(options) {
        const response = await fetcher(`${serviceUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.assign(Object.assign({}, options), { $action: "generateImage" })),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }
    async function editImage(options) {
        const { imageUrl, maskUrl, prompt, n, size } = options;
        const response = await fetcher(`${serviceUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                n,
                size,
                image: imageUrl,
                mask: maskUrl,
                $action: "editImage",
            }),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }
    async function imageVariation(options) {
        const { imageUrl, n, size } = options;
        const response = await fetcher(`${serviceUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                image: imageUrl,
                n: n,
                size: size,
                $action: "imageVariation",
            }),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }
    async function fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    async function imageToDataURL(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(img, 0, 0, img.width, img.height);
                const dataUrl = canvas.toDataURL("image/png");
                resolve(dataUrl);
            };
            img.onerror = reject;
        });
    }
    async function voiceChat(options) {
        return callAction("voiceChat", options);
    }
    async function callAction(action, options) {
        const response = await fetcher(serviceUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.assign(Object.assign({}, options), { $action: action })),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }
    async function callReplicate(options) {
        return callAction("callReplicate", options);
    }
    return {
        callAction,
        chat,
        voiceChat,
        record,
        stopRecording,
        transcribe,
        embed,
        cosineSimilarity: utils_1.cosineSimilarity,
        scoreEmbeddings: utils_1.scoreEmbeddings,
        speak,
        generateImage,
        fileToDataURL,
        imageToDataURL,
        editImage,
        imageVariation,
        callReplicate,
    };
}
exports.default = useLLM;
