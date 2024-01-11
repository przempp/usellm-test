import { ChatStreamCallback, LLMChatResult, ScoreEmbeddingsOptions } from "./types";
export declare const CHAT_COMPLETIONS_API_URL = "https://api.openai.com/v1/chat/completions";
export declare const AUDIO_TRANSCRIPTIONS_API_URL = "https://api.openai.com/v1/audio/transcriptions";
export declare const EMBEDDINGS_API_URL = "https://api.openai.com/v1/embeddings";
export declare const getTextToSpeechApiUrl: (voice_id: string) => string;
export declare const ELVEN_LABS_DEFAULT_MODEL_ID = "eleven_monolingual_v1";
export declare const ELVEN_LABS_DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
export declare const IMAGE_GENERATION_API_URL = "https://api.openai.com/v1/images/generations";
export declare const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
export declare const EDIT_IMAGE_API_URL = "https://api.openai.com/v1/images/edits";
export declare const IMAGE_VARIATIONS_API_URL = "https://api.openai.com/v1/images/variations";
export declare class ResponseError extends Error {
    status?: number;
}
export declare function makeErrorResponse(message: string, status?: number): ResponseError;
export declare function streamOpenAIResponse(response: Response, callback?: ChatStreamCallback): Promise<LLMChatResult>;
export declare function fillPrompt(str: string, data?: object): string;
export declare function dataURLToBlob(dataurl: string): Blob;
export declare function dataUrlToExtension(dataURL: string): string;
export declare function cosineSimilarity(vecA: number[], vecB: number[]): number;
export declare function scoreEmbeddings(options: ScoreEmbeddingsOptions): {
    score: number;
    index: number;
}[];
