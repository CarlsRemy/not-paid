class NotPaidDialog extends HTMLElement {
	private shadow: ShadowRoot;
	private _message: string = '';
	private _mode: string = 'dialog';
	private _theme: string | undefined = 'light';

	static get observedAttributes() {
		return ['message', 'mode', 'theme'];
	}

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		this.render();
	}

	set message(v: string) {
		this._message = v;
		this.setAttribute('message', v);
	}

	get message() {
		return this._message;
	}

	set mode(v: string) {
		this._mode = v;
		this.setAttribute('mode', v);
	}

	get mode() {
		return this._mode;
	}

	set theme(v: string | undefined) {
		this._theme = v;
		if (v) this.setAttribute('theme', v);
	}

	get theme() {
		return this._theme;
	}

	render() {
		const style = document.createElement('style');
		style.textContent = `
			:host { display: block; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; z-index: 9999; }
		  dialog { width: 400px;max-width: 90vw; height: auto; border: none; }
			.not-paid { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
			.not-paid.dark { background: #222; color: #fff }
			.np-container p { margin-bottom: 12px }
			.np-close { padding: 8px 14px; background: #667eea; color: #fff; border: none; border-radius: 6px; cursor: pointer }
		`;

		this.shadow.appendChild(style);
	}

	setContent(node: HTMLElement) {
    this.shadow.innerHTML = "";
    this.shadow.appendChild(node);
  }
}

customElements.define('not-paid-dialog', NotPaidDialog);

export { NotPaidDialog as notPaidDialog };