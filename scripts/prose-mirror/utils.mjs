/**
 * @typedef InsertTextParams  The parameters for performing a textual replacement.
 * @property {any} menu          The ProseMirrorMenu instance.
 * @property {string|null|undefined} text       HTML text. Use `<selection>My Default Text</selection>` to use
 *                               a fallback value when there is no text to replace.
 */

/**
 * Inserts text in place at the cursor location in the relevant prosemirror instance.
 *
 * @param {InsertTextParams} params   The parameters for inserting text into the editor.
 * @returns {void}
 */
export function insertText({ text, menu }) {
  if (!text) {
    return;
  }

  menu.view.dispatch(menu.view.state.tr.insertText(text).scrollIntoView());
}

/**
 * @typedef ReplaceSelectionParams  The parameters for performing an HTML replacement in the editor of the currently selected content.
 * @property {any} menu          The ProseMirrorMenu instance.
 * @property {string} html       HTML text. Use `<selection>My Default Text</selection>` to use
 *                               a fallback value when there is no text to replace.
 */

/**
 * Replaces the current selection, if any, with the supplied HTML.
 * Supports eagerly replacing content inside of `<selection>` with
 * a highlighted selection in the editor.
 * @param {ReplaceSelectionParams} params   The parameters for performing a textual replacement.
 * @returns {void}
 */
export function replaceSelection({ menu, html }) {
  const selection = getSelectedText(menu);

  html = html.replace(/<selection>(.*?)<\/selection>/, function (match, alt) {
    return selection || alt || "";
  });

  const node = ProseMirror.dom.parseString(html);

  replaceSelectionWithNode({ menu, node });
}

export function replaceSelectionWithNode({ menu, node }) {
  menu.view.dispatch(menu.view.state.tr.replaceSelectionWith(node));
}

export function getSelectedText(menu) {
  const state = menu.view.state;
  const { $from, $to } = state.selection;

  return $from && $to ? state.doc.textBetween($from.pos, $to.pos) : undefined;
}

/**
 * Slices the selection content into an array of nodes.
 * @param {any} menu          the ProseMirrorMenuInstance
 * @returns {any[]|undefined} an array of nodes, if there is
 *                            at least one node to return
 */
export function sliceSelection(menu) {
  const state = menu.view.state;
  const { $from, $to } = state.selection;

  const fragment =
    $from && $to ? state.doc.slice($from.pos, $to.pos) : undefined;

  if (!fragment || !fragment.content.content.length) {
    return undefined;
  }

  return fragment.content.content;
}

/**
 * Gets the topmost block node (just beneath root) related
 * to the cursor's current location.
 * @param {Object} params
 * @param {any} params.menu
 * @param {boolean} [params.selectBlockOnSuccess]  selects the block upon successfully finding a node.
 *                                                    This is useful for preparing a block replacement.
 * @returns {any[]|undefined}
 */
export function getBlockNodeFromCursorLocation({ menu, selectBlockOnSuccess }) {
  const state = menu.view.state;
  const node = state.selection.$head?.node(1);
  const pos = state.selection.$from?.before(1);

  if (node && selectBlockOnSuccess) {
    const NodeSelection = foundry.prosemirror.state.NodeSelection;
    const tr = state.tr.setSelection(NodeSelection.create(state.doc, pos));
    menu.view.dispatch(tr);
  }

  return node ? [node] : undefined;
}

/**
 * Toggles a block around the current block of content. This functions
 * just like Secret Blocks, for example.
 * @param {Object} options        the options for toggling the block
 * @param {any} options.menu           the ProseMirrorMenu instance
 * @param {string} [options.class]     a class to apply when toggling the block
 * @param {string} options.type        the schema member (div, paragraph, aside, figure, etc.)
 *                                to use as the block
 */
export function toggleBlock({ menu, class: cssClass, type }) {
  menu._toggleBlock(
    menu.schema.nodes[type],
    foundry.prosemirror.commands.wrapIn,
    { attrs: { _preserve: { class: cssClass } } },
  );
}
