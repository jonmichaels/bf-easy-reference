// @ts-check

/** @import { MenuConfigItem, SubMenuItem } from "./types/_types.mjs" */

import AttackFormulaDialog from "./applications/attack-formula.mjs";
import CheckFormulaDialog from "./applications/check-formula.mjs";
import ConditionFormulaDialog from "./applications/condition-formula.mjs";
import DamageFormulaDialog from "./applications/damage-formula.mjs";
import HealFormulaDialog from "./applications/heal-formula.mjs";
import LookupFormulaDialog from "./applications/lookup-formula.mjs";
import RuleFormulaDialog from "./applications/rule-formula.mjs";
import SaveFormulaDialog from "./applications/save-formula.mjs";
import { insertText } from "./prose-mirror/utils.mjs";
import { createReferenceSubMenuEntriesFromSourceData, insertReference } from "./reference.mjs";
import { getDetectionSubMenuItems } from "./detection/menu-setup.mjs";
import { getStyleMenuSubItems } from "./style-blocks/menu-setup.mjs";

/**
 * Gets the full menu config for the module.
 * @returns {Record<string, MenuConfigItem>}
 */
export function getMenuConfig() {
  return {
    saves: {
      title: "BFREF.MENU.SAVES.TITLE",
      setting: {
        key: "showsaves",
        name: "BFREF.MENU.SAVES.SETTING_NAME",
      },
      onMenuItemClick: async (menu) => {
        const text = await SaveFormulaDialog.create();
        insertText({ text, menu });
      },
    },
    checks: {
      onMenuItemClick: async (menu) => {
        const text = await CheckFormulaDialog.create();
        insertText({ text, menu });
      },
      setting: {
        key: "showchecks",
        name: "BFREF.MENU.CHECKS.SETTING_NAME",
      },
      title: "BFREF.MENU.CHECKS.TITLE",
    },
    attack: {
      onMenuItemClick: async (menu) => {
        const text = await AttackFormulaDialog.create();
        insertText({ text, menu });
      },
      setting: {
        key: "showattack",
        name: "BFREF.MENU.ATTACK.SETTING_NAME",
      },
      title: "BFREF.MENU.ATTACK.TITLE",
    },
    damage: {
      onMenuItemClick: async (menu) => {
        const text = await DamageFormulaDialog.create();
        insertText({ text, menu });
      },
      setting: {
        key: "showdamage",
        name: "BFREF.MENU.DAMAGE.SETTING_NAME",
      },
      title: "BFREF.MENU.DAMAGE.TITLE",
    },
    heal: {
      onMenuItemClick: async (menu) => {
        const text = await HealFormulaDialog.create();
        if (text) insertText({ text, menu });
      },
      setting: {
        key: "showheal",
        name: "BFREF.MENU.HEAL.SETTING_NAME",
      },
      title: "BFREF.MENU.HEAL.TITLE",
    },
    conditionTypes: {
      onMenuItemClick: async (menu) => {
        const text = await ConditionFormulaDialog.create();
        insertText({ text, menu });
      },
      setting: {
        key: "showconditionTypes",
        name: "BFREF.MENU.CONDITIONTYPES.SETTING_NAME",
      },
      title: "BFREF.MENU.CONDITIONTYPES.TITLE",
    },
    lookup: {
      onMenuItemClick: async (menu) => {
        const text = await LookupFormulaDialog.create();
        insertText({ text, menu });
      },
      setting: {
        key: "showlookup",
        name: "BFREF.MENU.LOOKUP.SETTING_NAME",
      },
      title: "BFREF.MENU.LOOKUP.TITLE",
    },
    rules: {
      onMenuItemClick: async (menu) => {
        const text = await RuleFormulaDialog.create();
        insertText({ text, menu });
      },
      setting: {
        key: "showrules",
        name: "BFREF.MENU.RULES.SETTING_NAME",
      },
      title: "BFREF.MENU.RULES.TITLE",
    },
    itemProperties: {
      title: "BFREF.MENU.ITEMPROPERTIES.TITLE",
      setting: {
        key: "showitemProperties",
        name: "BFREF.MENU.ITEMPROPERTIES.SETTING_NAME",
      },
      items: () =>
        createReferenceSubMenuEntriesFromSourceData({
          referenceType: "property",
          callback: async ({ key, menu }) => insertReference({ key, menu, type: "property" }),
        }),
    },
    damageTypes: {
      title: "BFREF.MENU.DAMAGETYPES.TITLE",
      setting: {
        key: "showdamageTypes",
        name: "BFREF.MENU.DAMAGETYPES.SETTING_NAME",
      },
      items: () =>
        createReferenceSubMenuEntriesFromSourceData({
          referenceType: "damageType",
          callback: async ({ key, menu }) => insertReference({ key, menu, type: "damageType" }),
        }),
    },
    creatureTypes: {
      title: "BFREF.MENU.CREATURETYPES.TITLE",
      setting: {
        key: "showcreatureTypes",
        name: "BFREF.MENU.CREATURETYPES.SETTING_NAME",
      },
      items: () =>
        createReferenceSubMenuEntriesFromSourceData({
          referenceType: "creatureType",
          callback: async ({ key, menu }) => insertReference({ key, menu, type: "creatureType" }),
        }),
    },
    detectPattern: {
      title: "BFREF.MENU.DETECTPATTERNS.TITLE",
      setting: {
        key: "showdetectPatterns",
        name: "BFREF.MENU.DETECTPATTERNS.SETTING_NAME",
      },
      items: () => getDetectionSubMenuItems().sort(localeSort),
    },
    styles: {
      title: "BFREF.MENU.STYLE.TITLE",
      setting: {
        key: "showstyle",
        name: "BFREF.MENU.STYLE.SETTING_NAME",
      },
      items: getStyleMenuSubItems().sort(localeSort),
    },
  };
}

/**
 * Sorts a menu config or submenu item by title.
 * @param {MenuConfigItem|SubMenuItem} a
 * @param {MenuConfigItem|SubMenuItem} b
 * @returns
 */
function localeSort(a, b) {
  return game.i18n.localize(a.title).localeCompare(game.i18n.localize(b.title));
}
