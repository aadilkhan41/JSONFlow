import { useEffect } from "react";
import { useReactFlow } from "reactflow";
import { Maximize, Minus, Plus } from "lucide-react";
import styles from "./styles.module.css";

function Controllers({ setElements, searchQuery, setSearchResult }) {
    const { zoomIn, zoomOut, fitView, setCenter } = useReactFlow();

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResult("");
            return;
        }
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
        setSearchResult(found ? "Match found" : "No match for this path");
    }, [searchQuery, setCenter, setElements, setSearchResult]);

    return (<div className={styles.controls}>
        <button className={styles.buttonStyle} onClick={() => zoomIn()} title="Zoom in" aria-label="Zoom in"><Plus /></button>
        <button className={styles.buttonStyle} onClick={() => zoomOut()} title="Zoom out" aria-label="Zoom out"><Minus /></button>
        <span className={styles.divider} />
        <button className={styles.buttonStyle} onClick={() => fitView({ duration: 300 })} title="Fit to screen" aria-label="Fit to screen"><Maximize /></button>
    </div>);
}

export default Controllers;