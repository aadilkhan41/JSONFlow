export function getColorByType(value) {
    if (value === null || value === "") return "#9CA3AF";
    if (Array.isArray(value)) return "#ff5d8f";
    if (typeof value === "object") return "#FFA500";
    if (typeof value === "string") return "#E9967A";
    if (typeof value === "number") return "#32CD32";
    if (typeof value === "boolean") return "#ff4800";
    return "#94a3b8";
}