import { GoogleGenAI } from "@google/genai";
import { AgentModel } from "../models/Agent.js";
import { WorkflowModel } from "../models/Workflow.js";
import { ExecutionLogModel } from "../models/ExecutionLog.js";

/**
 * OrchestratorService - Inima aplicației cross_brand.
 * Gestionează orchestrarea agenților în cadrul unui workflow.
 */
export class OrchestratorService {
  private ai: GoogleGenAI;

  constructor() {
    // Inițializare Gemini AI folosind cheia din environment
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }

  /**
   * Execută un workflow pas cu pas.
   * Output-ul unui agent devine input-ul următorului.
   */
  async runWorkflow(workflowId: string, initialInput: string) {
    console.log(`[ORCHESTRATOR] Pornire workflow: ${workflowId}`);

    // 1. Extrage workflow-ul cu pașii săi
    const workflow = await WorkflowModel.findById(workflowId).populate('steps.agentId');
    if (!workflow) {
      throw new Error(`Workflow-ul cu ID ${workflowId} nu a fost găsit.`);
    }

    let currentInput = initialInput;
    const executionResults = [];

    // 2. Iterează serial (asincron) prin fiecare pas
    // Sortăm pașii după câmpul 'order' pentru a asigura secvențialitatea corectă
    const sortedSteps = [...workflow.steps].sort((a, b) => a.order - b.order);

    for (const step of sortedSteps) {
      const agent = await AgentModel.findById(step.agentId);
      if (!agent) {
        console.error(`[ORCHESTRATOR] Agent negăsit pentru pasul cu ordinea ${step.order}`);
        continue;
      }

      console.log(`[ORCHESTRATOR] Execuție Pas ${step.order}: Agent ${agent.name}`);

      try {
        // 3. Apelează LLM-ul (Gemini AI în acest caz)
        // Construim promptul combinând instrucțiunile de sistem ale agentului cu input-ul curent
        const prompt = `System Instructions: ${agent.systemPrompt}\n\nUser Input: ${currentInput}`;
        
        const response = await this.ai.models.generateContent({
          model: "gemini-3-flash-preview", // Putem mapa agent.model la modelul real aici
          contents: prompt,
          config: {
            temperature: agent.temperature,
          }
        });

        const output = response.text || "No output generated";

        // 4. Salvează log-ul de execuție (Success)
        const log = new ExecutionLogModel({
          workflowId: workflow._id,
          agentId: agent._id,
          input: currentInput,
          output: output,
          status: 'success'
        });
        await log.save();

        console.log(`[ORCHESTRATOR] Succes Pas ${step.order}`);

        // Pregătește input-ul pentru următorul pas
        currentInput = output;
        executionResults.push(log); // Adăugăm obiectul log complet

      } catch (error) {
        // 5. Gestionează erorile la nivel de pas
        const errorMessage = error instanceof Error ? error.message : "Eroare necunoscută la execuție";
        
        const log = new ExecutionLogModel({
          workflowId: workflow._id,
          agentId: agent._id,
          input: currentInput,
          output: errorMessage,
          status: 'error'
        });
        await log.save();

        console.error(`[ORCHESTRATOR] Eroare la pasul ${step.order}: ${errorMessage}`);
        
        executionResults.push(log); // Adăugăm log-ul de eroare
        
        // Oprirea workflow-ului în caz de eroare critică (opțional)
        break; 
      }
    }

    return {
      workflowId,
      finalOutput: currentInput,
      stepsSummary: executionResults
    };
  }
}

export const orchestratorService = new OrchestratorService();
