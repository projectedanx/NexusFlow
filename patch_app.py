import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add initial state for scars
if "scars: []," not in content:
    content = content.replace("scratchpad: '',", "scratchpad: '',\n    scars: [],")

# Add handleMarkAsScar
handle_scar_func = """
  const handleMarkAsScar = (text: string) => {
    setContext(prev => ({
      ...prev,
      scars: [...(prev.scars || []), {
        id: `scar-${Date.now()}`,
        description: text.substring(0, 150) + (text.length > 150 ? '...' : ''), // truncate for summary
        timestamp: Date.now()
      }]
    }));
  };
"""

if "const handleMarkAsScar" not in content:
    content = content.replace("const handleAppendToScratchpad", handle_scar_func + "\n  const handleAppendToScratchpad")

# Render ScarTissueArchive UI
scar_ui = """
            {/* Scar Tissue Archive */}
            {hasPlan && context.scars && context.scars.length > 0 && (
              <div className="bg-nexus-900 rounded-2xl p-4 border border-red-500/30 shadow-xl mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                  </div>
                  <h3 className="text-sm font-semibold text-red-400">Symbolic Scar Archive [⊘]</h3>
                </div>
                <p className="text-xs text-nexus-400 mb-3 leading-relaxed">
                  Unresolved tensions and contradictions. The orchestrator must hold these in superposition (Φ) without attempting normalization.
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {context.scars.map(scar => (
                    <div key={scar.id} className="bg-nexus-950 border border-red-900/50 p-2 rounded text-xs text-nexus-300 font-mono flex items-start gap-2">
                       <span className="text-red-500 mt-0.5">[⊘]</span>
                       <span className="break-all">{scar.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
"""

if "Symbolic Scar Archive [⊘]" not in content:
    content = content.replace("{/* Plan List (Only visible after generation) */}", scar_ui + "\n            {/* Plan List (Only visible after generation) */}")

# Pass down onMarkAsScar
if "onMarkAsScar={handleMarkAsScar}" not in content:
    content = content.replace("onAppendToScratchpad={handleAppendToScratchpad}", "onAppendToScratchpad={handleAppendToScratchpad}\n                onMarkAsScar={handleMarkAsScar}")


with open('src/App.tsx', 'w') as f:
    f.write(content)
