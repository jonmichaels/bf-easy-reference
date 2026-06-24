/** @import { SubMenuItem } from '../types/_types.mjs' */

import { startPatternScan } from "./pattern-scanner.mjs";
import { insertText } from "../prose-mirror/utils.mjs";

/**
 * Gets the submenu items for the Pattern Detection menu.
 * @returns {SubMenuItem[]}
 */
export function getDetectionSubMenuItems() {
  return [
    {
      title: "BFREF.MENU.HEAL.TITLE",
      key: "detect-heal",
      onMenuItemClick: (menu) =>
        startPatternScan(menu, "heal", (text) => insertText({ text, menu })),
    },
    {
      title: "BFREF.MENU.SAVES.TITLE",
      key: "detect-save",
      onMenuItemClick: (menu) =>
        startPatternScan(menu, "save", (text) => insertText({ text, menu })),
    },
    {
      title: "BFREF.MENU.CHECKS.TITLE",
      key: "detect-check",
      onMenuItemClick: (menu) =>
        startPatternScan(menu, "check", (text) => insertText({ text, menu })),
    },
    {
      title: "BFREF.MENU.DAMAGE.TITLE",
      key: "detect-damage",
      onMenuItemClick: (menu) =>
        startPatternScan(menu, "damage", (text) => insertText({ text, menu })),
    },
    {
      title: "BFREF.MENU.ATTACK.TITLE",
      key: "detect-attack",
      onMenuItemClick: (menu) =>
        startPatternScan(menu, "attack", (text) => insertText({ text, menu })),
    },
    {
      title: "BFREF.MENU.CONDITIONTYPES.TITLE",
      key: "detect-condition",
      onMenuItemClick: (menu) =>
        startPatternScan(menu, "condition", (text) => insertText({ text, menu })),
    },
    {
      title: "BFREF.MENU.RULES.TITLE",
      key: "detect-rule",
      onMenuItemClick: (menu) =>
        startPatternScan(menu, "rule", (text) => insertText({ text, menu })),
    },
    {
      title: "BFREF.MENU.ITEMPROPERTIES.TITLE",
      key: "detect-spellProperty",
      onMenuItemClick: (menu) =>
        startPatternScan(menu, "spellProperty", (text) => insertText({ text, menu })),
    },
    {
      title: "BFREF.MENU.DAMAGETYPES.TITLE",
      key: "detect-damageType",
      onMenuItemClick: (menu) =>
        startPatternScan(menu, "damageType", (text) => insertText({ text, menu })),
    },
    {
      title: "BFREF.MENU.CREATURETYPES.TITLE",
      key: "detect-creatureType",
      onMenuItemClick: (menu) =>
        startPatternScan(menu, "creatureType", (text) => insertText({ text, menu })),
    },
  ];
}
