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
    const seen = new Set();
    const trackable = CONFIG.Actor.trackableAttributes ?? {};

    const addOption = (path, group) => {
      if (!path || seen.has(path)) return;
      seen.add(path);
      const option = BlackFlag.utils.getAttributeOption(path);
      options.push({
        value: `@${path}`,
        label: option.label ?? path,
        group: option.group ?? group,
      });
    };

    for (const [actorType, categories] of Object.entries(trackable)) {
      const actorLabel = CONFIG.Actor.typeLabels?.[actorType] ?? actorType;
      const group = game.i18n.localize(actorLabel);
      for (const paths of Object.values(categories)) {
        for (const path of paths) addOption(path, group);
      }
    }

    return options.sort((a, b) => {
      const groupSort = (a.group ?? "").localeCompare(b.group ?? "");
      if (groupSort) return groupSort;
      return a.label.localeCompare(b.label);
    });
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