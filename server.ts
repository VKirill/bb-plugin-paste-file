// bb-plugin-paste-file — server side: keeps the paste preferences in plugin
// storage and serves them to the app over RPC. The conversion itself happens in
// the browser (app.tsx), where the paste event is.
import type { BbPluginApi } from "@get-bb/plugin-sdk";
import { PREFS_CHANGED, rpcContract } from "./contract";
import { normalizePrefs, type PastePrefs } from "./paste-file";

const PREFS_KEY = "prefs";

export default async function plugin(bb: BbPluginApi) {
  const read = async (): Promise<PastePrefs> => normalizePrefs(await bb.storage.kv.get<Record<string, unknown>>(PREFS_KEY));

  bb.rpc.register(rpcContract, {
    getPrefs: () => read(),
    setPrefs: async (patch) => {
      const next = normalizePrefs({ ...(await read()), ...patch });
      await bb.storage.kv.set(PREFS_KEY, next);
      bb.realtime.publish(PREFS_CHANGED, { global: true });
      return next;
    },
  });
}
