const WRAPPER = /^\s*(?:export\s+default\s+|module\.exports\s*=\s*|(?:const|let|var)\s+[\w$]+\s*(?::[^=]+)?=\s*)/;
const NUMBER = /[+-]?(?:0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+|Infinity|NaN|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/y;
const IDENTIFIER = /[A-Za-z_$][\w$]*/y;
const NEW_DATE = /new\s+Date\(\s*(?:(["'`])((?:\\.|(?!\1).)*)\1)?\s*\)/y;
const KEY_AHEAD = /[ \t\r\n]*(?:[A-Za-z_$][\w$]*|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')[ \t]*:/y;
const OPENERS = { "{": "}", "[": "]", "(": ")" };
const CLOSERS = new Set(["}", "]", ")"]);
const QUOTES = new Set(['"', "'", "`"]);
const ESCAPES = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", v: "\v", 0: "\0" };
const KEYWORDS = { true: true, false: false, null: null, undefined: null, Infinity: Infinity, NaN: NaN };

/**
 * Fault-tolerant parser for JSON and JavaScript object literals.
 * Returns every value it could read plus the character ranges of broken parts.
 */
export function parseInput(text) {
    const n = text.length;
    const errors = [];
    let i = 0;

    const addError = (start, end, message) => errors.push({ start, end: Math.max(end, start + 1), message });

    const trimEnd = (pos) => {
        while (pos > 0 && /\s/.test(text[pos - 1])) pos--;
        return pos;
    };

    const looksLikeKey = (pos) => {
        KEY_AHEAD.lastIndex = pos;
        return KEY_AHEAD.test(text);
    };

    const skipSpace = () => {
        while (i < n) {
            if (/\s/.test(text[i])) i++;
            else if (text.startsWith("//", i)) {
                while (i < n && text[i] !== "\n") i++;
            } else if (text.startsWith("/*", i)) {
                const end = text.indexOf("*/", i + 2);
                i = end < 0 ? n : end + 2;
            } else break;
        }
    };

    const skipQuoted = (p) => {
        const quote = text[p++];
        while (p < n) {
            if (text[p] === "\\") p += 2;
            else if (text[p] === quote) return p + 1;
            else if (text[p] === "\n" && quote !== "`") return p;
            else p++;
        }
        return n;
    };

    // Finds where the broken part ends: the next "," or closing bracket at the same depth,
    // or (inside objects) a line break followed by something that looks like the next key.
    const skipToSync = (from, inObject) => {
        let p = from;
        const stack = [];
        while (p < n) {
            const ch = text[p];
            if (QUOTES.has(ch)) {
                p = skipQuoted(p);
                continue;
            }
            if (text.startsWith("//", p)) {
                while (p < n && text[p] !== "\n") p++;
                continue;
            }
            if (text.startsWith("/*", p)) {
                const end = text.indexOf("*/", p + 2);
                p = end < 0 ? n : end + 2;
                continue;
            }
            if (stack.length === 0) {
                if (ch === "," || CLOSERS.has(ch)) return p;
                if (ch === "\n" && inObject && looksLikeKey(p + 1)) return p;
            }
            if (OPENERS[ch]) stack.push(OPENERS[ch]);
            else if (CLOSERS.has(ch)) stack.pop();
            p++;
        }
        return n;
    };

    const readString = () => {
        const start = i;
        const quote = text[i++];
        let out = "";
        const fail = (message) => {
            i = skipQuoted(start);
            return { ok: false, message };
        };
        while (i < n) {
            const ch = text[i];
            if (ch === quote) {
                i++;
                return { ok: true, value: out };
            }
            if (ch === "\n" && quote !== "`") break;
            if (quote === "`" && ch === "$" && text[i + 1] === "{") return fail("Template expressions are not supported");
            if (ch === "\\") {
                const next = text[i + 1];
                if (next === undefined) break;
                if (next === "u" || next === "x") {
                    const len = next === "u" ? 4 : 2;
                    const hex = text.slice(i + 2, i + 2 + len);
                    if (!new RegExp(`^[\\da-fA-F]{${len}}$`).test(hex)) return fail(`Invalid \\${next} escape`);
                    out += String.fromCharCode(parseInt(hex, 16));
                    i += 2 + len;
                    continue;
                }
                if (next === "\n" || next === "\r") {
                    i += next === "\r" && text[i + 2] === "\n" ? 3 : 2;
                    continue;
                }
                out += ESCAPES[next] ?? next;
                i += 2;
                continue;
            }
            out += ch;
            i++;
        }
        return { ok: false, message: "Unterminated string" };
    };

    const readNumber = () => {
        NUMBER.lastIndex = i;
        const match = NUMBER.exec(text);
        if (!match) return null;
        const end = NUMBER.lastIndex;
        if (end < n && /[\w$.]/.test(text[end])) {
            i = end;
            while (i < n && /[\w$.]/.test(text[i])) i++;
            return { ok: false, message: "Invalid number" };
        }
        i = end;
        const raw = match[0];
        const sign = raw[0] === "-" ? -1 : 1;
        return { ok: true, value: sign * Number(raw.replace(/^[+-]/, "")) };
    };

    const readIdentifier = () => {
        IDENTIFIER.lastIndex = i;
        const match = IDENTIFIER.exec(text);
        if (!match) return null;
        i = IDENTIFIER.lastIndex;
        return match[0];
    };

    const readKey = () => {
        const ch = text[i];
        if (QUOTES.has(ch)) {
            const res = readString();
            return res.ok ? res.value : null;
        }
        const id = readIdentifier();
        if (id !== null) return id;
        const num = readNumber();
        return num && num.ok ? String(num.value) : null;
    };

    const parseValue = () => {
        const ch = text[i];
        if (ch === "{") return { ok: true, value: parseObject() };
        if (ch === "[") return { ok: true, value: parseArray() };
        if (QUOTES.has(ch)) return readString();
        if (/[-+\d.]/.test(ch)) {
            const num = readNumber();
            if (num) return num;
        }
        const start = i;
        const word = readIdentifier();
        if (word === null) {
            i++;
            return { ok: false, message: `Unexpected character "${ch}"` };
        }
        if (word in KEYWORDS) return { ok: true, value: KEYWORDS[word] };
        if (word === "new") {
            NEW_DATE.lastIndex = start;
            const match = NEW_DATE.exec(text);
            if (match) {
                i = NEW_DATE.lastIndex;
                return { ok: true, value: match[2] ?? new Date().toISOString() };
            }
        }
        return { ok: false, message: `Unknown value "${word}"` };
    };

    function parseObject() {
        const open = i++;
        const obj = {};
        while (true) {
            skipSpace();
            if (i >= n) {
                addError(open, open + 1, "Unclosed '{'");
                return obj;
            }
            const ch = text[i];
            if (ch === "}") {
                i++;
                return obj;
            }
            if (CLOSERS.has(ch)) {
                addError(open, open + 1, "Unclosed '{'");
                return obj;
            }
            if (ch === ",") {
                addError(i, i + 1, "Unexpected ','");
                i++;
                continue;
            }

            const entryStart = i;
            let recovered = false;
            const recover = (message) => {
                let end = skipToSync(i, true);
                if (end === entryStart) end++;
                addError(entryStart, trimEnd(end), message);
                i = end;
                recovered = true;
            };

            const key = readKey();
            if (key === null) {
                recover("Invalid key");
            } else {
                skipSpace();
                if (text[i] !== ":") {
                    recover(`Missing ':' after "${key}"`);
                } else {
                    const colonEnd = ++i;
                    skipSpace();
                    const missing =
                        i >= n || text[i] === "," || CLOSERS.has(text[i]) ||
                        (text.slice(colonEnd, i).includes("\n") && looksLikeKey(i));
                    if (missing) {
                        addError(entryStart, colonEnd, `Missing value for "${key}"`);
                        recovered = true;
                    } else {
                        const res = parseValue();
                        if (res.ok) obj[key] = res.value;
                        else recover(`${res.message} in "${key}"`);
                    }
                }
            }

            skipSpace();
            if (text[i] === ",") {
                i++;
                continue;
            }
            if (i >= n || CLOSERS.has(text[i]) || recovered) continue;
            addError(entryStart, trimEnd(i), `Missing ',' after "${key}"`);
        }
    }

    function parseArray() {
        const open = i++;
        const arr = [];
        while (true) {
            skipSpace();
            if (i >= n) {
                addError(open, open + 1, "Unclosed '['");
                return arr;
            }
            const ch = text[i];
            if (ch === "]") {
                i++;
                return arr;
            }
            if (CLOSERS.has(ch)) {
                addError(open, open + 1, "Unclosed '['");
                return arr;
            }
            if (ch === ",") {
                addError(i, i + 1, "Empty item in array");
                i++;
                continue;
            }

            const start = i;
            let recovered = false;
            const res = parseValue();
            if (res.ok) {
                arr.push(res.value);
            } else {
                let end = skipToSync(i, false);
                if (end === start) end++;
                addError(start, trimEnd(end), res.message);
                i = end;
                recovered = true;
            }

            skipSpace();
            if (text[i] === ",") {
                i++;
                continue;
            }
            if (i >= n || CLOSERS.has(text[i]) || recovered) continue;
            addError(start, trimEnd(i), "Missing ',' after this item");
        }
    }

    const wrapper = WRAPPER.exec(text);
    i = wrapper ? wrapper[0].length : 0;
    skipSpace();

    let value;
    if (i < n) {
        const start = i;
        const res = parseValue();
        if (res.ok) value = res.value;
        else addError(start, trimEnd(skipToSync(i, false)), res.message);

        skipSpace();
        if (text[i] === ";") {
            i++;
            skipSpace();
        }
        if (i < n) addError(i, trimEnd(n), "Unexpected content after the end");
    }

    errors.sort((a, b) => a.start - b.start);
    for (const err of errors) err.line = text.slice(0, err.start).split("\n").length;

    return { value, errors };
}
