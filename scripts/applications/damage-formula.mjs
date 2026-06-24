const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { ArrayField, BooleanField, SchemaField, SetField, StringField } =
  foundry.data.fields;

/**
 * @typedef {object} DamageConfig
 * @property {string} formula     The damage formula.
 * @property {string[]} types     The types of damage.
 */

export default class DamageFormulaDialog extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["damage-formula-dialog"],
    tag: "form",
    form: {
      handler: DamageFormulaDialog.handleFormSubmit,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    position: {
      width: 400,
      height: "auto",
    },
    window: {
      title: "BFREF.MENU.DIALOG",
      contentClasses: ["standard-form"],
    },
    actions: {
      addPart: DamageFormulaDialog.#addPart,
      deletePart: DamageFormulaDialog.#deletePart,
    },
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static PARTS = {
    config: {
      template: "modules/bf-easy-reference/templates/damage/config.hbs",
    },
    formulas: {
      template: "modules/bf-easy-reference/templates/damage/formulas.hbs",
      scrollable: [""],
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  /* -------------------------------------------------- */

  /**
   * @type {DamageFormulaModel}
   */
  #model = new DamageFormulaModel();

  /* -------------------------------------------------- */

  /**
   * Resulting configuration.
   * @type {object|null}
   */
  #config = null;
  get config() {
    return this.#config;
  }

  /* -------------------------------------------------- */

  /**
   * Final text to inject.
   * @type {string|null}
   */
  get #text() {
    let parts = [];
    for (const { formula, types } of this.#model.parts) {
      if (!formula) continue;
      const type = types.size ? `type=${Array.from(types).join("|")}` : "";
      parts.push([formula, type].filter(Boolean).join(" "));
    }

    const hasOptions = this.#model.average || this.#model.extended;

    if (!parts.length && !hasOptions) return null;

    let command = parts.length ? parts.join(" & ") : "";

    const options = [
      this.#model.average ? "average" : null,
      this.#model.extended ? "extended" : null,
    ].filter(Boolean);

    if (options.length > 0) {
      if (command) command += " ";
      command += options.join(" ");
    }

    return `[[/damage ${command}]]`;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = {};

    const parts = (context.parts = []);
    for (const [i, part] of this.#model.parts.entries()) {
      parts.push({
        idx: i,
        rule: i > 0,
        formula: {
          field: this.#model.schema.getField("parts.element.formula"),
          value: part.formula,
          placeholder: game.i18n.localize("BFREF.DIALOG.FORMULA"),
          name: `parts.${i}.formula`,
        },
        types: {
          field: this.#model.schema.getField("parts.element.types"),
          value: part.types,
          name: `parts.${i}.types`,
        },
      });
    }

    context.average = {
      field: this.#model.schema.getField("average"),
      value: this.#model.average,
    };

    context.extended = {
      field: this.#model.schema.getField("extended"),
      value: this.#model.extended,
    };

    context.buttons = [
      {
        type: "submit",
        icon: "fa-solid fa-check",
        label: "Confirm",
      },
    ];

    return context;
  }

  /* -------------------------------------------------- */
  /* Event Handlers                                     */
  /* -------------------------------------------------- */

  /**
   * @this {DamageFormulaDialog}
   * @param {SubmitEvent} event
   * @param {HTMLFormElement} form
   * @param {FormDataExtended} formData
   * @param {object} submitOptions
   */
  static handleFormSubmit(event, form, formData, submitOptions) {
    switch (event.type) {
      case "change":
        this.#model.updateSource(formData.object);
        break;
      case "submit":
        this.#config = this.#text;
        this.close();
        break;
    }
  }

  /* -------------------------------------------------- */

  /**
   * @this {DamageFormulaDialog}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static #addPart(event, target) {
    const parts = this.#model.toObject().parts;
    parts.push({ formula: "", types: [] });
    this.#model.updateSource({ parts });
    this.render({ parts: ["formulas"] });
  }

  /* -------------------------------------------------- */

  /**
   * @this {DamageFormulaDialog}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static #deletePart(event, target) {
    const idx = parseInt(target.dataset.idx);
    const parts = this.#model.toObject().parts;
    parts.splice(idx, 1);
    this.#model.updateSource({ parts });
    this.render({ parts: ["formulas"] });
  }

  /* -------------------------------------------------- */
  /* Factory methods                                    */
  /* -------------------------------------------------- */

  /**
   * @param {object} [options]
   * @returns {Promise<string|null>}      The text, or `null`.
   */
  static async create(options = {}) {
    const { promise, resolve } = Promise.withResolvers();
    const application = new this(options);
    
    if (options.initialData) {
      const dataToApply = foundry.utils.deepClone(options.initialData);
      if (dataToApply.parts && Array.isArray(dataToApply.parts)) {
        dataToApply.parts.forEach((part) => {
          if (part.types && !(part.types instanceof Set)) {
            try {
              part.types = new Set(
                Array.isArray(part.types) ? part.types : [part.types]
              );
            } catch (e) {
              console.warn(
                "Black Flag Easy References | DamageFormulaDialog: Could not convert initial types to Set, defaulting to empty.",
                e
              );
              part.types = new Set();
            }
          } else if (!part.types) {
            part.types = new Set();
          }
        });
      } else {
        delete dataToApply.parts;
      }
      if (dataToApply.average === undefined) delete dataToApply.average;
      if (dataToApply.extended === undefined) delete dataToApply.extended;

      application.#model.updateSource(dataToApply);
    }

    application.addEventListener("close", () => resolve(application.config), {
      once: true,
    });
    application.render({ force: true });
    return promise;
  }
}

/* -------------------------------------------------- */

/**
 * The data model representing the form's data.
 */
class DamageFormulaModel extends foundry.abstract.DataModel {
  /** @inheritdoc */
  static defineSchema() {
    return {
      average: new BooleanField({
        label: "BFREF.DIALOG.AVERAGE",
      }),
      extended: new BooleanField({
        label: "BFREF.DIALOG.EXTENDED",
      }),
      parts: new ArrayField(
        new SchemaField({
          formula: new black-flag.dataModels.fields.FormulaField({ required: true }),
          types: new SetField(
            new StringField({
              required: true,
              choices: CONFIG.BlackFlag.damageTypes,
            })
          ),
        })
      ),
    };
  }
}
