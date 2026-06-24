// @ts-check

import {
  getBlockNodeFromCursorLocation,
  getSelectedText,
  sliceSelection,
} from "../prose-mirror/utils.mjs";

/**
 * Creates the Foundry callout node. When content is selected,
 * this will extract the selected content and put it within
 * the content area of the callout.
 * @param {Object} params  the fields needed for creating
 * @param {any} params.menu a ProseMirrorMenu instance
 * @param {string} params.title the callout title
 * @param {string} params.text the callout body text
 * @param {string} params.cssClass any classes for the containing element
 * @param {string} params.icon the icon src to show as an `img` element
 * @returns
 */
export function getCalloutNode({ menu, title, text, cssClass, icon }) {
  const schema = menu.schema;

  const nodes =
    // if content is selected, slice it
    sliceSelection(menu) ??
    // if no selection, then select the entire block
    // and reference as an array of 1 
    getBlockNodeFromCursorLocation({ menu, selectBlockOnSuccess: true });

  let articleNodes = [];

  // only interpolate nodes if they actually have some text content
  if (nodes?.some((n) => !!n.textContent?.trim().length)) {
    articleNodes.push(...nodes);
  } else {
    let content = game.i18n.localize(text || " ");
    articleNodes.push(
      schema.nodes.paragraph.create(null, schema.text(content)),
    );
  }

  const node = schema.nodes.div.create({ _preserve: { class: cssClass } }, [
    schema.nodes.figure.create({ _preserve: { class: "icon" } }, [
      schema.nodes.image.create({
        src: icon,
        _preserve: { class: "round" },
      }),
    ]),
    schema.nodes.article.create(null, [
      schema.nodes.heading.create(
        { level: 4 },
        schema.text(game.i18n.localize(title)),
      ),
      ...articleNodes,
    ]),
  ]);

  return node;
}

/**
 * Creates HTML for a pull quote.
 * @param {Object} params the parameters needed for creating the HTML
 * @param {any} params.menu a ProseMirrorMenu instance
 * @param {string} params.cssClass extra classes for the containing element
 * @returns
 */
export function getPullQuoteHtml({ menu, cssClass }) {
  const quote =
    getSelectedText(menu) ||
    game.i18n.localize("BFREF.MENU.STYLE.PULL_QUOTE_CONTENT");
  const author = game.i18n.localize("BFREF.MENU.STYLE.PULL_QUOTE_AUTHOR");
  const source = game.i18n.localize("BFREF.MENU.STYLE.PULL_QUOTE_SOURCE");

  return `
<aside class="quote-lg ${cssClass}">
    <p><q><selection>${quote}</selection></q></p>
    <p class="author">—${author}, <em>${source}</em></p>
</aside>
`;
}
