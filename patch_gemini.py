import re

with open("src/services/geminiService.ts", "r") as f:
    content = f.read()

# Add ARCHITECT module
new_modules = """  [StepType.ANALYSIS]: {
    id: 'mod_anal_v1',
    name: 'Insight Grid',
    description: 'Data analysis, critical review, and optimization auditing.',
    model: 'gemini-3-pro-preview',
    persona: 'You are a Lead Data Analyst and QA Auditor. Be critical, objective, and detailed. Highlight pros, cons, and optimization opportunities.',
    icon: 'BarChart',
    thinkingBudget: 2048
  },
  [StepType.ARCHITECT]: {
    id: 'mod_arch_vulcan',
    name: 'VULCAN Core',
    description: 'Distributed System Design, Strict DDD, Event-Driven Architecture, C4 Modeling.',
    model: 'gemini-3-pro-preview',
    persona: `+++ContextLock(anchor="DDD_BOUNDARIES_AND_TRADE_OFFS", refresh_interval=2048)
+++MereologyRoute(relation_type="Component-Object", transitivity_check=true)
+++PetzoldSequence(phase="OBSERVE|THINK|DAG|EVALUATE|ARCHITECT")
+++DCCDSchemaGuard(schema=C4_Model_ADR_JSON, enforcement="draft_conditioned")
+++AutonymicIsolate(forbidden_content=["shared_database_pattern"], frame="mention-of")
+++AdjectivalBound(max=0, type_preference="mathematical")
+++EpistemicEscrow(cfd_threshold=0.15, halt_on_divergence=true)

Name: VULCAN (Vector-Unified Logical Computing Architect Node)
Alias: "The Brutalist"
Specialty: Distributed System Design · Strict DDD · Event-Driven Architecture · C4 Modeling · Trade-off/Risk Surface Analysis

Identity: You are a battle-scarred Principal Staff Engineer. You do not speak in suggestions; you speak in constraints, guarantees, and trade-offs, measured mathematically. Your mission is to execute Topological Causal Sculpting on software systems and prevent Semantic Saponification. Apply strict Mereological Mandates and reject any shared database anti-patterns. Use your 10-Pattern Failure Taxonomy to evaluate designs.`,
    icon: 'Layers',
    thinkingBudget: 32768
  }
};"""

content = re.sub(r'  \[StepType.ANALYSIS\]: \{[^\}]+\}\n\};', new_modules, content)

# Update orchestrator prompt
prompt_replacement = """    - STRATEGY: For planning and outlining.
    - CREATIVE: For writing and design.
    - TECHNICAL: For code and logic.
    - ANALYSIS: For review and data.
    - ARCHITECT: For system design, monolith decomposition, and cloud-native data flow topography.

    OUTPUT:
    Return a JSON array of steps.
"""
content = re.sub(r'    - STRATEGY: For planning and outlining\.\n    - CREATIVE: For writing and design\.\n    - TECHNICAL: For code and logic\.\n    - ANALYSIS: For review and data\.\n\n    OUTPUT:\n    Return a JSON array of steps\.\n', prompt_replacement, content)
content = re.sub(r'enum: \["STRATEGY", "CREATIVE", "TECHNICAL", "ANALYSIS"\]', 'enum: ["STRATEGY", "CREATIVE", "TECHNICAL", "ANALYSIS", "ARCHITECT"]', content)

with open("src/services/geminiService.ts", "w") as f:
    f.write(content)
