import { cosineSimilarity, scoreEmbeddings } from "../shared/utils";
import { CreateLLMServiceOptions, LLMAction, LLMServiceChatOptions, LLMServiceEditImageOptions, LLMServiceEmbedOptions, LLMServiceGenerateImageOptions, LLMServiceHandleOptions, LLMServiceHandleResponse, LLMServiceImageVariationOptions, LLMServiceSpeakOptions, LLMServiceTemplate, LLMServiceTranscribeOptions, LLMServiceVoiceChatOptions, LLMServiceCallReplicateOptions } from "./types";
import { OpenAIMessage } from "../shared/types";
export declare class LLMService {
    templates: {
        [id: string]: LLMServiceTemplate;
    };
    openaiApiKey: string;
    elvenLabsApiKey: string;
    replicateApiKey: string;
    fetcher: typeof fetch;
    debug: boolean;
    actions: string[];
    isAllowed: (options: LLMServiceHandleOptions) => boolean | Promise<boolean>;
    customActions: {
        [id: string]: LLMAction;
    };
    cosineSimilarity: typeof cosineSimilarity;
    scoreEmbeddings: typeof scoreEmbeddings;
    constructor({ openaiApiKey, elvenLabsApiKey, replicateApiKey, fetcher, templates, debug, isAllowed, actions, }: CreateLLMServiceOptions);
    registerTemplate(template: LLMServiceTemplate): void;
    registerAction(id: string, action: LLMAction): void;
    callAction(action: string, body?: {}): Promise<any>;
    prepareChatBody(body: LLMServiceChatOptions): {
        messages: OpenAIMessage[];
        stream: boolean | undefined;
        user: string | undefined;
        model: string;
        temperature: number;
        top_p: number | undefined;
        n: number | undefined;
        max_tokens: number;
        presence_penalty: number | undefined;
        frequency_penalty: number | undefined;
        logit_bias: number | undefined;
    };
    handle({ body, request, }: LLMServiceHandleOptions): Promise<LLMServiceHandleResponse>;
    chat(body: LLMServiceChatOptions): Promise<LLMServiceHandleResponse>;
    embed(options: LLMServiceEmbedOptions): Promise<{
        embeddings: any;
    }>;
    transcribe(options: LLMServiceTranscribeOptions): Promise<any>;
    speak(options: LLMServiceSpeakOptions): Promise<{
        audioUrl: string;
    }>;
    generateImage(options: LLMServiceGenerateImageOptions): Promise<{
        images: any;
    }>;
    editImage(options: LLMServiceEditImageOptions): Promise<{
        images: any;
    }>;
    imageVariation(options: LLMServiceImageVariationOptions): Promise<{
        images: any;
    }>;
    voiceChat(options: LLMServiceVoiceChatOptions): Promise<{
        audioUrl: string;
        messages: {
            role: string;
            content: any;
        }[];
    }>;
    callReplicate(options: LLMServiceCallReplicateOptions): Promise<{
        id: any;
        urls: any;
        status: any;
        output: any;
        metrics: any;
    } | {
        output: string;
        id?: undefined;
        urls?: undefined;
        status?: undefined;
        metrics?: undefined;
    }>;
}
export declare function createLLMService(options?: CreateLLMServiceOptions): LLMService;
