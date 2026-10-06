import { useRef } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { tokenize } from "../../utils/tokenize";
import styles from "./styles.module.css";

const MAX_LISTED_ERRORS = 3;

function renderHighlighted(text, errors) {
    const parts = [];
    let r = 0;
    for (const token of tokenize(text)) {
        let pos = token.start;
        while (pos < token.end) {
            while (r < errors.length && errors[r].end <= pos) r++;
            const range = errors[r];
            const inError = range && range.start <= pos;
            const next = Math.min(token.end, range ? (inError ? range.end : range.start) : token.end);
            const className = [styles[token.type], inError && styles.errorText].filter(Boolean).join(" ");
            const content = text.slice(pos, next);
            parts.push(className ? <span key={parts.length} className={className}>{content}</span> : content);
            pos = next;
        }
    }
    // A trailing newline in a <pre> collapses unless followed by content.
    parts.push("\n");
    return parts;
}

function JsonField({ jsonInput, setJsonInput, errors, darkMode }) {
    const highlightsRef = useRef(null);
    const dark = darkMode ? ` ${styles.dark}` : "";

    const syncScroll = (e) => {
        highlightsRef.current.scrollTop = e.target.scrollTop;
        highlightsRef.current.scrollLeft = e.target.scrollLeft;
    };

    const isEmpty = !jsonInput.trim();
    const status = isEmpty
        ? { label: "Empty", className: styles.badgeMuted }
        : errors.length
            ? { label: `${errors.length} error${errors.length > 1 ? "s" : ""}`, className: styles.badgeError }
            : { label: "Valid", className: styles.badgeSuccess };

    return (<aside className={styles.container}>
        <div className={styles.header}>
            <span className={styles.title}>Input</span>
            <span className={`${styles.badge} ${status.className}`}>
                {!isEmpty && (errors.length ? <CircleAlert /> : <CircleCheck />)}
                {status.label}
            </span>
        </div>
        <div className={styles.editor}>
            <pre ref={highlightsRef} className={styles.highlights + dark} aria-hidden="true">
                {renderHighlighted(jsonInput, errors)}
            </pre>
            <textarea
                className={styles.textarea + dark}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                onScroll={syncScroll}
                spellCheck={false}
                placeholder="Paste JSON or a JavaScript object..."
            />
        </div>
        {errors.length > 0 && (
            <ul className={styles.errorList}>
                {errors.slice(0, MAX_LISTED_ERRORS).map((err, idx) => (
                    <li key={idx}>
                        <span className={styles.errorLine}>Ln {err.line}</span>
                        {err.message}
                    </li>
                ))}
                {errors.length > MAX_LISTED_ERRORS && (
                    <li className={styles.errorMore}>+{errors.length - MAX_LISTED_ERRORS} more</li>
                )}
            </ul>
        )}
    </aside>);
}

export default JsonField;
