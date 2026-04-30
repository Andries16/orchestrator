import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { SettingsModel } from "../models/Settings.js";
import { decrypt } from "../utils/crypto.js";
export class LLMService {
  private getProviderForModel(
    modelName: string,
  ): "google" | "openai" | "anthropic" {
    if (modelName.startsWith("gpt")) return "openai";
    if (modelName.startsWith("claude")) return "anthropic";
    return "google";
  }
  async generateContent(params: {
    model: string;
    prompt: string;
    temperature: number;
    tools?: string[];
    state?: Record<string, any>;
    apiKeys?: any;
  }): Promise<{ text: string; toolsUsed: string[] }> {
    const provider = this.getProviderForModel(params.model);
    const settings = await SettingsModel.findOne();
    const toolsUsed: string[] = [];
    if (provider === "google") {
      const apiKey =
        params.apiKeys?.googleKey ||
        (settings?.googleKey ? decrypt(settings.googleKey) : null) ||
        process.env.GEMINI_API_KEY;
      if (!apiKey)
        throw new Error(
          "Google API Key not configured in UI Settings, provided per-run, or in ENV.",
        );
      const { toolService, ToolDefinitions } = await import("./ToolService.js");
      const ai = new GoogleGenAI({ apiKey });
      const geminiTools = params.tools
        ?.map((t) => (ToolDefinitions as any)[t])
        .filter(Boolean);
      const chat = ai.chats.create({
        model: params.model,
        config: {
          temperature: params.temperature,
          tools: geminiTools?.length
            ? [{ functionDeclarations: geminiTools }]
            : [],
        },
      });
      let response = await chat.sendMessage({
        message: params.prompt,
      });
      let functionCalls = response.functionCalls;
      while (functionCalls?.length) {
        const toolResults = [];
        for (const call of functionCalls) {
          toolsUsed.push(call.name);
          const result = await toolService.executeTool(
            call.name,
            call.args as any,
            {
              state: params.state || {},
            },
          );
          toolResults.push({
            functionResponse: {
              name: call.name,
              response: { result },
            },
          });
        }
        response = await chat.sendMessage({
          message: toolResults as any,
        });
        functionCalls = response.functionCalls;
      }
      return {
        text: response.text || "No output generated",
        toolsUsed,
      };
    }
    if (provider === "openai") {
      const apiKey =
        params.apiKeys?.openaiKey ||
        (settings?.openaiKey ? decrypt(settings.openaiKey) : null) ||
        process.env.OPENAI_API_KEY;
      if (!apiKey)
        throw new Error(
          "OpenAI API Key not configured in UI Settings, provided per-run, or in ENV.",
        );
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: params.model,
        messages: [{ role: "user", content: params.prompt }],
        temperature: params.temperature,
      });
      return {
        text: response.choices[0]?.message?.content || "No output generated",
        toolsUsed: [],
      };
    }
    if (provider === "anthropic") {
      const apiKey =
        params.apiKeys?.anthropicKey ||
        (settings?.anthropicKey ? decrypt(settings.anthropicKey) : null) ||
        process.env.ANTHROPIC_API_KEY;
      if (!apiKey)
        throw new Error(
          "Anthropic API Key not configured in UI Settings, provided per-run, or in ENV.",
        );
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model: params.model,
        max_tokens: 4096,
        temperature: params.temperature,
        messages: [{ role: "user", content: params.prompt }],
      });
      const textBlock = response.content.find((block) => block.type === "text");
      return {
        text:
          textBlock && "text" in textBlock
            ? textBlock.text
            : "No output generated",
        toolsUsed: [],
      };
    }
    throw new Error(`Unsupported model: ${params.model}`);
  }
  async *generateContentStream(params: {
    model: string;
    prompt: string;
    temperature: number;
    tools?: string[];
    apiKeys?: any;
  }): AsyncGenerator<string, void, unknown> {
    const provider = this.getProviderForModel(params.model);
    const settings = await SettingsModel.findOne();
    let finalPrompt = params.prompt;
    if (params.tools && params.tools.length > 0) {
      finalPrompt += `\n\n[SYSTEM]: You have the following tools available: ${params.tools.join(", ")}. Currently, automatic tool calling is not fully wired in stream mode, so simply act as if you know how to use them or inform the user you are simulating their execution.`;
    }
    if (provider === "google") {
      const apiKey =
        params.apiKeys?.googleKey ||
        (settings?.googleKey ? decrypt(settings.googleKey) : null) ||
        process.env.GEMINI_API_KEY;
      if (!apiKey)
        throw new Error(
          "Google API Key not configured in UI Settings, provided per-run, or in ENV.",
        );
      const ai = new GoogleGenAI({ apiKey });
      const responseStream = await ai.models.generateContentStream({
        model: params.model,
        contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
        config: { temperature: params.temperature },
      });
      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
      return;
    }
    if (provider === "openai") {
      const apiKey =
        params.apiKeys?.openaiKey ||
        (settings?.openaiKey ? decrypt(settings.openaiKey) : null) ||
        process.env.OPENAI_API_KEY;
      if (!apiKey)
        throw new Error(
          "OpenAI API Key not configured in UI Settings, provided per-run, or in ENV.",
        );
      const openai = new OpenAI({ apiKey });
      const stream = await openai.chat.completions.create({
        model: params.model,
        messages: [{ role: "user", content: finalPrompt }],
        temperature: params.temperature,
        stream: true,
      });
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) yield text;
      }
      return;
    }
    if (provider === "anthropic") {
      const apiKey =
        params.apiKeys?.anthropicKey ||
        (settings?.anthropicKey ? decrypt(settings.anthropicKey) : null) ||
        process.env.ANTHROPIC_API_KEY;
      if (!apiKey)
        throw new Error(
          "Anthropic API Key not configured in UI Settings, provided per-run, or in ENV.",
        );
      const anthropic = new Anthropic({ apiKey });
      const stream = await anthropic.messages.create({
        model: params.model,
        max_tokens: 4096,
        temperature: params.temperature,
        messages: [{ role: "user", content: finalPrompt }],
        stream: true,
      });
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          yield chunk.delta.text;
        }
      }
      return;
    }
    throw new Error(`Unsupported model: ${params.model}`);
  }
}
export const llmService = new LLMService();
