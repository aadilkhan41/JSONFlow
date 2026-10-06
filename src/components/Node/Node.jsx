import { Handle, Position } from "reactflow";
import styles from "./styles.module.css";

function copyPath(path) {
    navigator.clipboard.writeText(path);
    alert(`JSON Path Copied: ${path}`);
}

const Node = ({ data }) => {
    const isGroup = data.kind === "group";
    return (
        <div
            className={isGroup ? `${styles.node} ${styles.group}` : styles.node}
            onClick={isGroup ? undefined : () => copyPath(data.path)}
            title={isGroup ? undefined : data.path}
            style={{
                background: data.isHighlighted && !isGroup ? "#1E3A8A" : data.bgColor,
                color: data.color,
                border: data.isHighlighted ? "2px solid #60A5FA" : "2px solid #485A74",
            }}
        >
            {data.hasParent && <Handle className={styles.handle} type="target" position={Position.Left} />}
            {isGroup ? (
                data.rows.map((row) => (
                    <div
                        key={row.path}
                        className={row.path === data.activePath ? `${styles.row} ${styles.activeRow}` : styles.row}
                        onClick={() => copyPath(row.path)}
                        title={`${row.path}: ${row.value}`}
                    >
                        <span className={styles.label}>{row.key}: </span>
                        <span style={{ color: row.color }}>{row.value}</span>
                    </div>
                ))
            ) : (
                <div>{data.label}</div>
            )}
            {data.hasChildren && <Handle className={styles.handle} type="source" position={Position.Right} />}
        </div>
    );
};

export default Node;
