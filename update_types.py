import re

with open('src/types.ts', 'r') as f:
    content = f.read()

scar_interface = """
/**
 * Represents a human-identified structural tension or contradiction.
 * Paraconsistent logic dictates this tension is preserved, not resolved.
 */
export interface Scar {
  /** Unique identifier for the scar. */
  id: string;
  /** The description of the contradiction or tension to preserve. */
  description: string;
  /** Timestamp of when the scar was recorded. */
  timestamp: number;
}
"""

if "export interface Scar" not in content:
    content = content.replace("export interface ContextData", scar_interface + "\nexport interface ContextData")

if "scars?: Scar[];" not in content:
    content = content.replace("scratchpad?: string;", "scratchpad?: string;\n  /** Symbolic Scar Registry to maintain epistemic tension */\n  scars?: Scar[];")

with open('src/types.ts', 'w') as f:
    f.write(content)
