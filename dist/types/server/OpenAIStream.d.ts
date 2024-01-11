export interface OpenAIStreamOptions {
    body: object;
    openaiApiKey?: string;
    fetcher?: typeof fetch;
}
export default function OpenAIStream(options: OpenAIStreamOptions): Promise<ReadableStream<any>>;
