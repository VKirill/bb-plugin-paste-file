// Paste interceptor: a capture-phase listener that sees a paste into a BB
// composer before the editor does. A large text paste is turned into a file
// and re-dispatched as a file-only paste, so BB's own attachment path picks it
// up exactly like a pasted image: chip above the composer, file to the agent.
// Cmd/Ctrl+Shift+V pastes as plain text whatever the size.
import { fileNameFor, kindOf, shouldConvert, type PastePrefs } from "./paste-file";

const COMPOSER_EDITOR = '[data-promptbox] [contenteditable="true"]';
const BYPASS_WINDOW_MS = 800;

export function mountPasteInterceptor(getPrefs: () => PastePrefs): () => void {
  let bypassUntil = 0;
  let redispatching = false;

  const onKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "v") {
      bypassUntil = Date.now() + BYPASS_WINDOW_MS;
    }
  };

  const onPaste = (event: ClipboardEvent) => {
    if (redispatching) return;
    const target = event.target instanceof Element ? event.target.closest(COMPOSER_EDITOR) : null;
    if (!target || !event.clipboardData) return;
    if (Date.now() < bypassUntil) return;
    // Files (screenshots, copied files) keep BB's own handling.
    if (Array.from(event.clipboardData.items).some((item) => item.kind === "file")) return;
    const text = event.clipboardData.getData("text/plain");
    if (!shouldConvert(text, getPrefs())) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    const { mime } = kindOf(text);
    const file = new File([text], fileNameFor(text), { type: mime });
    const transfer = new DataTransfer();
    transfer.items.add(file);
    redispatching = true;
    try {
      target.dispatchEvent(new ClipboardEvent("paste", { clipboardData: transfer, bubbles: true, cancelable: true }));
    } finally {
      redispatching = false;
    }
  };

  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("paste", onPaste, true);
  return () => {
    window.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("paste", onPaste, true);
  };
}
