export const ToolDefinitions = {
  calculator: {
    name: "calculator",
    description: "Evaluates a mathematical expression and returns the result.",
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description:
            "The mathematical expression to evaluate (e.g., '2 + 2 * 4')",
        },
      },
      required: ["expression"],
    },
  },
  get_current_time: {
    name: "get_current_time",
    description: "Returns the current date and time in ISO format.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  web_search: {
    name: "web_search",
    description:
      "Searches the web for a given query and returns a summary of the results.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
      },
      required: ["query"],
    },
  },
  store_memory: {
    name: "store_memory",
    description:
      "Stores a value in the shared workflow state for later retrieval.",
    parameters: {
      type: "object",
      properties: {
        key: {
          type: "string",
          description: "The key under which to store the value.",
        },
        value: {
          type: "string",
          description: "The value to store (can be a JSON string).",
        },
      },
      required: ["key", "value"],
    },
  },
  retrieve_memory: {
    name: "retrieve_memory",
    description: "Retrieves a value from the shared workflow state by key.",
    parameters: {
      type: "object",
      properties: {
        key: { type: "string", description: "The key to retrieve." },
      },
      required: ["key"],
    },
  },
};
export class ToolService {
  async executeTool(
    name: string,
    args: any,
    context?: { state: Record<string, any> },
  ): Promise<string> {
    try {
      if (name === "calculator") {
        const result = eval(args.expression);
        return String(result);
      }
      if (name === "get_current_time") {
        return new Date().toISOString();
      }
      if (name === "web_search") {
        return `Mock search results for "${args.query}": 1. Result A 2. Result B`;
      }
      if (name === "store_memory" && context) {
        context.state[args.key] = args.value;
        return `Successfully stored ${args.key} in memory.`;
      }
      if (name === "retrieve_memory" && context) {
        const val = context.state[args.key];
        return val ? String(val) : `Key ${args.key} not found in memory.`;
      }
      throw new Error(`Tool ${name} not found`);
    } catch (error: any) {
      return `Error executing ${name}: ${error.message}`;
    }
  }
}
export const toolService = new ToolService();
