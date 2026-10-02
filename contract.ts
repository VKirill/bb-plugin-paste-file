import { defineRpcContract } from "@get-bb/plugin-sdk";
import { z } from "zod";

export const prefsSchema = z.object({
  enabled: z.boolean(),
  minChars: z.number(),
  minLines: z.number(),
});

export const rpcContract = defineRpcContract({
  getPrefs: { input: z.object({}), output: prefsSchema },
  setPrefs: { input: prefsSchema.partial(), output: prefsSchema },
});

/** Realtime event published after preferences change. */
export const PREFS_CHANGED = "prefs-changed";
