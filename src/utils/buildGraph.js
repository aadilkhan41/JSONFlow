import { MarkerType } from "reactflow";
import { getColorByType } from "./utils";

// Must stay in sync with the node CSS so estimated sizes match what renders.
const CHAR_WIDTH = 7;
const NODE_PADDING_X = 24;
const NODE_HEIGHT = 38;
const ROW_HEIGHT = 20;
const GROUP_PADDING_Y = 16;
const COLUMN_GAP = 90;
const ROW_GAP = 14;

const EDGE_STYLE = { stroke: "#485A74", strokeWidth: 2 };
const EDGE_MARKER = { type: MarkerType.ArrowClosed, color: "#485A74" };

const isContainer = (value) => typeof value === "object" && value !== null && Object.keys(value).length > 0;

const formatValue = (value) => {
    if (value === undefined) return "undefined";
    if (typeof value === "object" && value !== null) return Array.isArray(value) ? "[]" : "{}";
    return JSON.stringify(value);
};

function toTree(value, label, path) {
    const node = { kind: "parent", label, path, color: getColorByType(value), children: [] };
    const rows = [];
    for (const [key, child] of Object.entries(value)) {
        const childPath = `${path}.${key}`;
        if (isContainer(child)) node.children.push(toTree(child, key, childPath));
        else rows.push({ key, value: formatValue(child), path: childPath, color: getColorByType(child) });
    }
    if (rows.length) node.children.unshift({ kind: "group", rows, path: rows[0].path, children: [] });
    return node;
}

function measure(node) {
    if (node.kind === "group") {
        const longest = Math.max(...node.rows.map((r) => `${r.key}: ${r.value}`.length));
        node.width = longest * CHAR_WIDTH + NODE_PADDING_X;
        node.height = node.rows.length * ROW_HEIGHT + GROUP_PADDING_Y;
    } else {
        node.width = Math.max(String(node.label).length * CHAR_WIDTH + NODE_PADDING_X, 40);
        node.height = NODE_HEIGHT;
    }
    node.children.forEach(measure);
    const childrenHeight = node.children.reduce((sum, c) => sum + c.span, 0) + ROW_GAP * Math.max(node.children.length - 1, 0);
    node.span = Math.max(node.height, childrenHeight);
}

function columnWidths(node, depth = 0, widths = []) {
    widths[depth] = Math.max(widths[depth] ?? 0, node.width);
    node.children.forEach((c) => columnWidths(c, depth + 1, widths));
    return widths;
}

export function buildGraph(data, darkMode) {
    const root = toTree(isContainer(data) ? data : {}, "", "$");
    measure(root);
    const widths = columnWidths(root);
    const columnX = widths.reduce((xs, w, i) => [...xs, i === 0 ? 0 : xs[i - 1] + widths[i - 1] + COLUMN_GAP], []);

    const nodes = [];
    const edges = [];
    const bgColor = darkMode ? "#2B2C3E" : "#EEEEEE";
    let nextId = 0;

    const place = (node, depth, top, parentId) => {
        const id = `${++nextId}`;
        const isGroup = node.kind === "group";
        nodes.push({
            id,
            type: "custom",
            position: { x: columnX[depth], y: top + node.span / 2 - node.height / 2 },
            data: {
                kind: node.kind,
                label: node.label,
                rows: node.rows,
                path: node.path,
                paths: isGroup ? node.rows.map((r) => r.path) : [node.path],
                color: node.color,
                hasParent: !!parentId,
                hasChildren: node.children.length > 0,
                isHighlighted: false,
                activePath: null,
                bgColor: depth === 0 ? (darkMode ? "#2B2C3E" : "#f3f4f6") : bgColor,
            },
        });
        if (parentId) {
            edges.push({ id: `e${parentId}-${id}`, source: parentId, target: id, type: "bezier", style: EDGE_STYLE, markerEnd: EDGE_MARKER });
        }

        const childrenHeight = node.children.reduce((sum, c) => sum + c.span, 0) + ROW_GAP * Math.max(node.children.length - 1, 0);
        let childTop = top + (node.span - childrenHeight) / 2;
        for (const child of node.children) {
            place(child, depth + 1, childTop, id);
            childTop += child.span + ROW_GAP;
        }
    };

    place(root, 0, -root.span / 2, null);
    return { nodes, edges };
}
