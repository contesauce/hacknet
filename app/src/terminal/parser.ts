/** Tokenize a command line, respecting "double" and 'single' quotes. */
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let cur = '';
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === quote) quote = null;
      else cur += c;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (/\s/.test(c)) {
      if (cur) { tokens.push(cur); cur = ''; }
    } else {
      cur += c;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

export interface ParsedCommand {
  cmd: string;
  args: string[];
  flags: Set<string>;   // short flags, e.g. `-la` -> {'l','a'}
}

export function parse(line: string): ParsedCommand | null {
  const tokens = tokenize(line.trim());
  if (tokens.length === 0) return null;
  const [cmd, ...rest] = tokens;
  const args: string[] = [];
  const flags = new Set<string>();
  for (const t of rest) {
    if (/^-[a-zA-Z]+$/.test(t)) {
      for (const ch of t.slice(1)) flags.add(ch);
    } else {
      args.push(t);
    }
  }
  return { cmd, args, flags };
}
