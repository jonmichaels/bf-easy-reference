/** @import { SubMenuItem } from './types/_types.mjs' */

import { insertText } from './prose-mirror/utils.mjs';

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
    const sourceData = foundry.utils.getProperty(CONFIG.BlackFlag, source) || {};
    entries.push(
      ...Object.entries(sourceData)
        .filter(([key, value]) => !filter || filter(key, value))
        .map(([key, value]) => ({
          title: value.label || value.name || key,
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
  referenceType,
  callback,
}) {
  const references = referenceType
    ? CONFIG.BlackFlag.ruleTypes?.[referenceType]?.references
    : null;
  const resolvedSource = references ?? source;
  return createSubMenuEntriesFromSourceData({
    source: resolvedSource,
    callback,
    filter: (_key, value) => !!value.reference || typeof value === "string",
  });
}

export function insertReference({ key, menu, type }) {
  const reference = type ? `${type}=${key}` : key;
  insertText({ text: `&Reference[${reference}]`, menu });
}
