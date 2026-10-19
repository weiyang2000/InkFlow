# InkFlow

InkFlow is an AI-assisted long-form fiction platform designed to help writers preserve world-building, character continuity, plot logic, and narrative style across large projects.

> Project status: early product and web prototype. The capabilities below describe the product direction; not every planned feature is implemented yet.

## Product direction

Long-form writing introduces problems that short-context tools do not solve well: forgotten settings, contradictory character states, broken plot logic, style drift, and difficulty recovering context across hundreds of chapters. InkFlow approaches these problems as a structured knowledge and workflow system instead of a one-shot text generator.

Planned pillars include:

- **World Bible** — structured characters, locations, objects, rules, and timelines
- **Hybrid retrieval** — vector search plus a knowledge graph for relationship-aware context
- **Agentic writing loop** — plan, select, write, reflect, and revise
- **Continuity checks** — detect conflicts with established facts and character states
- **Reverse archiving** — extract new facts from accepted chapters and propose updates
- **Story mapping** — organize volumes, chapters, scenes, pacing, and dependencies

## Repository structure

```text
.
├── PRD.md          # Product requirements and design direction
├── docs/           # Supporting product and technical documentation
└── inkflow-web/    # Web application prototype
```

## Start here

- Read [PRD.md](PRD.md) for the complete product vision and architecture.
- Explore [inkflow-web](inkflow-web/) for the current web prototype.
- Treat roadmap items in the PRD as planned work unless the implementation explicitly documents otherwise.

## Design principle

InkFlow should behave like a writing copilot: it keeps the story's memory and structure visible, proposes choices before generating prose, and leaves creative control with the writer.
