const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class LookupFormulaDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["lookup-formula-dialog"],
    tag: "form",
    form: {
      handler: LookupFormulaDialog.handleFormSubmit,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    position: {
      width: 400,
      height: "auto",
    },
    window: {
      title: "BFREF.MENU.DIALOG",
      contentClasses: ["standard-form"]
    },
  };

  static PARTS = {
    config: {
      template: "modules/bf-easy-reference/templates/lookup/config.hbs",
    },
    attributes: {
      template: "modules/bf-easy-reference/templates/lookup/formulas.hbs",
      scrollable: [""]
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    }
  }

  /**
   * @type {LookupFormulaModel}
   */
  #model = new LookupFormulaModel();

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
    if (!this.#model.useName && !this.#model.attributePath) return null;

    let command = "";

    if (this.#model.useName) {
      command = "@name";
      if (this.#model.nameFormat && this.#model.nameFormat !== "none") {
        command += ` ${this.#model.nameFormat}`;
      }
    }
    else if (this.#model.attributePath) {
      command = this.#model.attributePath;
    }

    return `[[lookup ${command}]]`;
  }

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = {};

    context.useName = {
      field: this.#model.schema.getField("useName"),
      value: this.#model.useName,
    };

    context.nameFormat = {
      field: this.#model.schema.getField("nameFormat"),
      value: this.#model.nameFormat,
    };

    context.attributePath = {
      field: this.#model.schema.getField("attributePath"),
      value: this.#model.attributePath,
    };

    context.trackableOptions = this._prepareTrackableOptions();

    context.buttons = [{
      type: "submit",
      icon: "fa-solid fa-check",
      label: "Confirm",
    }];

    return context;
  }

  /**
   * Prepares the options for the traceable attributes dropdown menu.
   * @returns {Array}
   */
  _prepareTrackableOptions() {
    const options = [];
    const trackable = CONFIG.BlackFlag.trackableAttributes;

    const processObject = (obj, path = "") => {
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        for (const [key, value] of Object.entries(obj)) {
          const newPath = path ? `${path}.${key}` : `@${key}`;
          if (value === true) {
            options.push({
              value: newPath,
              label: newPath
            });
          }
          else if (value && typeof value === "object") {
            processObject(value, newPath);
          }
        }
      }
    };

    processObject(trackable);

    const specificOptions = [
      { value: "@attributes.spell.dc", label: "@attributes.spell.dc" },
      { value: "@attributes.spell.attack", label: "@attributes.spell.attack" },
      { value: "@details.type.config.label", label: "@details.type.config.label" }
    ];

    for (const option of specificOptions) {
      if (!options.some(o => o.value === option.value)) {
        options.push(option);
      }
    }

    return options;
  }

  /**
   * @this {LookupFormulaDialog}
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
    application.addEventListener("close", () => resolve(application.config), { once: true });
    application.render({ force: true });
    return promise;
  }
}

/**
 * The data model representing the form's data.
 */
class LookupFormulaModel extends foundry.abstract.DataModel {
  /** @inheritdoc */
  static defineSchema() {
    return {
      useName: new foundry.data.fields.BooleanField({
        label: "BFREF.DIALOG.LOOKUP.USE_NAME",
        initial: false
      }),
      nameFormat: new foundry.data.fields.StringField({
        required: false,
        initial: "none",
        choices: {
          "none": "BFREF.DIALOG.PLACEHOLDER",
          "lowercase": "BFREF.DIALOG.NAME_FORMAT.LOWERCASE",
          "uppercase": "BFREF.DIALOG.NAME_FORMAT.UPPERCASE",
          "capitalize": "BFREF.DIALOG.NAME_FORMAT.CAPITALIZE"
        },
        label: "BFREF.DIALOG.NAME_FORMAT.LABEL",
      }),
      attributePath: new foundry.data.fields.StringField({
        required: false,
        label: "BFREF.DIALOG.ATTRIBUTE_PATH",
      })
    };
  }
}