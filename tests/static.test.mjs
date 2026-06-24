import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const manifest = JSON.parse(read('module.json'));
assert.equal(manifest.id, 'bf-easy-reference');
assert.equal(manifest.title, 'Black Flag Easy References');
assert.equal(manifest.compatibility.minimum, '13');
assert.equal(manifest.compatibility.verified, '14');
assert(!JSON.stringify(manifest).includes('"maximum"'), 'manifest must not contain compatibility.maximum');
assert(manifest.relationships.systems.some((s) => s.id === 'black-flag'), 'manifest must require black-flag system');

const main = read('main.mjs');
assert(main.includes('CONFIG.BF_EASY_REFERENCE'), 'main should expose BF_EASY_REFERENCE config namespace');
assert(main.includes('bf-easy-reference'), 'main should use bf-easy-reference setting namespace');
assert(!main.includes('dnd-easy-reference'), 'main must not use old module id');

const reference = read('scripts/reference.mjs');
assert(reference.includes('CONFIG.BlackFlag'), 'reference source should read Black Flag config');
assert(!reference.includes('CONFIG.DND5E'), 'reference source must not read DND5E config');

const settings = read('scripts/settings.mjs');
assert(settings.includes('game.settings.register("bf-easy-reference"'), 'settings must use new module id');


const promptDialog = read('scripts/applications/pattern-prompt-dialog.mjs');
assert(promptDialog.includes('classes: ["bf-pattern-prompt"]'), 'pattern prompt should use Black Flag CSS class');
assert(!promptDialog.includes('dnd-pattern-prompt'), 'pattern prompt must not use old DND CSS class');
assert(!promptDialog.includes("icon: 'fas fa-times\"'"), 'cancel icon class must not contain a stray quote');
assert.equal((promptDialog.match(/position:/g) ?? []).length, 1, 'PatternPromptDialog should define position once');

const css = read('styles/menu-config.css');
assert(css.includes('.bf-pattern-prompt'), 'CSS should use Black Flag pattern prompt class');
assert(!css.includes('.dnd-pattern-prompt'), 'CSS must not use old DND pattern prompt class');
assert(!css.includes('.dnd-widen-windows'), 'CSS must not use old DND widen class');

const packageJson = JSON.parse(read('package.json'));
assert.equal(packageJson.main, 'main.mjs');

console.log('static checks passed');
