# Black Flag Easy Reference

A Foundry VTT module for Black Flag v2/v3 that adds a **Black Flag Easy Reference** dropdown to ProseMirror journal editors.

This is a Black Flag port of [`kgar/dnd-easy-reference`](https://github.com/kgar/dnd-easy-reference). It keeps the same lightweight goal: make common references, formulas, and styled blocks quick to insert while writing journals.

## Compatibility

- Foundry VTT: v13 minimum, verified v14
- System: Black Flag v2 minimum, verified v3

## Installation

Use this manifest URL in Foundry's Install Module dialog:

```text
https://github.com/jonmichaels/bf-easy-reference/releases/latest/download/module.json
```

## Development

```bash
npm install
npm test
```

For local Foundry testing, symlink this repository into both Foundry userdata module folders:

```bash
ln -sfn /home/jon/projects/bf-easy-reference /home/jon/foundryuserdata/Data/modules/bf-easy-reference
ln -sfn /home/jon/projects/bf-easy-reference /home/jon/foundryuserdata14/Data/modules/bf-easy-reference
```

## Credits

Original module by Padhiver and kgar: <https://github.com/kgar/dnd-easy-reference>
