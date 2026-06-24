/** @import { SubMenuItem } from './types/_types.mjs' */

/**
 * @typedef SourceDataMenuEntriesOptions
 * @property {string|string[]} source
 * @property {(key: string, value: any) => boolean} [filter]
 * @property {(args: { key: string, value: any, menu: any}) => Promise<void>} [callback]
 */

/**
 * @typedef ReferenceSourceDataMenuEntriesOptions
 * @property {string|string[]} source
 * @property {(args: { key: string, value: any, menu: any}) => Promise<void>} [callback]
 */

/**
 * @param {SourceDataMenuEntriesOptions} args
 * @returns {SubMenuItem[]}
 */
export function createSubMenuEntriesFromSourceData({
  source,
  callback,
  filter,
}) {
  const sources = (typeof source === "string" ? [source] : source) ?? [];

  const entries = [];

  for (const source of sources) {
    entries.push(
      ...Object.entries(CONFIG.BlackFlag[source] || {})
        .filter(([key, value]) => !filter || filter(key, value))
        .map(([key, value]) => ({
          title: value.label || key,
          key: key,
          onMenuItemClick: async (menu) =>
            await callback?.({ key, value, menu }),
        })),
    );
  }

  return entries;
}

/**
 *
 * @param {ReferenceSourceDataMenuEntriesOptions} args
 * @returns
 */
export function createReferenceSubMenuEntriesFromSourceData({
  source,
  callback,
}) {
  return createSubMenuEntriesFromSourceData({
    source,
    callback,
    filter: (_key, value) => !!value.reference,
  });
}
