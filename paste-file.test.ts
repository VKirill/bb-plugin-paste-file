// node --experimental-strip-types --test paste-file.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_PREFS, fileNameFor, kindOf, normalizePrefs, shouldConvert, slugOf } from "./paste-file.ts";

test("converts at either threshold, never when off or blank", () => {
  assert.equal(shouldConvert("x".repeat(1499), DEFAULT_PREFS), false);
  assert.equal(shouldConvert("x".repeat(1500), DEFAULT_PREFS), true);
  assert.equal(shouldConvert(Array(30).fill("a").join("\n"), DEFAULT_PREFS), true);
  assert.equal(shouldConvert("x".repeat(5000), { ...DEFAULT_PREFS, enabled: false }), false);
  assert.equal(shouldConvert("   \n\n  ", DEFAULT_PREFS), false);
});

test("picks json, txt for logs, md otherwise", () => {
  assert.equal(kindOf('{"a":1,"b":[2]}').extension, "json");
  assert.equal(kindOf("{not json").extension, "md");
  const log = Array.from({ length: 8 }, (_, i) => `2026-10-03 10:0${i}:00 INFO step ${i}`).join("\n");
  assert.equal(kindOf(log).extension, "txt");
  assert.equal(kindOf("# Plan\n\nSome text").extension, "md");
});

test("slug from the first heading, transliterated", () => {
  assert.equal(slugOf("intro\n# План запуска рекламы\nbody"), "plan-zapuska-reklamy");
  assert.equal(slugOf("Release notes for v2!"), "release-notes-for-v2");
  assert.equal(slugOf("!!!"), "");
  assert.equal(fileNameFor("# План", new Date(2026, 9, 3, 9, 5, 7)), "pasted-plan-090507.md");
  assert.equal(fileNameFor("!!!", new Date(2026, 9, 3, 9, 5, 7)), "pasted-text-090507.md");
});

test("normalizes untrusted prefs into bounds", () => {
  assert.deepEqual(normalizePrefs(null), DEFAULT_PREFS);
  assert.deepEqual(normalizePrefs({ enabled: false, minChars: 10, minLines: 1e9 }), { enabled: false, minChars: 200, minLines: 5000 });
  assert.deepEqual(normalizePrefs({ minChars: "x" }), DEFAULT_PREFS);
});
