const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class HealFormulaDialog extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["heal-formula-dialog"],
    tag: "form",
    form: {
      handler: HealFormulaDialog.handleFormSubmit,
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

  static PARTS = {
    form: {
      template: "modules/bf-easy-reference/templates/heal/formulas.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  /**
   * @type {HealFormulaModel}
   */
  #model = new HealFormulaModel();

  /**
   * Resulting configuration.
   * @type {object|null}
   */
  #config = null;
  get config() {
    return this.#config;
  }

  /**
   * Text to inject.
   * @type {string|null}
   */
  get #text() {
    const formula = this.#model.formula;
    const healType = this.#model.healType;

    if (!formula && !healType) return null;

    let command = "[[/heal";

    if (formula) {
      command += ` ${formula}`;
    }

    if (healType && healType !== "healing") {
      command += ` ${healType}`;
    }


    command += "]]";

    return command;
  }

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = {};

    context.formula = {
      field: this.#model.schema.getField("formula"),
      value: this.#model.formula,
    };

    context.healType = {
      field: this.#model.schema.getField("healType"),
      value: this.#model.healType,
    };


    context.healingTypes = CONFIG.BlackFlag.healingTypes.localizedOptions;

    context.buttons = [
      {
        type: "submit",
        icon: "fa-solid fa-check",
        label: "Confirm",
      },
    ];

    return context;
  }

  /**
   * @this {HealFormulaDialog}
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
        if (this.callback) this.callback(this.#config);
        this.close();
        break;
    }
  }

  constructor(data) {
    super(data);
    this.callback = data.callback;
  }

  /**
   * @param {object} [options]
   * @returns {Promise<string|null>}      The text, or `null`.
   */
  static async create(options = {}) {
    const { promise, resolve } = Promise.withResolvers();
    const application = new this(options);
    
    if (options.initialData) {
      application.#model.updateSource(options.initialData);
    }

    application.addEventListener("close", () => resolve(application.config), {
      once: true,
    });
    application.render({ force: true });
    return promise;
  }
}

/**
 * The data model representing the form's data.
 */
class HealFormulaModel extends foundry.abstract.DataModel {
  /** @inheritdoc */
  static defineSchema() {
    return {
      formula: new foundry.data.fields.StringField({
        required: true,
        initial: "2d4",
        label: "BFREF.DIALOG.FORMULA",
      }),
      healType: new foundry.data.fields.StringField({
        required: true,
        initial: "healing",
        choices: CONFIG.BlackFlag.healingTypes.localizedOptions.map(({ value }) => value),
        label: "BFREF.DIALOG.TYPES",
      }),
    };
  }
}
