/// <reference types="react" />
interface LLMContextValue {
    serviceUrl?: string;
}
export declare const LLMContext: import("react").Context<LLMContextValue>;
export declare function LLMProvider({ children, serviceUrl, }: LLMContextValue & {
    children: React.ReactNode;
}): import("react").FunctionComponentElement<import("react").ProviderProps<LLMContextValue>>;
export {};
