import { useEffect, useMemo, useRef } from "react";
import ReactFlow, { Background, BackgroundVariant, useReactFlow } from "reactflow";
import { buildGraph } from "../../utils/buildGraph";
import styles from "./styles.module.css";
import Controllers from "../Controllers/Controllers";
import Node from "../Node/Node";

const FOCUS_ZOOM = 1.5;
const nodeTypes = { custom: Node };

function JsonTreeVisualizer({ jsonData, activePath, searchQuery, darkMode }) {
    const elements = useMemo(() => buildGraph(jsonData, darkMode), [jsonData, darkMode]);
    const { setCenter, getNode, getZoom } = useReactFlow();
    const focusedPathRef = useRef(null);

    const nodes = useMemo(
        () => elements.nodes.map((node) => {
            const hit = !!activePath && node.data.paths.includes(activePath);
            const nextActive = hit ? activePath : null;
            return nextActive === node.data.activePath
                ? node
                : { ...node, data: { ...node.data, isHighlighted: hit, activePath: nextActive } };
        }),
        [elements.nodes, activePath]
    );

    // Elements rebuild shortly after typing, so a path may only become focusable on a later render.
    useEffect(() => {
        if (!activePath) {
            focusedPathRef.current = null;
            return;
        }
        if (focusedPathRef.current === activePath) return;
        const target = elements.nodes.find((node) => node.data.paths.includes(activePath));
        if (!target) return;
        focusedPathRef.current = activePath;
        const measured = getNode(target.id);
        const width = measured?.width ?? 0;
        const height = measured?.height ?? 0;
        setCenter(target.position.x + width / 2, target.position.y + height / 2, {
            zoom: Math.max(getZoom(), FOCUS_ZOOM),
            duration: 500,
        });
    }, [activePath, elements.nodes, getNode, getZoom, setCenter]);

    const searchResult = searchQuery
        ? elements.nodes.some((node) => node.data.paths.includes(searchQuery)) ? "Match found" : "No match for this path"
        : "";

    return (
        <div className={darkMode ? `${styles.treeCont} ${styles.dark}` : styles.treeCont}>
            <ReactFlow
                nodes={nodes}
                edges={elements.edges}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.05}
                maxZoom={4}
                nodesDraggable={false}
                nodesConnectable={false}
                panOnScroll
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1.5}
                    color={darkMode ? "#4B5563" : "#9CA3AF"}
                />
            </ReactFlow>
            <Controllers />
            {searchResult && (
                <div className={`${styles.searchResult} ${searchResult === "Match found" ? styles.found : styles.notFound}`}>
                    {searchResult}
                </div>
            )}
        </div>
    );
}

export default JsonTreeVisualizer;
