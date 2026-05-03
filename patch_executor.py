import re

with open("src/components/StepExecutor.tsx", "r") as f:
    content = f.read()

# Update UI styling
new_styling = """                <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border ${
                    step.type === StepType.TECHNICAL ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
                    step.type === StepType.CREATIVE ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' :
                    step.type === StepType.STRATEGY ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' :
                    step.type === StepType.ARCHITECT ? 'bg-[#FF4500]/10 border-[#FF4500]/50 text-[#FF4500]' :
                    'bg-blue-500/10 border-blue-500/50 text-blue-400'
                }`}>"""

content = re.sub(r'                <span className=\{`px-2 py-0\.5 rounded text-\[10px\] font-mono tracking-wider uppercase border \$\{\n                    step\.type === StepType\.TECHNICAL \? \'bg-emerald-500/10 border-emerald-500/50 text-emerald-400\' :\n                    step\.type === StepType\.CREATIVE \? \'bg-purple-500/10 border-purple-500/50 text-purple-400\' :\n                    step\.type === StepType\.STRATEGY \? \'bg-amber-500/10 border-amber-500/50 text-amber-400\' :\n                    \'bg-blue-500/10 border-blue-500/50 text-blue-400\'\n                \}`\}>', new_styling, content)

with open("src/components/StepExecutor.tsx", "w") as f:
    f.write(content)
