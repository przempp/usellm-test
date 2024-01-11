"use client";
import { createContext, createElement } from "react";
export const LLMContext = createContext({});
export function LLMProvider({ children, serviceUrl, }) {
    return createElement(LLMContext.Provider, { value: { serviceUrl } }, children);
}
