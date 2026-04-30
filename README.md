# Orchestrator: Stateful Agentic Runtime Engine

Orchestrator is a powerful, production-ready platform for building, executing, and monitoring complex AI agent workflows. It transforms simple LLM calls into a stateful, autonomous engine capable of parallel execution, long-term memory, and real-time observability.

## 🚀 Core Features

### 1. Advanced Agentic Orchestration
- **Sequential & DAG Workflows**: Execute agents in series or as complex Directed Acyclic Graphs (DAGs).
- **Parallel Execution**: Branching workflows execute concurrently to maximize performance.
- **Cyclic Logic (Loops)**: Support for iterative workflows with configurable "circuit breakers" (max iterations).
- **Multi-Input Coordination**: "Join" nodes that wait for all predecessors to complete before merging context.

### 2. Global Memory & Stateful Runtime
- **Shared Run State**: Agents share a persistent key-value store during a workflow run.
- **Memory Tools**: Built-in tools for agents to `store_memory` and `retrieve_memory` dynamically.
- **Context Injection**: Automatic injection of relevant memory states into every agent's system prompt.

### 3. Deep Observability & Analytics
- **Real-time Streaming**: Observe agent reasoning and output in real-time via SSE (Server-Sent Events).
- **Analytics Dashboard**: Monitor tool usage distribution, agent performance leaderboards, and execution trends.
- **Execution History**: Full logs of every agent step, including input, output, tools used, and latency.

### 4. Production Resilience
- **Automatic Retries**: Configurable retry logic with exponential backoff for failed agent nodes.
- **Fallback Models**: Automatic switching to a secondary model (e.g., switching from GPT-4o to Gemini) if the primary fails.
- **Human-in-the-Loop (HITL)**: "Wait" nodes that pause execution for human approval or feedback.

### 5. Multi-Model Support
- **First-class integration** for:
    - **Google Gemini** (Flash & Pro)
    - **OpenAI** (GPT-4o, GPT-3.5)
    - **Anthropic Claude** (Sonnet, Opus)

## 🏗️ Architecture (Monorepo)

- **`apps/frontend`**: A sleek, dark-mode React application built with Vite, MUI, and Lucide. Includes a visual DAG editor and real-time execution console.
- **`apps/backend`**: A robust Express server using tRPC for type-safe communication and Mongoose for MongoDB persistence.
- **`packages/shared`**: Shared Zod schemas and TypeScript interfaces, ensuring end-to-end type safety.

## 🛠️ Technical Stack

- **Frontend**: React 19, Vite, tRPC Client, Material UI, Lucide Icons, Reactflow (DAG Visualization).
- **Backend**: Node.js, Express, tRPC Server, Mongoose, Zod.
- **Database**: MongoDB.
- **AI Integration**: Google Generative AI SDK, OpenAI SDK, Anthropic SDK.

## 🚦 Getting Started

### Prerequisites
- Node.js v20+
- MongoDB instance (local or Atlas)
- API Keys for Gemini, OpenAI, or Anthropic (can be set in .env or via UI).

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `apps/backend/` with your credentials:
   ```env
   MONGODB_URI=mongodb://localhost:27017/orchestrator
   GEMINI_API_KEY=your_key_optional
   OPENAI_API_KEY=your_key_optional
   ANTHROPIC_API_KEY=your_key_optional
   CRYPTO_SECRET=a_random_32_char_string
   ```
   *Note: API keys can also be configured directly in the web UI for each execution session.*

### Running Locally
Run both frontend and backend concurrently:
```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## 📋 Workflow Management
- **Clone**: Easily duplicate existing workflows.
- **Export/Import**: Save workflows as JSON files for sharing or versioning.
- **Prompt Templates**: Library of reusable prompt snippets with dynamic variables.

---
Built with 🦾 by the Orchestrator Team.
