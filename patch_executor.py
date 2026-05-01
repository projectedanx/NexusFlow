import re

with open('src/components/StepExecutor.tsx', 'r') as f:
    content = f.read()

# Add onMarkAsScar prop
if "onMarkAsScar?: (text: string) => void;" not in content:
    content = content.replace(
        "onAppendToScratchpad?: (text: string) => void;",
        "onAppendToScratchpad?: (text: string) => void;\n  onMarkAsScar?: (text: string) => void;"
    )

if "onAppendToScratchpad }) => {" not in content and "onAppendToScratchpad, onMarkAsScar" not in content:
   content = content.replace(
       "isExecuting, onAppendToScratchpad }) => {",
       "isExecuting, onAppendToScratchpad, onMarkAsScar }) => {"
   )

# Add the button
scar_button = """
                {onMarkAsScar && step.result && (
                  <button
                    onClick={() => onMarkAsScar(step.result!)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    title="Mark as Symbolic Scar [⊘]"
                  >
                    <PlusSquare className="w-3.5 h-3.5" />
                    Mark Scar [⊘]
                  </button>
                )}"""

if "Mark Scar [⊘]" not in content:
    content = content.replace(
        "</button>\n                )}",
        "</button>\n                )}" + scar_button
    )

with open('src/components/StepExecutor.tsx', 'w') as f:
    f.write(content)
