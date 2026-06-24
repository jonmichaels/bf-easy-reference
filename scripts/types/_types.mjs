// @ts-check

/**
 * @typedef MenuConfigItem    A menu item in the Black Flag Easy References menu at the top level.
 * @property {string} title   The text to show for the menu item.
 * @property {MenuItemClickCallback} [onMenuItemClick]    What to do when the menu item is clicked.
 * @property {SubMenuItem[] | (() => SubMenuItem[])} [items]    Submenu items, or a function for retrieving submenu items.
 * @property {MenuConfigItemConfigSetting} [setting]    For internal use only. Sets up visibility toggle settings for built-in easy references.
 */

/**
 * @typedef MenuConfigItemConfigSetting    The data needed to established a visibility toggle for a given MenuConfigItem.
 * @property {string} key    The setting key, which is used to save and load the setting.
 * @property {string} name   The localization key for the setting name.
 */

/**
 * @typedef {(menu: any) => Promise<void>} MenuItemClickCallback    What to do when the menu item is clicked.
 *                                                                  `menu` is a `ProseMirrorMenu` instance, which is used
 *                                                                  to access commands for toggling blocks, inserting text, etc.
 */

/**
 * @typedef SubMenuItem    A submenu item.
 * @property {string} title    The text to show for the submenu item.
 * @property {string} key    A unique identifier for this submenu item amongst its direct peers menu items.
 * @property {MenuItemClickCallback?} onMenuItemClick    What to do when this submenu item is clicked.
 */
