import { useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Background, BackgroundVariant, MarkerType, useReactFlow } from "reactflow";
import { getColorByType } from "../../utils/utils";
import styles from "./styles.module.css";
import Controllers from "../Controllers/Controllers";
import Node from "../Node/Node";

let nodeId = 0;
const xAxisGap = 250;
const baseGap = 43;

function buildTree(obj, parentId = null, depth = 0, parentY = 0, path = "$", darkMode = true) {
    const nodes = [];
    const edges = [];
    const entries = Object.entries(obj);
    if (entries.length === 0) return { nodes, edges, height: 1 };

    const childHeights = entries.map(([, value]) =>
        typeof value === "object" && value !== null && Object.keys(value).length > 0
            ? buildTree(value).height
            : 1
    );

    const totalHeight = childHeights.reduce((a, b) => a + b, 0);
    const halfHeight = totalHeight / 2;
    let offsetY = parentY - halfHeight * baseGap;

    entries.forEach(([key, value], i) => {
        const id = `${++nodeId}`;
        const isParent =
            typeof value === "object" && value !== null && Object.keys(value).length > 0;
        const label = isParent
            ? { key: "", data: key }
            : { key, data: JSON.stringify(value) };
        const color = getColorByType(value);
        const branchHeight = childHeights[i];
        const nodeY = offsetY + (branchHeight * baseGap) / 2;
        const nodePath = `${path}.${key}`;

        nodes.push({
            id,
            type: "custom",
            position: { x: depth * xAxisGap, y: nodeY },
            data: {
                label,
                color,
                hasParent: !!parentId,
                hasChildren: isParent,
                path: nodePath,
                isHighlighted: false,
                bgColor: darkMode ? "#2B2C3E" : "#EEEEEE",
            },
        });

        if (parentId) {
            edges.push({
                id: `e${parentId}-${id}`,
                source: parentId,
                target: id,
                type: "bezier",
                style: { stroke: "#485A74", strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#485A74" },
            });
        }

        if (isParent) {
            const { nodes: childNodes, edges: childEdges } = buildTree(
                value,
                id,
                depth + 1,
                nodeY,
                nodePath,
                darkMode
            );
            nodes.push(...childNodes);
            edges.push(...childEdges);
        }

        offsetY += branchHeight * baseGap;
    });

    return { nodes, edges, height: totalHeight };
}

const FOCUS_ZOOM = 1.5;

function JsonTreeVisualizer({ jsonData, activePath, searchQuery, darkMode }) {
    const [elements, setElements] = useState({ nodes: [], edges: [] });
    const { setCenter, getNode, getZoom } = useReactFlow();
    const focusedPathRef = useRef(null);

    const nodes = useMemo(
        () => elements.nodes.map((node) => {
            const isHighlighted = !!activePath && node.data.path === activePath;
            return isHighlighted === node.data.isHighlighted ? node : { ...node, data: { ...node.data, isHighlighted } };
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
        const target = elements.nodes.find((node) => node.data.path === activePath);
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
        ? elements.nodes.some((node) => node.data.path === searchQuery) ? "Match found" : "No match for this path"
        : "";

    useEffect(() => {
        nodeId = 0;
        const rootId = `${++nodeId}`;
        const rootNode = {
            id: rootId,
            type: "custom",
            position: { x: 0, y: 0 },
            data: {
                label: "",
                hasParent: false,
                hasChildren: true,
                path: "$",
                bgColor: darkMode ? "#2B2C3E" : "#f3f4f6",
            },
        };
        const { nodes, edges } = buildTree(jsonData, rootId, 1, 0, "$", darkMode);
        setElements({ nodes: [rootNode, ...nodes], edges });
    }, [jsonData, darkMode]);

    const nodeTypes = { custom: Node };

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