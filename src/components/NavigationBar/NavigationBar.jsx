import { Braces, Moon, RotateCcw, Search, Sun, X } from "lucide-react";
import styles from "./styles.module.css";

function NavigationBar({ darkMode, searchQuery, setSearchQuery, setDarkMode, handleReset }) {
    return (
        <header className={styles.navbar}>
            <div className={styles.brand}>
                <span className={styles.logo}><Braces /></span>
                <h1 className={styles.heading}><b>JSON</b>Flow</h1>
            </div>
            <div className={styles.navControls}>
                <div className={styles.search}>
                    <Search className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Search by path, e.g. $.contact.email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        spellCheck={false}
                    />
                    {searchQuery && (
                        <button className={styles.clearButton} onClick={() => setSearchQuery("")} title="Clear search" aria-label="Clear search">
                            <X />
                        </button>
                    )}
                </div>
                <button
                    className={styles.iconButton}
                    onClick={() => setDarkMode(!darkMode)}
                    title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {darkMode ? <Sun /> : <Moon />}
                </button>
                <button className={styles.button} onClick={handleReset} title="Clear the input and graph">
                    <RotateCcw /> Reset
                </button>
            </div>
        </header>
    );
}

export default NavigationBar;
