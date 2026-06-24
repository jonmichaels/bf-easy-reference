/** @import { MenuConfigItem } from './types/_types.mjs' */

/**
 * Establish config settings for toggling visibility of each type of easy reference menu item.
 * @param {Record<string, MenuConfigItem>} items
 */
export function initSettings(items) {
  Object.values(items)
    .filter((item) => item.setting?.key && item.setting?.name)
    .toSorted((a, b) =>
      game.i18n
        .localize(a.setting.name)
        .localeCompare(game.i18n.localize(b.setting.name)),
    )
    .forEach((value) => {
      console.log("Black Flag Easy References | registering setting", value);
      game.settings.register("bf-easy-reference", value.setting.key, {
        name: value.setting.name,
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
      });
    });
}
