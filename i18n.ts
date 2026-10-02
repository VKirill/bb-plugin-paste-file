// UI strings follow BB's interface language (<html lang>), or the Russifier
// plugin, which translates BB in place; English by default. The Russian
// dictionary must carry every English key (checked by its type).
import { useSyncExternalStore } from "react";

const en = {
  sectionTitle: "Large pastes",
  sectionDescription: "A large text paste into the composer becomes a file attachment instead of a wall of text. The agent gets the file with your message.",
  enabled: "Turn large pastes into files",
  enabledHint: "Markdown by default; JSON stays .json, log dumps become .txt.",
  minChars: "From characters",
  minCharsHint: "Convert when the paste is at least this long.",
  minLines: "Or from lines",
  minLinesHint: "Convert when the paste has at least this many lines.",
  bypass: "To paste as text anyway, use ⌘⇧V (Ctrl+Shift+V).",
  saveFailed: "Couldn't save the change. Try again.",
  loadFailed: "Couldn't load the settings.",
  loading: "Loading…",
};

export type I18nKey = keyof typeof en;

const ru: Record<I18nKey, string> = {
  sectionTitle: "Большие вставки",
  sectionDescription: "Большой текст, вставленный в поле ввода, превращается во вложение-файл, а не в простыню текста. Агент получает файл вместе с сообщением.",
  enabled: "Превращать большие вставки в файлы",
  enabledHint: "По умолчанию Markdown; JSON остаётся .json, логи становятся .txt.",
  minChars: "От символов",
  minCharsHint: "Превращать, если вставка не короче этого.",
  minLines: "Или от строк",
  minLinesHint: "Превращать, если во вставке не меньше строк.",
  bypass: "Чтобы всё же вставить текстом, нажмите ⌘⇧V (Ctrl+Shift+V).",
  saveFailed: "Не удалось сохранить изменение. Попробуйте ещё раз.",
  loadFailed: "Не удалось загрузить настройки.",
  loading: "Загрузка…",
};

export type Locale = "en" | "ru";

/** Russifier translates BB's chrome in place; its work shows on BB's own button labels. */
function russifierActive(): boolean {
  try {
    if (globalThis.localStorage?.getItem("bb-plugin-ru:enabled") === "off") return false;
  } catch {}
  const labels = globalThis.document?.querySelectorAll('[data-sidebar="sidebar"] button[aria-label], header button[aria-label]') ?? [];
  return Array.from(labels).slice(0, 12).some((button) => /[А-Яа-яЁё]/.test(button.getAttribute("aria-label") ?? ""));
}

export function detectLocale(): Locale {
  const lang = globalThis.document?.documentElement?.lang ?? "";
  if (lang.toLowerCase().startsWith("ru")) return "ru";
  return russifierActive() ? "ru" : "en";
}

export function t(key: I18nKey, locale: Locale = detectLocale()): string {
  return (locale === "ru" ? ru : en)[key];
}

function subscribe(listener: () => void): () => void {
  const id = window.setInterval(listener, 1500);
  return () => window.clearInterval(id);
}

/** Re-render when the detected language changes (Russifier loads after plugins). */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, detectLocale, () => "en");
}
