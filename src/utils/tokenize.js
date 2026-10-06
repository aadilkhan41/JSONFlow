const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`(?:[^`\\]|\\.)*`?)|([A-Za-z_$][\w$]*)|(-?(?:0[xX][\da-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?))|([{}])|([[\]])|(\s+)|([\s\S])/y;
const KEY_COLON = /\s*:/y;

const WORD_TYPES = {
    true: "boolean",
    false: "boolean",
    null: "null",
    undefined: "null",
    Infinity: "number",
    NaN: "number",
    const: "keyword",
    let: "keyword",
    var: "keyword",
    export: "keyword",
    default: "keyword",
    module: "keyword",
    exports: "keyword",
    new: "keyword",
    Date: "keyword",
};

const isKey = (text, end) => {
    KEY_COLON.lastIndex = end;
    return KEY_COLON.test(text);
};

/** Splits JSON / JavaScript object text into typed tokens for syntax colouring. */
export function tokenize(text) {
    const tokens = [];
    TOKEN.lastIndex = 0;
    let match;
    while (TOKEN.lastIndex < text.length && (match = TOKEN.exec(text))) {
        const start = match.index;
        const end = TOKEN.lastIndex;
        const [, comment, string, word, number, brace, bracket] = match;
        let type = "plain";
        if (comment) type = "comment";
        else if (string) type = isKey(text, end) ? "key" : "string";
        else if (word) type = isKey(text, end) ? "key" : WORD_TYPES[word] ?? "plain";
        else if (number) type = "number";
        else if (brace) type = "brace";
        else if (bracket) type = "bracket";
        else if (/[:,;()=]/.test(match[0])) type = "punctuation";
        tokens.push({ start, end, type });
    }
    return tokens;
}
