import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const manifest = JSON.parse(read('module.json'));
assert.equal(manifest.id, 'bf-easy-reference');
assert.equal(manifest.title, 'Black Flag Easy Reference');
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


assert(!read('scripts/applications/check-formula.mjs').includes('black-flag.'), 'runtime code must not reference invalid black-flag global');
assert(!read('scripts/applications/damage-formula.mjs').includes('black-flag.'), 'runtime code must not reference invalid black-flag global');
assert(read('scripts/config.mjs').includes('referenceType: "property"'), 'property references should use Black Flag ruleTypes');
assert(read('scripts/config.mjs').includes('referenceType: "damageType"'), 'damage type references should use Black Flag ruleTypes');
assert(!read('scripts/config.mjs').includes('weaponMasteries:'), 'DND-only weapon mastery menu should not be registered for Black Flag');


assert(!read('scripts/detection/menu-setup.mjs').includes('weaponMastery'), 'DND-only weapon mastery detection should not be registered for Black Flag');
assert(!read('scripts/detection/menu-setup.mjs').includes('areaTargetType'), 'DND-only area target detection should not be registered for Black Flag');
assert(read('scripts/detection/pattern-scanner.mjs').includes('spellProperty: "property"'), 'spell property detection should emit Black Flag property references');
assert(read('scripts/detection/pattern-scanner.mjs').includes('&Reference[${referenceTypes[type]}=${referenceKey}]'), 'direct detected references should be typed for Black Flag');


assert(!read('scripts/config.mjs').includes('abilities: {'), 'ability reference menu should not be registered because Black Flag has no ability reference UUIDs');
assert(!read('scripts/config.mjs').includes('skills: {'), 'skill reference menu should not be registered because Black Flag has no skill reference UUIDs');
assert(!read('scripts/detection/menu-setup.mjs').includes('detect-ability'), 'ability reference detection should not be registered for Black Flag');
assert(!read('scripts/detection/menu-setup.mjs').includes('detect-skill'), 'skill reference detection should not be registered for Black Flag');


assert(read('scripts/applications/check-formula.mjs').includes('CONFIG.BlackFlag.abilities.localizedOptions'), 'check dialog should use localized ability options');
assert(read('scripts/applications/check-formula.mjs').includes('CONFIG.BlackFlag.skills.localizedOptions'), 'check dialog should use localized skill options');
assert(read('scripts/applications/check-formula.mjs').includes('acc.some((tool) => tool.value === entry.key)'), 'check dialog should de-duplicate tool lookup aliases');
assert(read('templates/check/formulas.hbs').includes('value="{{value}}"'), 'check template should render localized option arrays');
assert(read('scripts/applications/condition-formula.mjs').includes('CONFIG.BlackFlag.conditions'), 'condition dialog should use Black Flag conditions config');
assert(read('scripts/applications/condition-formula.mjs').includes('&Reference[condition=${this.#model.condition}'), 'condition dialog should emit typed Black Flag condition references');


assert(read('scripts/applications/heal-formula.mjs').includes('CONFIG.BlackFlag.healingTypes.localizedOptions'), 'heal dialog should use localized healing type options');
assert(!read('scripts/applications/heal-formula.mjs').includes('formula=${formula}'), 'heal enricher should use Black Flag positional formula syntax');
assert(read('scripts/applications/heal-formula.mjs').includes('healType !== "healing"'), 'normal healing should rely on Black Flag default heal type');
assert(read('templates/heal/formulas.hbs').includes('value="{{value}}"'), 'heal template should render localized option arrays');


assert(read('scripts/applications/save-formula.mjs').includes('CONFIG.BlackFlag.abilities.localizedOptions'), 'save dialog should use localized ability options');
assert(read('templates/save/formulas.hbs').includes('value="{{value}}"'), 'save template should render localized option arrays');


const en = JSON.parse(read('lang/en.json'));
assert.equal(en.BFREF.MENU.CHECKS.TITLE, 'Ability Checks');
assert.equal(en.BFREF.MENU.SAVES.TITLE, 'Saving Throws');
assert.notEqual(en.BFREF.MENU.CHECKS.TITLE, en.BFREF.MENU.SAVES.TITLE, 'ability checks and saving throws must remain distinct menu labels');

console.log('static checks passed');
