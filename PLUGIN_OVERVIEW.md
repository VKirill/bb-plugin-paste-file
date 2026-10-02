## What you get

- **Large pastes become files.** Paste a long text into the composer and it arrives as an attachment chip instead of filling the box. The agent receives the file with your message, the same way it receives a pasted screenshot.
- **The right extension.** Text that parses as JSON stays `.json`, log dumps become `.txt`, everything else is Markdown. The name comes from the first heading or line, for example `pasted-launch-plan-093012.md`.
- **Your call each time.** Short pastes go in as text as before, and **Cmd/Ctrl+Shift+V** pastes as text whatever the size. Pastes that already carry files, such as screenshots, keep bb's own handling.

## How it works

The plugin listens for a paste in a bb composer. When the text reaches the threshold (1500 characters or 30 lines by default), it turns the text into a file and hands it to bb's own attachment path, so nothing new is stored: the file is uploaded like any other attachment.

Settings → Plugins → Paste as File turns it on or off and sets the character and line thresholds. The section is in English and Russian.

## Requirements

bb 0.44 or newer. No accounts or external services.
