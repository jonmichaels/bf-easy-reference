const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { BooleanField, NumberField, SchemaField } = foundry.data.fields;

/**
 * @typedef {object} AwardConfig
 * @property {number} xp          XP to award.
 * @property {number} gp          GP to award.
 * @property {number} sp          SP to award.
 * @property {number} cp          CP to award.
 * @property {boolean} each       Denotes whether the award is for each character (true) or to divide amongst the character (false).
 */

export default class AwardFormulaDialog extends HandlebarsApplicationMixin(
  ApplicationV2,
) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["award-formula-dialog"],
    tag: "form",
    form: {
      handler: AwardFormulaDialog.handleFormSubmit,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    position: {
      width: 400,
      height: "auto",
    },
    window: {
      title: "BFREF.MENU.AWARD.TITLE",
      contentClasses: ["standard-form"],
    },
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static PARTS = {
    config: {
      template: "modules/bf-easy-reference/templates/award/config.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  /* -------------------------------------------------- */

  /**
   * @type {AwardFormulaModel}
   */
  #model = new AwardFormulaModel();

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
    const parts = [];

    if (this.#model.xp > 0) {
      parts.push(`${this.#model.xp}xp`);
    }

    const currency = [];
    Object.entries(this.#model.currencies).forEach(([key, value]) => {
      if (value > 0) {
        currency.push(`${value}${key}`);
      }
    });

    if (currency.length > 0) {
      parts.push(currency.join(" "));
    }

    if (parts.length === 0) return null;

    let command = parts.join(" ");

    if (this.#model.each) {
      command += " each";
    }

    return `[[/award ${command}]]`;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(_options) {
    const context = {};

    context.xp = {
      field: this.#model.schema.getField("xp"),
      value: this.#model.xp,
    };

    context.currencies = this.#model.schema.fields.currencies
      .values()
      .map((v) => ({
        field: v,
        value: v.initial,
      }));

    context.each = {
      field: this.#model.schema.getField("each"),
      value: this.#model.each,
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
   * @this {AwardFormulaDialog}
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
class AwardFormulaModel extends foundry.abstract.DataModel {
  /** @inheritdoc */
  static defineSchema() {
    const currencies = Object.entries(CONFIG.BlackFlag.currencies)
      .toSorted((a, b) => a[1].conversion - b[1].conversion)
      .reduce((prev, [key, value]) => {
        prev[key] = new NumberField({
          label: value.label,
          min: 0,
          integer: true,
          initial: 0,
        });
        return prev;
      }, {});

    return {
      xp: new NumberField({
        label: "BFREF.DIALOG.XP",
        min: 0,
        integer: true,
        initial: 0,
      }),
      currencies: new SchemaField(currencies),
      each: new BooleanField({
        label: "BFREF.DIALOG.EACH",
        initial: false,
      }),
    };
  }
}
