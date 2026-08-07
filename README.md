# AI Coder: From Vibe Coder to Agentic Engineer

Course notes and project workspace for [AI Coder: Complete Claude Code & Coding Agents Course](https://www.udemy.com/course/ai-coder-from-vibe-coder-to-agentic-engineer/) by **Ed Donner** (Ligency).

> *"These Coding Agents feel like tools we got from Aliens that come with no manual."* — Andrej Karpathy  
> This course is the manual.

**Duration:** 3 weeks · 95 lectures · ~16 hours  
**Level:** All backgrounds — from first-time builders to senior engineers

---

## About the Course

This course teaches how to build real software using AI coding agents — not just prompting ChatGPT for snippets, but orchestrating autonomous agents that navigate codebases, run tests, debug, and ship features.

The journey moves through three phases:

| Phase | Focus | Tools & Concepts |
|-------|-------|------------------|
| **Week 1** — Vibe Coding | IDE-based agentic workflows, context engineering, YOLO mode | Cursor, Copilot, Codex, Antigravity, `AGENTS.md` |
| **Week 2** — Vibe Engineering | Professional CLI workflows, MCP, plugins, Ralph Loops | Claude Code, OpenCode, Amp, Jira & GitHub integration |
| **Week 3** — Agentic Engineering | Multi-agent systems, swarms, orchestration | Sub-agents, Claude Agent Teams, GSD, Gas Town, Claude Agent SDK |

---

## The 8 Stages of AI Coding

The course maps to Steve Yegge's framework for AI adoption in software development:

1. Basic ChatGPT prompting
2. Agentic coding in an IDE (manual approval)
3. YOLO mode (autonomous execution)
4. Focus shifts from code to the agent
5. CLI coding agents (Claude Code)
6. Multiple concurrent autonomous agents
7. 10+ agents you coordinate yourself
8. Full orchestration (manager + worker agents)

---

## Projects

| # | Project | Description | Week |
|---|---------|-------------|------|
| 0 | **3D FPS Game** | First-person shooter built with Cursor AI and Three.js | Week 1, Day 1 |
| 1 | **Personal Website + AI Digital Twin** | Next.js portfolio with an AI chatbot powered by OpenRouter | Week 1, Day 4 |
| 2 | **Kanban PM Platform** | Chat-enabled project management app (Cursor, Copilot, Codex, Antigravity) | Week 1, Day 3–5 |
| 3 | **SaaS Legal Assistant** | Document drafting with PDF download (Claude Code + MCP) | Week 2 |
| 4 | **Trading Workstation (Capstone)** | Real-time trading UI with virtual trades and AI assistant | Week 3 |

---

## Tools Covered

### IDEs & Extensions
- [Cursor](https://cursor.com/)
- [GitHub Copilot](https://github.com/features/copilot) (VS Code)
- [OpenAI Codex](https://developers.openai.com/codex/) (VS Code extension & CLI)
- [Google Antigravity](https://antigravity.google/)

### CLI Coding Agents
- [Claude Code](https://code.claude.com/)
- [OpenCode](https://opencode.ai/)
- [Amp](https://ampcode.com/)

### Advanced Concepts
- **Context engineering** — `AGENTS.md`, `CLAUDE.md`, context windows, compacting
- **Workflows** — YOLO mode, Ralph Loops, plan-execute-review, spec-driven development
- **Agent features** — Skills, MCP, Plugins, Hooks, Sub-agents, Sandboxes
- **Orchestration** — Claude Agent Teams, GSD, Gas Town, Claude Agent SDK, OpenClaw, sprites.dev

---

## This Repository

```
ai-coder-complete-course/
├── instant/          # Week 1, Day 1 — 3D first-person shooter (Three.js + Vite)
│   ├── src/
│   │   ├── main.js   # Game logic, Three.js scene, enemy AI
│   │   └── style.css
│   ├── index.html
│   └── package.json
└── README.md
```

### Week 1, Day 1 — `instant/`

A compact first-person arena shooter built with **Three.js** and **Vite**, created as the opening vibe-coding exercise with Cursor AI.

**Controls:** Arrow keys to move · Space to shoot · Choose difficulty on the start screen

#### Run locally

```bash
cd instant
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

#### Build for production

```bash
npm run build
npm run preview
```

---

## Prerequisites

Install before Week 1, Day 3:

| Tool | Check | Install |
|------|-------|---------|
| **Git** | `git --version` | [git-scm.com/install](https://git-scm.com/install/) |
| **Node.js** | `node --version` (v22+) | [nodejs.org](https://nodejs.org/en/download) |
| **Docker** (Week 1, Day 5) | — | [Docker Desktop](https://docs.docker.com/get-started/get-docker/) |

---

## Course Resources

Keep these handy while working through the course:

- [Course resources page (Ed Donner)](https://edwarddonner.com/2026/02/17/ai-coder-vibe-coder-to-agentic-engineer/) — setup instructions, repo links, MCP configs
- [Course FAQ](https://edwarddonner.com/faq) — quotas, free models, troubleshooting
- [Course slides](https://edwarddonner.com/) — linked from the resources page

### Official project repos (clone as needed)

| Project | Repository |
|---------|------------|
| Kanban board | `git clone https://github.com/ed-donner/kanban.git` |
| PM platform | `git clone https://github.com/ed-donner/pm.git` |
| Legal SaaS | `git clone https://github.com/ed-donner/prelegal.git` |
| Trading capstone (FinAlly) | `git clone https://github.com/ed-donner/finally.git` |

---

## Week-by-Week Outline

### Week 1 — Vibe Coding for Fun and Profit

- **Day 1:** Course intro, 3D FPS game with Cursor, agentic coding landscape, 8 stages of AI coding
- **Day 2:** How LLMs work, tools & loops, context engineering, `AGENTS.md`, YOLO vs Ralph Loops
- **Day 3:** Hands-on with Cursor, Copilot, Codex, Antigravity — build the same Kanban app in each
- **Day 4:** Five principles of vibe coding, OpenRouter setup, personal website + AI digital twin
- **Day 5:** Commercial MVP rules, Docker, PM platform project in YOLO mode

### Week 2 — Vibe Engineering as a Professional

- Claude Code deep dive: slash commands, checkpoints, Ralph Loops
- MCP servers, Skills, Plugins
- Free/cheap models via OpenRouter and Ollama
- Jira + GitHub integration — raise a ticket, watch the agent ship it
- Build the **SaaS legal assistant** end to end

### Week 3 — Agentic Engineering as an Expert

- Sub-agents, hooks, sandboxing, large codebases
- Remote Claude Code (web, GitHub app, sprites.dev)
- Claude Agent SDK, Cowork, OpenClaw
- Multi-agent orchestration: Claude Agent Teams, GSD, Gas Town
- **Capstone:** Real-time trading workstation with live market data

---

## Key Principles

1. **Be the boss** — You own the code, even when agents write it.
2. **Start simple** — Build incrementally; test at every step.
3. **Trust but verify** — Demand evidence; never accept "fixed" without proof.
4. **Context is king** — A well-crafted `AGENTS.md` beats clever one-off prompts.
5. **Pick the right workflow** — Structured for enterprise; YOLO/Ralph for greenfield MVPs.

---

## License

Course materials belong to the instructor. Project code in this repo is for personal learning.
