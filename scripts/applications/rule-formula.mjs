const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { StringField } = foundry.data.fields;

/**
 * @typedef {object} RuleConfig
 * @property {string} rule     The selected rule.
 */

export default class RuleFormulaDialog extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["rule-formula-dialog"],
    tag: "form",
    form: {
      handler: RuleFormulaDialog.handleFormSubmit,
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
    config: {
      template: "modules/bf-easy-reference/templates/rule/config.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  /* -------------------------------------------------- */

  /**
   * @type {RuleFormulaModel}
   */
  #model = new RuleFormulaModel();

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
    if (!this.#model.rule) return null;
    return `&Reference[${this.#model.rule}]`;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = {};

    const rulesConfig = CONFIG.BlackFlag.rules || {};

    const rules = Object.keys(rulesConfig).map((key) => ({
      value: key,
      label: rulesConfig[key]?.label || key,
    }));

    context.rule = {
      field: this.#model.schema.getField("rule"),
      value: this.#model.rule,
      choices: rules,
      placeholder: game.i18n.localize("BFREF.DIALOG.PLACEHOLDER"),
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
   * @this {RuleFormulaDialog}
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
  /* Factory methods                               */
  /* -------------------------------------------------- */

  /**
   * @param {object} [options]
   * @returns {Promise<string|null>}      The text, or `null`.
   */
  static async create(options = {}) {
    const { promise, resolve } = Promise.withResolvers();
    const application = new this(options);
    
    if (options.initialData && options.initialData.rule) {
      application.#model.updateSource({ rule: options.initialData.rule });
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
 * The data model representing the form's data. */
class RuleFormulaModel extends foundry.abstract.DataModel {
  /** @inheritdoc */
  static defineSchema() {
    const rules = CONFIG.BlackFlag.rules || {};
    const ruleKeys = Object.keys(rules);
    const initialRule = ruleKeys.length > 0 ? ruleKeys[0] : null;

    return {
      rule: new StringField({
        label: "BFREF.DIALOG.RULES_SEARCH",
        required: true,
        initial: "",
        blank: true,
        choices: () => {
          return Object.keys(rules).reduce((acc, key) => {
            acc[key] = rules[key]?.label ?? key;
            return acc;
          }, {});
        },
      }),
    };
  }
}
