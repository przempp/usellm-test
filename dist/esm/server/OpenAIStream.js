var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { createParser, } from "./eventsource-parser";
import { CHAT_COMPLETIONS_API_URL } from "../shared/utils";
export default async function OpenAIStream(options) {
    const { body, openaiApiKey, fetcher = fetch } = options;
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const res = await fetcher(CHAT_COMPLETIONS_API_URL, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
        },
        method: "POST",
        body: JSON.stringify(body),
    });
    if (res.status != 200 || !res.body) {
        throw new Error(await res.text());
    }
    const stream = new ReadableStream({
        async start(controller) {
            var _a, e_1, _b, _c;
            const onParse = (event) => {
                if (event.type === "event") {
                    const data = event.data;
                    if (data === "[DONE]") {
                        controller.close();
                        return;
                    }
                    try {
                        const json = JSON.parse(data);
                        const text = json.choices[0].delta.content;
                        const queue = encoder.encode(text);
                        controller.enqueue(queue);
                    }
                    catch (e) {
                        controller.error(e);
                    }
                }
            };
            const parser = createParser(onParse);
            if (res.body) {
                try {
                    for (var _d = true, _e = __asyncValues(res.body), _f; _f = await _e.next(), _a = _f.done, !_a;) {
                        _c = _f.value;
                        _d = false;
                        try {
                            const chunk = _c;
                            parser.feed(decoder.decode(chunk));
                        }
                        finally {
                            _d = true;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        },
    });
    return stream;
}
