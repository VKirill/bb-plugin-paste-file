// Pure rules for turning a large paste into a file: when to convert, which
// extension fits the text, and a readable file name. Kept free of DOM so it can
// be unit-tested.

export type PastePrefs = { enabled: boolean; minChars: number; minLines: number };

export const DEFAULT_PREFS: PastePrefs = { enabled: true, minChars: 1500, minLines: 30 };
export const LIMITS = { minChars: [200, 100_000], minLines: [5, 5_000] } as const;

const clamp = (value: number, [low, high]: readonly [number, number]) => Math.min(high, Math.max(low, Math.round(value)));

/** Untrusted stored or submitted values → complete prefs. */
export function normalizePrefs(values: Record<string, unknown> | null | undefined): PastePrefs {
  const v = values ?? {};
  return {
    enabled: typeof v.enabled === "boolean" ? v.enabled : DEFAULT_PREFS.enabled,
    minChars: typeof v.minChars === "number" && Number.isFinite(v.minChars) ? clamp(v.minChars, LIMITS.minChars) : DEFAULT_PREFS.minChars,
    minLines: typeof v.minLines === "number" && Number.isFinite(v.minLines) ? clamp(v.minLines, LIMITS.minLines) : DEFAULT_PREFS.minLines,
  };
}

export function lineCount(text: string): number {
  return text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length;
}

/** Convert when either threshold is reached. */
export function shouldConvert(text: string, prefs: PastePrefs): boolean {
  if (!prefs.enabled) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  return trimmed.length >= prefs.minChars || lineCount(trimmed) >= prefs.minLines;
}

export type PasteKind = { extension: "md" | "json" | "txt"; mime: string };

/** JSON that parses → .json; text that looks like a log or code dump → .txt; else Markdown. */
export function kindOf(text: string): PasteKind {
  const trimmed = text.trim();
  if (/^[[{]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return { extension: "json", mime: "application/json" };
    } catch {}
  }
  const lines = trimmed.split(/\r?\n/);
  const logLike = lines.filter((line) => /^\s*(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}|\[\w+\]|(INFO|WARN|ERROR|DEBUG)\b|at \S+ \(|\$ )/.test(line)).length;
  if (lines.length >= 5 && logLike / lines.length > 0.5) return { extension: "txt", mime: "text/plain" };
  return { extension: "md", mime: "text/markdown" };
}

const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};

/** First heading or first non-empty line → ascii kebab slug, at most 6 words / 48 chars. */
export function slugOf(text: string): string {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const heading = lines.find((line) => /^#{1,6}\s+\S/.test(line));
  const source = (heading ?? lines[0] ?? "").replace(/^#{1,6}\s+/, "");
  const ascii = source
    .toLowerCase()
    .replace(/[а-яё]/g, (char) => CYRILLIC[char] ?? "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii.split("-").filter(Boolean).slice(0, 6).join("-").slice(0, 48).replace(/-+$/, "");
}

/** pasted-<slug>-HHMMSS.<ext>; the time keeps two pastes in one message apart. */
export function fileNameFor(text: string, now = new Date()): string {
  const { extension } = kindOf(text);
  const slug = slugOf(text) || "text";
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, "0")).join("");
  return `pasted-${slug}-${time}.${extension}`;
}
