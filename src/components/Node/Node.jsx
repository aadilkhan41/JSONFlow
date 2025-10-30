import { Handle, Position } from "reactflow";
import styles from "./styles.module.css";

function copyPath(data) {
    navigator.clipboard.writeText(data.path);
    alert(`JSON Path Copied: ${data.path}`);
}

const Node = ({ data }) => (
    <div className={styles.node} onClick={() => copyPath(data)} title={`${data.path}: ${data.label.data || ""}`}
        style={{
            background: data.isHighlighted ? "#1E3A8A" : data.bgColor,
            color: data.color,
            border: data.isHighlighted ? "3px solid #60A5FA" : "2px solid #485A74",
        }}
    >
        {data.hasParent && <Handle className={styles.handle} type="target" position={Position.Left} />}
        <div>
            <span className={styles.label}>
                {data.label.key}
                {data.label.key === "" || data.label.key == undefined ? "" : ": "}
            </span>
            <span>{data.label.data}</span>
        </div>
        {data.hasChildren && <Handle className={styles.handle} type="source" position={Position.Right} />}
    </div>
);

export default Node;