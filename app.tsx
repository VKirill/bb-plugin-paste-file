// bb-plugin-paste-file — app side. An app overlay mounts the paste interceptor
// (interceptor.ts) with the current preferences; a settings section edits them
// in English or Russian, built from BB's own components in the Pokecut kit.
import "./app.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { definePluginApp, useRealtime, useRealtimeConnectionState, useRpc } from "@get-bb/plugin-sdk/app";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PREFS_CHANGED, rpcContract } from "./contract";
import { mountPasteInterceptor } from "./interceptor";
import { DEFAULT_PREFS, LIMITS, normalizePrefs, type PastePrefs } from "./paste-file";
import { t, useLocale } from "./i18n";

/** Current preferences, refreshed on reconnect and on every server-side change. */
function usePrefs() {
  const rpc = useRpc<typeof rpcContract>();
  const connection = useRealtimeConnectionState();
  const [prefs, setPrefs] = useState<PastePrefs | null>(null);
  const [error, setError] = useState(false);
  const refresh = useCallback(async () => {
    try {
      setPrefs(normalizePrefs(await rpc.call("getPrefs", {})));
      setError(false);
    } catch {
      setError(true);
    }
  }, [rpc]);
  useEffect(() => {
    if (connection === "connected") void refresh();
  }, [connection, refresh]);
  useRealtime(PREFS_CHANGED, () => void refresh());
  return { prefs, setPrefs, error, rpc };
}

function PasteLayer() {
  const { prefs } = usePrefs();
  const current = useRef<PastePrefs>(DEFAULT_PREFS);
  current.current = prefs ?? DEFAULT_PREFS;
  useEffect(() => mountPasteInterceptor(() => current.current), []);
  return null;
}

function NumberField(props: { id: string; label: string; hint: string; value: number; range: readonly [number, number]; disabled: boolean; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState(String(props.value));
  useEffect(() => setDraft(String(props.value)), [props.value]);
  const commit = () => {
    const value = Number(draft);
    if (Number.isFinite(value) && value !== props.value) props.onCommit(value);
    else setDraft(String(props.value));
  };
  return (
    <div className="pst-row">
      <div className="pst-row-text">
        <Label htmlFor={props.id}>{props.label}</Label>
        <p className="text-xs text-muted-foreground">{props.hint}</p>
      </div>
      <Input
        id={props.id}
        className="w-24 shrink-0 text-right tabular-nums"
        type="number"
        inputMode="numeric"
        min={props.range[0]}
        max={props.range[1]}
        value={draft}
        disabled={props.disabled}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
        }}
      />
    </div>
  );
}

function PasteSettings() {
  useLocale();
  const { prefs, setPrefs, error, rpc } = usePrefs();
  const [saveError, setSaveError] = useState(false);
  if (error && !prefs) return <p className="text-xs pst-text-danger" data-bb-ru-skip="">{t("loadFailed")}</p>;
  if (!prefs) return <p className="text-xs text-muted-foreground" data-bb-ru-skip="">{t("loading")}</p>;

  const save = async (patch: Partial<PastePrefs>) => {
    const previous = prefs;
    setPrefs(normalizePrefs({ ...prefs, ...patch }));
    try {
      setPrefs(normalizePrefs(await rpc.call("setPrefs", patch)));
      setSaveError(false);
    } catch {
      setPrefs(previous);
      setSaveError(true);
    }
  };

  return (
    <section className="pst-panel" data-bb-ru-skip="">
      <div className="pst-panel-head">
        <div className="pst-row-text">
          <h3 className="m-0 text-sm font-medium">{t("sectionTitle")}</h3>
          <p className="text-xs text-muted-foreground">{t("sectionDescription")}</p>
        </div>
      </div>
      <div className="pst-panel-body pst-stack">
        <div className="pst-row">
          <div className="pst-row-text">
            <Label htmlFor="pst-enabled">{t("enabled")}</Label>
            <p className="text-xs text-muted-foreground">{t("enabledHint")}</p>
          </div>
          <Switch id="pst-enabled" className="pst-switch" checked={prefs.enabled} onCheckedChange={(enabled) => void save({ enabled })} />
        </div>
        <NumberField id="pst-min-chars" label={t("minChars")} hint={t("minCharsHint")} value={prefs.minChars} range={LIMITS.minChars} disabled={!prefs.enabled} onCommit={(minChars) => void save({ minChars })} />
        <NumberField id="pst-min-lines" label={t("minLines")} hint={t("minLinesHint")} value={prefs.minLines} range={LIMITS.minLines} disabled={!prefs.enabled} onCommit={(minLines) => void save({ minLines })} />
        <p className="text-xs text-muted-foreground">{t("bypass")}</p>
        {saveError && <p className="text-xs pst-text-danger" role="alert">{t("saveFailed")}</p>}
      </div>
    </section>
  );
}

export default definePluginApp((app) => {
  app.slots.experimental_appOverlay({ id: "paste-file-layer", component: PasteLayer });
  // The heading lives inside the section so it follows the live language.
  app.slots.settingsSection({ id: "paste", component: PasteSettings });
});
