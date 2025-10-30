import { Network } from "lucide-react";
import styles from "./styles.module.css";

function JsonField({ jsonInput, setJsonInput, handleVisualize, error, darkMode }) {
    return (<div className={darkMode ? `${styles.container} ${styles.dark}` : styles.container}>
        <textarea
            className={darkMode ? `${styles.textarea} ${styles.dark}` : styles.textarea}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
        />
        {error && <div className={styles.error}>{error}</div>}
        <button className={darkMode ? `${styles.buttonStyle} ${styles.dark}` : styles.buttonStyle} onClick={handleVisualize}>
            Visualize <Network />
        </button>
    </div>);
}

export default JsonField;