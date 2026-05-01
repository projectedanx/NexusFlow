import re

with open('src/services/geminiService.ts', 'r') as f:
    content = f.read()

# Update context type
content = content.replace(
    "originalContext: { goal: string; constraints: string; resources: string; depth: 'FAST' | 'DEEP'; scratchpad?: string }",
    "originalContext: import('../types').ContextData"
)

# Inject scars logic into prompt
scar_injection = """
    ${originalContext.scars && originalContext.scars.length > 0 ? `+++SymbolicScarRegistry(enforcement="strict")
    [SYMBOLIC SCARS - DO NOT RESOLVE TENSIONS]:
    ${originalContext.scars.map(s => `- [⊘] ${s.description}`).join('\\n    ')}` : ''}"""

prompt_start = """
    [ACTIVE MODULE]
    Name: ${moduleConfig.name}"""

if "+++SymbolicScarRegistry" not in content:
    content = content.replace(prompt_start, scar_injection + prompt_start)

with open('src/services/geminiService.ts', 'w') as f:
    f.write(content)
