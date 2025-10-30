import { Moon, Sun } from "lucide-react";
import styles from "./styles.module.css";

function NavigationBar({ darkMode, searchQuery, setSearchQuery, setDarkMode, handleReset }) {
    return (
        <div className={darkMode ? `${styles.navbar} ${styles.dark}` : styles.navbar}>
            <h2 className={darkMode ? `${styles.heading} ${styles.dark}` : styles.heading}><b>JSON</b>Flow</h2>
            <div className={styles.navControls}>
                <input
                    className={darkMode ? `${styles.searchInput} ${styles.dark}` : styles.searchInput}
                    type="text"
                    placeholder="Search by JSON path ($.user.name)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className={darkMode? `${styles.buttonStyle} ${styles.dark}` : styles.buttonStyle} onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? <Sun /> : <Moon />}
                </button>
                <button className={darkMode? `${styles.buttonStyle} ${styles.dark}` : styles.buttonStyle} onClick={handleReset}>Reset</button>
            </div>
        </div>
    );
}

export default NavigationBar;