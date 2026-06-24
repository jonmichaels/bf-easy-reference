const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class CheckFormulaDialog extends HandlebarsApplicationMixin(
	ApplicationV2
) {
	/** @inheritdoc */
	static DEFAULT_OPTIONS = {
		classes: ["check-formula-dialog"],
		tag: "form",
		form: {
			handler: CheckFormulaDialog.handleFormSubmit,
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
			addCheck: CheckFormulaDialog.#addCheck,
			deleteCheck: CheckFormulaDialog.#deleteCheck,
		},
	};

	static PARTS = {
		config: {
			template: "modules/bf-easy-reference/templates/check/config.hbs",
		},
		checks: {
			template: "modules/bf-easy-reference/templates/check/formulas.hbs",
			scrollable: [""],
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	/**
	 * @type {CheckFormulaModel}
	 */
	#model = new CheckFormulaModel();

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
		let checks = [];
		for (const { type } of this.#model.checks) {
			if (!type) continue;

			if (Object.keys(this.toolsMap || {}).includes(type)) {
				checks.push(`tool=${type}`);
			} else {
				checks.push(type);
			}
		}

		if (!checks.length) return null;

		let command = checks.join(" ");

		if (this.#model.dc) {
			command += ` dc=${this.#model.dc}`;
		}

		if (this.#model.format === "long") {
			command += " format=long";
		}

		if (this.#model.passive) {
			command += " passive";
		}

		return `[[/check ${command}]]`;
	}

	/** @inheritdoc */
	async _prepareContext(options) {
		const context = {};

		const checks = (context.checks = []);
		for (const [i, check] of this.#model.checks.entries()) {
			checks.push({
				idx: i,
				rule: i > 0,
				type: {
					field: this.#model.schema.getField("checks.element.type"),
					value: check.type,
					name: `checks.${i}.type`,
				},
			});
		}

		context.dc = {
			field: this.#model.schema.getField("dc"),
			value: this.#model.dc,
		};

		context.format = {
			field: this.#model.schema.getField("format"),
			value: this.#model.format,
		};

		context.passive = {
			field: this.#model.schema.getField("passive"),
			value: this.#model.passive,
		};

		context.abilities = CONFIG.BlackFlag.abilities;
		context.skills = CONFIG.BlackFlag.skills;

		const tools = Object.values(CONFIG.BlackFlag.enrichment.lookup.tools ?? {}).reduce((acc, entry) => {
			acc[entry.key] = entry.label;
			return acc;
		}, {});

		this.toolsMap = tools;
		context.tools = tools;

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
	 * @this {CheckFormulaDialog}
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

	/**
	 * @this {CheckFormulaDialog}
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 */
	static #addCheck(event, target) {
		const checks = this.#model.toObject().checks;
		checks.push({ type: "" });
		this.#model.updateSource({ checks });
		this.render({ parts: ["checks"] });
	}

	/**
	 * @this {CheckFormulaDialog}
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 */
	static #deleteCheck(event, target) {
		const idx = parseInt(target.dataset.idx);
		const checks = this.#model.toObject().checks;
		checks.splice(idx, 1);
		this.#model.updateSource({ checks });
		this.render({ parts: ["checks"] });
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
			const dataToApply = { ...options.initialData };

			if (dataToApply.checks && !Array.isArray(dataToApply.checks)) {
				if (
					typeof dataToApply.checks === "object" &&
					dataToApply.checks !== null &&
					dataToApply.checks.type
				) {
					dataToApply.checks = [dataToApply.checks];
				} else {
					delete dataToApply.checks;
				}
			} else if (dataToApply.checks && dataToApply.checks.length === 0) {
				// Do nothing
			} else if (!dataToApply.checks) {
				delete dataToApply.checks;
			}
			
			// Remove undefined properties to avoid overriding model defaults unintentionally
			Object.keys(dataToApply).forEach((key) => {
				if (dataToApply[key] === undefined) {
					delete dataToApply[key];
				}
			});
			application.#model.updateSource(dataToApply);
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
class CheckFormulaModel extends foundry.abstract.DataModel {
	/** @inheritdoc */
	static defineSchema() {
		return {
			dc: new foundry.data.fields.NumberField({
				required: true,
				initial: 15,
				min: 0,
				integer: true,
				label: "BFREF.DIALOG.DC",
			}),
			format: new foundry.data.fields.StringField({
				required: true,
				initial: "short",
				choices: {
					short: "BFREF.SETTINGS.FORMAT.SHORT",
					long: "BFREF.SETTINGS.FORMAT.LONG",
				},
				label: "BFREF.SETTINGS.FORMAT.TITLE",
			}),
			passive: new foundry.data.fields.BooleanField({
				label: "BFREF.DIALOG.PASSIVE",
			}),
			checks: new foundry.data.fields.ArrayField(
				new foundry.data.fields.SchemaField({
					type: new foundry.data.fields.StringField({ required: true }),
				}),
				{
					initial: () => {
						const defaultType = Object.keys(CONFIG.BlackFlag.abilities)[0] || "";
						return [{ type: defaultType }];
					},
				}
			),
		};
	}
}
