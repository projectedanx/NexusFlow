import re

with open("src/types.ts", "r") as f:
    content = f.read()

# Add ARCHITECT to StepType enum
new_step_type = """export enum StepType {
  STRATEGY = 'STRATEGY',
  CREATIVE = 'CREATIVE',
  TECHNICAL = 'TECHNICAL',
  ANALYSIS = 'ANALYSIS',
  ARCHITECT = 'ARCHITECT'
}"""
content = re.sub(r'export enum StepType \{[^\}]+\}', new_step_type, content)

with open("src/types.ts", "w") as f:
    f.write(content)
