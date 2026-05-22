export function parseStrategyTags(value: string) {
  return value
    .split(/[,，、/|]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function formatStrategyTags(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean))).join(", ");
}
