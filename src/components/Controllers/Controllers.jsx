import { useReactFlow } from "reactflow";
import { Maximize, Minus, Plus } from "lucide-react";
import styles from "./styles.module.css";

function Controllers() {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    return (<div className={styles.controls}>
        <button className={styles.buttonStyle} onClick={() => zoomIn()} title="Zoom in" aria-label="Zoom in"><Plus /></button>
        <button className={styles.buttonStyle} onClick={() => zoomOut()} title="Zoom out" aria-label="Zoom out"><Minus /></button>
        <span className={styles.divider} />
        <button className={styles.buttonStyle} onClick={() => fitView({ duration: 300 })} title="Fit to screen" aria-label="Fit to screen"><Maximize /></button>
    </div>);
}

export default Controllers;
