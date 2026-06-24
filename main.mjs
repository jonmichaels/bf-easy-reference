import { getMenuConfig } from "./scripts/config.mjs";
import { initSettings } from "./scripts/settings.mjs";
import { insertText, replaceSelection } from "./scripts/prose-mirror/utils.mjs";

const Hooks = foundry.helpers.Hooks;

Hooks.once('init', () => {
  // Establish API as early as possible.
  CONFIG.BF_EASY_REFERENCE = {
    api: {
      replaceSelection,
      insertText,
    },
  };
});

Hooks.once("i18nInit", () => {
  // To allow for localized sorting, we create the menu config at this stage in startup.
  const menuConfig = getMenuConfig();
  
  // Init settings at this startup phase because of localized setting sorting.
  initSettings(menuConfig);
  
  // Allow outside scripts to change the menu.
  Hooks.callAll("bf-easy-reference.prepareConfigMenuItems", menuConfig);

  // Put menu config in CONFIG.
  CONFIG.BF_EASY_REFERENCE.MENU_CONFIG = menuConfig;
});

Hooks.on("getProseMirrorMenuDropDowns", (proseMirrorMenu, dropdowns) => {
  const entries = Object.entries(CONFIG.BF_EASY_REFERENCE.MENU_CONFIG)
    // Only show enabled options or those without settings
    .filter(
      ([_, value]) =>
        !value.setting?.key ||
        game.settings.get("bf-easy-reference", value.setting.key),
    )
    // Create menu items
    .map(([key, value]) => ({
      title: game.i18n.localize(value.title),
      action: `${key.slugify()}-menu-item`,
      cmd: value.onMenuItemClick
        ? () => value.onMenuItemClick?.(proseMirrorMenu)
        : undefined,
      children: (typeof value.items === "function"
        ? value.items()
        : value.items
      )?.map((item) => ({
        title: item.title,
        action: `${key.slugify()}-${item.key.slugify()}-sub-menu-item`,
        cmd: item.onMenuItemClick
          ? () => item.onMenuItemClick?.(proseMirrorMenu)
          : undefined,
      })),
    }))
    // Sort by title for the current locale
    .sort((a, b) => a.title.localeCompare(b.title));

  // Assign to own menu
  dropdowns.dndeasyreference = {
    action: "reference",
    title: '<i class="fa-solid fa-books"></i>',
    entries,
  };
});
