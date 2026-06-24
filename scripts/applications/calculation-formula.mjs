const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class CalculationFormulaDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["calculation-formula-dialog"],
    tag: "form",
    form: {
      handler: CalculationFormulaDialog.handleFormSubmit,
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
      template: "modules/bf-easy-reference/templates/calculation/formulas.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  /** @type {CalculationFormulaModel} */
  #model = new CalculationFormulaModel();

  /** @type {object|null} */
  #config = null;
  get config() {
    return this.#config;
  }

  /** @type {string|null} */
  get #text() {
    const formula = this.#model.formula?.trim();
    if (!formula) return null;
    return `[[calc ${formula}]]`;
  }

  /** @inheritdoc */
  async _prepareContext(options) {
    return {
      formula: {
        field: this.#model.schema.getField("formula"),
        value: this.#model.formula,
      },
      trackableOptions: this._prepareTrackableOptions(),
      buttons: [
        {
          type: "submit",
          icon: "fa-solid fa-check",
          label: "Confirm",
        },
      ],
    };
  }

  /**
   * Prepares human-readable roll-data paths that are useful in calculation formulas.
   * @returns {Array<{value: string, label: string, group: string}>}
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
   * @this {CalculationFormulaDialog}
   * @param {SubmitEvent} event
   * @param {HTMLFormElement} form
   * @param {FormDataExtended} formData
   * @param {object} submitOptions
   */
  static handleFormSubmit(event, form, formData, submitOptions) {
    switch (event.type) {
      case "change": {
        const update = { ...formData.object };
        if (update.calculationPathHelper) {
          update.formula = [update.formula, update.calculationPathHelper].filter(Boolean).join(" ");
          delete update.calculationPathHelper;
        }
        this.#model.updateSource(update);
        if (formData.object.calculationPathHelper) this.render({ parts: ["form"] });
        break;
      }
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
   * @returns {Promise<string|null>}
   */
  static async create(options = {}) {
    const { promise, resolve } = Promise.withResolvers();
    const application = new this(options);
    application.addEventListener("close", () => resolve(application.config), { once: true });
    application.render({ force: true });
    return promise;
  }
}

/** The data model representing the form's data. */
class CalculationFormulaModel extends foundry.abstract.DataModel {
  /** @inheritdoc */
  static defineSchema() {
    return {
      formula: new foundry.data.fields.StringField({
        required: true,
        initial: "@attributes.hp.value + 5",
        label: "BFREF.DIALOG.FORMULA",
      }),
    };
  }
}
