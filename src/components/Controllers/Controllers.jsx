import { useEffect } from "react";
import { useReactFlow } from "reactflow";
import { handleSaveAsImage } from "../../utils/utils";
import { ImageDown, Maximize, Minus, Plus } from "lucide-react";
import styles from "./styles.module.css";

function Controllers({ darkMode, reactFlowWrapper, setElements, searchQuery, setSearchResult }) {
    const { zoomIn, zoomOut, fitView, setCenter } = useReactFlow();

    useEffect(() => {
        if (!searchQuery.trim()) return;
        let found = false;
        setElements((prev) => {
            const updatedNodes = prev.nodes.map((node) => {
                if (node.data.path === searchQuery.trim()) {
                    found = true;
                    setTimeout(() => {
                        setCenter(node.position.x, node.position.y, {
                            zoom: 1.5,
                            duration: 1000,
                        });
                    }, 200);
                    return { ...node, data: { ...node.data, isHighlighted: true } };
                }
                return { ...node, data: { ...node.data, isHighlighted: false } };
            });
            return { ...prev, nodes: updatedNodes };
        });
        setSearchResult(found ? "Match found!" : "Oops No match found");
    }, [searchQuery, setCenter]);

    return (<div className={styles.controls}>
        <button className={darkMode? `${styles.buttonStyle} ${styles.dark}` : styles.buttonStyle} onClick={zoomIn}><Plus /></button>
        <button className={darkMode? `${styles.buttonStyle} ${styles.dark}` : styles.buttonStyle} onClick={zoomOut}><Minus /></button>
        <button className={darkMode? `${styles.buttonStyle} ${styles.dark}` : styles.buttonStyle} onClick={fitView}><Maximize /></button>
        <button className={darkMode? `${styles.buttonStyle} ${styles.dark}` : styles.buttonStyle} onClick={() => handleSaveAsImage(reactFlowWrapper)}><ImageDown /></button>
    </div>);
}

export default Controllers;