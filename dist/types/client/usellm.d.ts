import { cosineSimilarity, scoreEmbeddings } from "../shared/utils";
import { EditImageOptions, GenerateImageOptions, ImageVariationOptions, LLMCallActionOptions, LLMChatOptions, LLMEmbedOptions, LLMRecordOptions, LLMCallReplicateOptions, LLMTranscribeOptions, LLMVoiceChatOptions, SpeakOptions, UseLLMOptions } from "./types";
import { LLMChatResult } from "../shared/types";
export default function useLLM({ serviceUrl: argServiceUrl, fetcher, }?: UseLLMOptions): {
    callAction: (action: string, options: LLMCallActionOptions) => Promise<any>;
    chat: ({ messages, stream, template, inputs, onStream, }: LLMChatOptions) => Promise<LLMChatResult>;
    voiceChat: (options: LLMVoiceChatOptions) => Promise<any>;
    record: ({ deviceId }?: LLMRecordOptions) => Promise<void>;
    stopRecording: () => Promise<{
        audioUrl: string;
    }>;
    transcribe: ({ audioUrl, language, prompt, }: LLMTranscribeOptions) => Promise<any>;
    embed: ({ input, user }: LLMEmbedOptions) => Promise<any>;
    cosineSimilarity: typeof cosineSimilarity;
    scoreEmbeddings: typeof scoreEmbeddings;
    speak: (options: SpeakOptions) => Promise<any>;
    generateImage: (options: GenerateImageOptions) => Promise<any>;
    fileToDataURL: (file: File) => Promise<string>;
    imageToDataURL: (file: File) => Promise<string>;
    editImage: (options: EditImageOptions) => Promise<any>;
    imageVariation: (options: ImageVariationOptions) => Promise<any>;
    callReplicate: (options: LLMCallReplicateOptions) => Promise<any>;
};
