import JSON5 from "json5";

const stripWrapper = (input) =>
    input
        .trim()
        .replace(/^(export\s+default\s+|module\.exports\s*=\s*|(const|let|var)\s+[\w$]+\s*(:\s*[^=]+)?=\s*)/, "")
        .replace(/;\s*$/, "")
        .trim();

const normalizeJsValues = (input) =>
    input
        .replace(/new\s+Date\(\s*(["'`])(.*?)\1\s*\)/g, '"$2"')
        .replace(/new\s+Date\(\s*\)/g, `"${new Date().toISOString()}"`)
        .replace(/:\s*undefined\b/g, ": null")
        .replace(/`([^`$]*)`/g, (_, s) => JSON.stringify(s));

export function parseInput(input) {
    try {
        return JSON.parse(input);
    } catch {
        try {
            return JSON5.parse(normalizeJsValues(stripWrapper(input)));
        } catch (err) {
            throw new Error(`Invalid JSON or JavaScript object - ${err.message}`);
        }
    }
}
