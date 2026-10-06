import { useState } from "react";
import "reactflow/dist/style.css";
import NavigationBar from "./components/NavigationBar/NavigationBar";
import JsonField from "./components/JsonField/JsonField";
import { ReactFlowProvider } from "reactflow";
import JsonTreeVisualizer from "./components/JsonTreeVisualizer/JsonTreeVisualizer";
import styles from "./JsonTreeFlow.module.css";
import { parseInput } from "./utils/parseInput";

const sampleJSON = {
    userId: 1001,
    name: "John Doe",
    isActive: true,
    balance: 5420.75,
    contact: {
        email: "john.doe@example.com",
        phone: "+1-202-555-0198",
        address: {
            street: "123 Maple Avenue",
            city: "Springfield",
            state: "Illinois",
            zip: "62704",
            coordinates: {
                lat: 39.7817,
                lng: -89.6501,
            },
        },
    },
    orders: [
        {
            orderId: "ORD-001",
            date: "2025-10-01",
            total: 299.99,
            items: [
                { product: "Laptop", quantity: 1, price: 299.99 },
            ],
            shipping: {
                method: "Express",
                delivered: true,
            },
        },
        {
            orderId: "ORD-002",
            date: "2025-10-10",
            total: 79.5,
            items: [
                { product: "Keyboard", quantity: 2, price: 39.75 },
            ],
            shipping: {
                method: "Standard",
                delivered: false,
            },
        },
    ],
    settings: {
        theme: "light",
        language: "en",
        privacy: {
            shareLocation: false,
            showProfile: true,
        },
    },
    lastLogin: new Date("2025-10-29T15:30:00Z"),
};

function JsonTreeFlow() {
    const [jsonInput, setJsonInput] = useState(JSON.stringify(sampleJSON, null, 4));
    const [error, setError] = useState("");
    const [parsedJson, setParsedJson] = useState(sampleJSON);
    const [searchQuery, setSearchQuery] = useState("");
    const [darkMode, setDarkMode] = useState(true);

    const handleVisualize = () => {
        try {
            const parsed = parseInput(jsonInput);
            setParsedJson(parsed);
            setError("");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleReset = () => {
        setJsonInput("");
        setParsedJson({});
        setSearchQuery("");
        setError("");
    };

    return (
        <div className={styles.appCont} >
            <NavigationBar darkMode={darkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setDarkMode={setDarkMode} handleReset={handleReset} />
            <article>
                <JsonField jsonInput={jsonInput} setJsonInput={setJsonInput} handleVisualize={handleVisualize} error={error} darkMode={darkMode} />
                <section>
                    <ReactFlowProvider>
                        <JsonTreeVisualizer
                            jsonData={parsedJson}
                            searchQuery={searchQuery}
                            darkMode={darkMode}
                        />
                    </ReactFlowProvider>
                </section>
            </article>
        </div>
    );
}

export default JsonTreeFlow;