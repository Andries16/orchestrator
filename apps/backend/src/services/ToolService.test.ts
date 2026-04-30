import { describe, it, expect } from "vitest";
import { toolService } from "./ToolService.js";

describe("ToolService", () => {
  it("should execute calculator tool correctly", async () => {
    const result = await toolService.executeTool("calculator", { expression: "2 + 2 * 5" });
    expect(result).toBe("12");
  });

  it("should handle calculator errors", async () => {
    const result = await toolService.executeTool("calculator", { expression: "invalid + expr" });
    expect(result).toContain("Error executing calculator");
  });

  it("should return current time", async () => {
    const result = await toolService.executeTool("get_current_time", {});
    expect(new Date(result).toISOString()).toBe(result);
  });

  it("should execute web search tool correctly", async () => {
    const result = await toolService.executeTool("web_search", { query: "vitest" });
    expect(result).toContain("Mock search results for \"vitest\"");
  });

  it("should store and retrieve memory", async () => {
    const context = { state: {} };
    const storeResult = await toolService.executeTool("store_memory", { key: "foo", value: "bar" }, context);
    expect(storeResult).toBe("Successfully stored foo in memory.");
    expect(context.state).toEqual({ foo: "bar" });

    const retrieveResult = await toolService.executeTool("retrieve_memory", { key: "foo" }, context);
    expect(retrieveResult).toBe("bar");
  });

  it("should handle missing memory keys", async () => {
    const context = { state: {} };
    const result = await toolService.executeTool("retrieve_memory", { key: "missing" }, context);
    expect(result).toBe("Key missing not found in memory.");
  });

  it("should throw error for unknown tools", async () => {
    const result = await toolService.executeTool("unknown_tool", {});
    expect(result).toContain("Error executing unknown_tool: Tool unknown_tool not found");
  });
});
