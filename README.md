# Paste as File for bb

[Русский](README.ru.md)

Turns a large text paste in the bb composer into a file attachment, the way
ChatGPT does: a chip above the composer instead of a wall of text, and the
agent gets the file with the message.

- Converts at **1500 characters or 30 lines** (configurable).
- `.json` for text that parses as JSON, `.txt` for log dumps, `.md` otherwise;
  named after the first heading or line: `pasted-<slug>-HHMMSS.<ext>`.
- **Cmd/Ctrl+Shift+V** pastes as plain text whatever the size.
- Pastes that already carry files (screenshots) keep bb's own handling.
- Uses bb's own attachment path, so the file is uploaded like any pasted image.
- Settings in English and Russian: on/off and both thresholds.

Pairs with the [Pokecut theme](https://github.com/VKirill/bb-plugin-pokecut-theme),
which draws attachments as file cards and marks pasted text files with the
accent tile; works with any theme.

## Install

```sh
bb plugin install https://github.com/VKirill/bb-plugin-paste-file
```

## How it works

`interceptor.ts` listens for `paste` in the capture phase on bb composers
(`[data-promptbox] [contenteditable]`). When `shouldConvert` says the text is
large enough, it cancels the event and re-dispatches a file-only paste with a
`File` built from the text; bb's prompt box attaches pasted files itself.
Rules (thresholds, extension, file name) live in `paste-file.ts` and are unit
tested. The server only stores preferences (`bb.storage.kv`) and serves them
over RPC; the settings section is built from bb's `Switch`, `Input` and `Label`
in the Pokecut plugin kit (`app.css`).

## Develop

```sh
npm install
npm run build        # tsc + tests + bb plugin build
bb plugin install path:. --yes
```

## License

MIT
