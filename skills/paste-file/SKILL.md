---
name: paste-file
description: "Explain or adjust the Paste as File plugin: large text pasted into the BB composer becomes a .md/.json/.txt attachment; thresholds, bypass shortcut, where the file goes."
---

# Paste as File

A large text paste into a BB composer is turned into a file attachment instead
of being inserted as text. The file goes through BB's normal attachment path
(the same as a pasted image): a chip above the composer, and the agent receives
the file with the message.

- Converts when the paste reaches **1500 characters or 30 lines** (defaults).
- Extension: `.json` when the text parses as JSON, `.txt` for log dumps, `.md`
  otherwise. Name: `pasted-<slug of the first heading or line>-HHMMSS.<ext>`.
- Pastes that already carry files (screenshots) keep BB's own handling.
- **Cmd/Ctrl+Shift+V** pastes as plain text whatever the size.

Settings: Settings → Plugins → Paste as File (English or Russian): on/off,
character and line thresholds. Stored in the plugin's storage.

When a user message carries a `pasted-*.md` attachment, read it like any other
attachment: it is the text the user pasted.
