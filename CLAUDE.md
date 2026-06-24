# Black Flag Easy Reference

Foundry VTT module ported from `kgar/dnd-easy-reference` for Black Flag v2/v3.

## Requirements

- Module id: `bf-easy-reference`
- Public title: `Black Flag Easy Reference`
- Supported Foundry: v13 minimum, verified v14
- Supported system: Black Flag v2 minimum, verified v3
- Do not add `compatibility.maximum` anywhere in `module.json`.
- Use `CONFIG.BlackFlag`, not `CONFIG.DND5E`.
- Use `CONFIG.BF_EASY_REFERENCE`, not `CONFIG.DND_EASY_REFERENCE`.

## Local testing links

- Foundry v13 userdata: `/home/jon/foundryuserdata/Data/modules/bf-easy-reference`
- Foundry v14 userdata: `/home/jon/foundryuserdata14/Data/modules/bf-easy-reference`

Both symlink to `/home/jon/projects/bf-easy-reference`.

## Verification

```bash
npm test
node -c main.mjs
for f in $(find scripts tools -name '*.mjs'); do node -c "$f"; done
```
