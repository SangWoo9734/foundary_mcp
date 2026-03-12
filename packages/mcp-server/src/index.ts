export type McpServerInfo = {
  name: string;
  version: string;
  capabilities: string[];
};

export function createMcpServerInfo(
  overrides: Partial<McpServerInfo> = {}
): McpServerInfo {
  return {
    name: "mcp-server",
    version: "0.0.0",
    capabilities: ["tools", "resources"],
    ...overrides
  };
}
