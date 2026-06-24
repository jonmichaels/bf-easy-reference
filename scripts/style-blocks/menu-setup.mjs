// @ts-check

/** @import { SubMenuItem } from '../types/_types.mjs' */

import { getCalloutNode, getPullQuoteHtml } from "./system-html.mjs";
import {
  replaceSelection,
  replaceSelectionWithNode,
  toggleBlock,
} from "../prose-mirror/utils.mjs";

/**
 * Creates the system HTML style block options
 * @returns {SubMenuItem[]} the submenu items to include
 */
export function getStyleMenuSubItems() {
  return [
    {
      title: "BFREF.MENU.STYLE.ADVICE",
      key: "advice",
      onMenuItemClick: async (menu) => {
        const node = getCalloutNode({
          menu,
          cssClass: "fvtt advice",
          icon: "icons/vtt-512.png",
          title: "BFREF.MENU.STYLE.ADVICE_TITLE",
          text: "BFREF.MENU.STYLE.ADVICE_CONTENT",
        });

        replaceSelectionWithNode({
          menu,
          node,
        });
      },
    },
    {
      title: "BFREF.MENU.STYLE.QUEST",
      key: "quest",
      onMenuItemClick: async (menu) => {
        const node = getCalloutNode({
          menu,
          cssClass: "fvtt quest",
          icon: "icons/magic/symbols/question-stone-yellow.webp",
          title: "BFREF.MENU.STYLE.QUEST_TITLE",
          text: "BFREF.MENU.STYLE.QUEST_CONTENT",
        });

        replaceSelectionWithNode({
          menu,
          node,
        });
      },
    },
    {
      title: "BFREF.MENU.STYLE.TREASURE",
      key: "treasure",
      onMenuItemClick: async (menu) => {
        const node = getCalloutNode({
          menu,
          cssClass: "fvtt quest",
          icon: "icons/containers/chest/chest-wooden-tied-white.webp",
          title: "BFREF.MENU.STYLE.TREASURE_TITLE",
          text: "BFREF.MENU.STYLE.TREASURE_CONTENT",
        });

        replaceSelectionWithNode({
          menu,
          node,
        });
      },
    },
    {
      title: "BFREF.MENU.STYLE.NARRATIVE",
      key: "narrative",
      onMenuItemClick: async (menu) => {
        toggleBlock({ menu, class: "fvtt narrative", type: "div" });
      },
    },
    {
      title: "BFREF.MENU.STYLE.NOTABLE",
      key: "notable",
      onMenuItemClick: async (menu) => {
        toggleBlock({ menu, class: "notable", type: "aside" });
      },
    },
    {
      title: "BFREF.MENU.STYLE.HABITAT_TREASURE",
      key: "habitat-treasure",
      onMenuItemClick: async (menu) => {
        const habitatTitle = game.i18n.localize(
          "BFREF.MENU.STYLE.HABITAT_TREASURE_TITLE_HABITAT",
        );
        const habitatContent = game.i18n.localize(
          "BFREF.MENU.STYLE.HABITAT_TREASURE_CONTENT_HABITAT",
        );
        const treasureTitle = game.i18n.localize(
          "BFREF.MENU.STYLE.HABITAT_TREASURE_TITLE_TREASURE",
        );
        const treasureContent = game.i18n.localize(
          "BFREF.MENU.STYLE.HABITAT_TREASURE_CONTENT_TREASURE",
        );
        const html = `
<p class="habitat-treasure">
    <strong>${habitatTitle}</strong>: ${habitatContent}; 
    <strong>${treasureTitle}</strong>: ${treasureContent}
</p>`;
        replaceSelection({ html, menu });
      },
    },
    {
      // For black-flag 5.3.x or higher
      title: "BFREF.MENU.STYLE.PULL_QUOTE_LEFT",
      key: "pull-quote-left",
      onMenuItemClick: async (menu) => {
        const html = getPullQuoteHtml({ menu, cssClass: "float-left" });
        replaceSelection({ html, menu });
      },
    },
    {
      // For black-flag 5.3.x or higher
      title: "BFREF.MENU.STYLE.PULL_QUOTE_RIGHT",
      key: "pull-quote-right",
      onMenuItemClick: async (menu) => {
        const html = getPullQuoteHtml({ menu, cssClass: "float-right" });
        replaceSelection({ html, menu });
      },
    },
  ];
}
