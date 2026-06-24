const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { StringField, BooleanField } = foundry.data.fields;

/**
 * @typedef {object} ConditionConfig
 * @property {string} condition   The ID of the selected condition.
 * @property {boolean} apply      Indicates whether the Apply button should be displayed.
 */

export default class ConditionFormulaDialog extends HandlebarsApplicationMixin(
  ApplicationV2,
) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["condition-formula-dialog"],
    tag: "form",
    form: {
      handler: ConditionFormulaDialog.handleFormSubmit,
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
      template: "modules/bf-easy-reference/templates/condition/config.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  /* -------------------------------------------------- */

  /**
   * @type {ConditionFormulaModel}
   */
  #model = new ConditionFormulaModel();

  /* -------------------------------------------------- */

  /**
   * Resulting configuration.
   * @type {string|null}
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
    if (!this.#model.condition) return null;

    let command = `&Reference[condition=${this.#model.condition}`;

    if (!this.#model.apply) {
      command += ` apply=false`;
    }

    command += `]`;
    return command;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = {};

    const conditionChoices = Object.entries(CONFIG.BlackFlag.conditions ?? {})
      .filter(([key, data]) => data?.reference)
      .reduce((acc, [key, data]) => {
        // Account for label prop name change over time. Easy compatibility.
        acc[key] = game.i18n.localize(data.label ?? data.name ?? key);
        return acc;
      }, {});

    context.condition = {
      field: this.#model.schema.getField("condition"),
      value: this.#model.condition,
      choices: conditionChoices,
      label: game.i18n.localize("BFREF.MENU.CONDITIONTYPES.TITLE"),
      placeholder: game.i18n.localize("BFREF.DIALOG.PLACEHOLDER"),
    };

    context.apply = {
      field: this.#model.schema.getField("apply"),
      value: this.#model.apply,
      label: game.i18n.localize("BFREF.DIALOG.APPLY"),
    };

    context.buttons = [
      {
        type: "submit",
        icon: "fa-solid fa-check",
        label: game.i18n.localize("BFREF.DIALOG.CONFIRM"),
      },
    ];

    return context;
  }

  /* -------------------------------------------------- */
  /* Event Handlers                                     */
  /* -------------------------------------------------- */

  /**
   * @this {ConditionFormulaDialog}
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
        if (!this.#model.condition) {
          ui.notifications.warn(
            game.i18n.localize("BFREF.DIALOG.CONDITION.WARN_NO_CONDITION"),
          );
          return;
        }
        this.#config = this.#text;
        if (this.callback) this.callback(this.#config);
        this.close();
        break;
    }
  }

  /* -------------------------------------------------- */
  /* Factory methods                                */
  /* -------------------------------------------------- */

  /**
   * @param {object} data
   */
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
    const application = new this({ ...options, callback: resolve });
    if (options.initialData) {
      application.#model.updateSource(options.initialData);
    }
    application.render({ force: true });
    application.addEventListener(
      "close",
      (event) => {
        if (application.config === null) {
          resolve(null);
        }
      },
      { once: true },
    );
    return promise;
  }
}

/* -------------------------------------------------- */

/**
 * The data model representing the form's data.
 */
class ConditionFormulaModel extends foundry.abstract.DataModel {
  /** @inheritdoc */
  static defineSchema() {
    const conditionIds = Object.entries(CONFIG.BlackFlag.conditions ?? {})
      .filter(([key, data]) => data?.reference)
      .map(([key, _]) => key);

    const initialCondition = conditionIds.length > 0 ? conditionIds[0] : "";

    return {
      condition: new StringField({
        required: true,
        blank: false,
        initial: initialCondition,
        choices: conditionIds,
        label: "BFREF.MENU.CONDITIONTYPES.TITLE",
      }),
      apply: new BooleanField({
        required: true,
        initial: true,
        label: "BFREF.DIALOG.CONFIRM",
      }),
    };
  }
}
