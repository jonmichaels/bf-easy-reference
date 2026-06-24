const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { BooleanField, StringField } = foundry.data.fields;

/**
 * @typedef {object} AttackConfig
 * @property {string} formula     The attack formula.
 * @property {boolean} extended   Indicates whether extended information should be displayed.
 */

export default class AttackFormulaDialog extends HandlebarsApplicationMixin(
  ApplicationV2,
) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["attack-formula-dialog"],
    tag: "form",
    form: {
      handler: AttackFormulaDialog.handleFormSubmit,
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
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static PARTS = {
    form: {
      template: "modules/bf-easy-reference/templates/attack/formulas.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  /* -------------------------------------------------- */

  /**
   * Model for dialogue data.
   * @type {AttackFormulaModel}
   */
  #model = new AttackFormulaModel();

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
   * Text to inject.
   * @type {string|null}
   */
  get #text() {
    const formula = this.#model.formula?.trim();
    const extended = this.#model.extended ? "extended" : null;

    if (!formula && !extended) return null;

    let command = "";
    if (formula) command += formula;
    if (extended) {
      if (command) command += " ";
      command += extended;
    }

    return `[[/attack ${command}]]`;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = {};

    context.formula = {
      field: this.#model.schema.getField("formula"),
      value: this.#model.formula,
      placeholder: game.i18n.localize("BFREF.DIALOG.FORMULA"),
      name: "formula",
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
   * Updates model source data on change, and apply resulting form on submit.
   * @this {AttackFormulaDialog}
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

  /**
   * Creates an instance of the application.
   * @param {object} [options]
   * @returns {Promise<string|null>}      The text, or `null`.
   */
  static async create(options = {}) {
    const { promise, resolve } = Promise.withResolvers();
    const application = new this(options);

    if (options.initialData) {
      const dataToApply = {
        formula: options.initialData.formula,
        extended: options.initialData.extended,
      };

      if (dataToApply.formula === undefined) {
        delete dataToApply.formula;
      }

      if (dataToApply.extended === undefined) {
        delete dataToApply.extended;
      }

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
class AttackFormulaModel extends foundry.abstract.DataModel {
  /** @inheritdoc */
  static defineSchema() {
    return {
      formula: new StringField({
        label: "BFREF.DIALOG.FORMULA",
      }),
      extended: new BooleanField({
        label: "BFREF.DIALOG.EXTENDED",
      }),
    };
  }
}
