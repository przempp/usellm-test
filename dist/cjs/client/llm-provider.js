"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProvider = exports.LLMContext = void 0;
const react_1 = require("react");
exports.LLMContext = (0, react_1.createContext)({});
function LLMProvider({ children, serviceUrl, }) {
    return (0, react_1.createElement)(exports.LLMContext.Provider, { value: { serviceUrl } }, children);
}
exports.LLMProvider = LLMProvider;
