import { StorageService } from './core/storage';
import { EventManager, NotPaidEventType, NotPaidEventPayloads } from './core/events';
import { parseDate, daysRemaining as utilDaysRemaining, daysLate as utilDaysLate, toISO } from './core/date-utils';
import { notPaidDialog } from './web';

export interface INotPaid {
	dueDate: Date;
	autoShow: boolean;
	message: string;


	debug ?: boolean;
	expirations ?: Array<{ key: string; date: string }>;
	mode ?: INotPaidModes["mode"];
	theme ?: INotPaidThemes["theme"];
	styles ?: object;
}

export interface INotPaidModes {
	mode?: "dialog" | "banner-top" | "banner-bottom" | "fullscreen";
}

export interface INotPaidThemes {
	theme?: "light" | "dark" | undefined;
}

class NotPaid implements INotPaid {

	dueDate: Date;
	autoShow: boolean;
	message: string;
	debug: boolean;
	mode: INotPaidModes["mode"];
	theme: INotPaidThemes["theme"];
	styles: object;
	expirations: Array<{ key: string; date: string }>;
	private storageKey : string = "not-paid-expiration";
	private storage: StorageService;
	private eventManager: EventManager;
	private Dialog: notPaidDialog;

	constructor(dueDate: Date, autoShow: boolean = true, message: string = "Tu prueba ha expirado. Por favor realiza el pago.", 
		mode: INotPaidModes["mode"] ="dialog", theme: INotPaidThemes["theme"] ="light", styles: object = {},
		debug: boolean = false, expirations: Array<{ key: string; date: string }> = []) {
		this.storage = new StorageService();
		this.eventManager = new EventManager();
		this.autoShow = autoShow
		this.message = message;
		
		this.debug = debug;
		this.expirations = expirations;
		this.mode = mode;
		this.theme = theme;
		this.styles = styles;
		
    if (!customElements.get('not-paid-dialog')) {
      customElements.define('not-paid-dialog', notPaidDialog);
    }

		this.Dialog = globalThis.document.createElement('not-paid-dialog') as notPaidDialog;


    let DateInput = parseDate(
      dueDate ?? this.storage.get<string>(this.storageKey)
    );

		if (!DateInput) {
      this.dueDate = new Date();
    }else{
			this.dueDate = DateInput;
		}
		
		this.persistDate(this.dueDate);
		if (this.autoShow ) this.checkAndShow();
	}
	
  /* --------------------------------------------- */
  /*  UTILIDADES DE FECHA                          */
  /* --------------------------------------------- */
  private persistDate(date: Date): void {
    this.storage.save(this.storageKey, toISO(date));
  }

  daysRemaining(): number {
    return utilDaysRemaining(this.dueDate);
  }

	daysLate(): number { 
		return utilDaysLate(this.dueDate);
	}

	/* --------------------------------------------- */
  /*  SISTEMA DE HOOKS / EVENTOS                   */
  /* --------------------------------------------- */
  on<T = any>(event: NotPaidEventType, callback: (payload: T) => void): () => void {
    return this.eventManager.on(event, callback);
  }

  once<T = any>(event: NotPaidEventType, callback: (payload: T) => void): () => void {
    return this.eventManager.once(event, callback);
  }

  off(event: NotPaidEventType, callback: (payload: any) => void): void {
    this.eventManager.off(event, callback);
  }

  private emit<T extends NotPaidEventType>(event: T, payload?: NotPaidEventPayloads[T]): void {
    this.eventManager.emit(event, payload);
  }

	/* --------------------------------------------- */
  /*  MODOS VISUALES                               */
  /* --------------------------------------------- */
  createElement() {

    const div = document.createElement("div");
    div.classList.add("not-paid", this.mode ?? "dialog", this.theme ?? "light");

    // mensaje
    div.innerHTML = `
      <div class="np-container">
        <p>${this.message}</p>
        <button class="np-close">Cerrar</button>
      </div>
    `;

    // aplicar estilos custom
    Object.assign(div.style, this.styles);

    // evento cerrar
    div.querySelector<HTMLButtonElement>(".np-close")?.addEventListener("click", (): void => {
      this.Dialog.remove();
      div.remove();
      this.emit("close");
    });

    return div;
  }

  display(mode?: INotPaidModes["mode"]): void {
    this.mode = mode ?? this.mode;
    const UI = this.createElement();

    switch(this.mode) {
      case "banner-top":
        UI.style.position = "fixed";
        UI.style.top = "0";
        UI.style.left = "0";
        break;

      case "banner-bottom":
        UI.style.position = "fixed";
        UI.style.bottom = "0";
        UI.style.left = "0";
        break;

      case "dialog":
        UI.style.position = "fixed";
        UI.style.top = "50%";
        UI.style.left = "50%";
        UI.style.transform = "translate(-50%, -50%)";
        break;

      case "fullscreen":
        UI.style.position = "fixed";
        UI.style.top = "0";
        UI.style.left = "0";
        UI.style.width = "100vw";
        UI.style.height = "100vh";
        UI.style.minWidth = "90vw";
        UI.style.display = "flex";
        UI.style.alignItems = "center";
        UI.style.justifyContent = "center";
        UI.style.zIndex = "9";
        break;
    }

    //this.Dialog.appendChild(UI)
    this.Dialog.setContent(UI)
		globalThis.document.body.appendChild(this.Dialog)
    this.emit("display", { mode: this.mode ?? "dialog" });
  }

  private checkAndShow(): void {
    const late = this.daysLate();

    if (late > 0) {
      this.log(`[not-paid] expirado hace ${late} días`);
      this.emit("expired", late);
      this.display();
    } else {
      this.log(`[not-paid] quedan ${this.daysRemaining()} días`);
      this.emit("days-remaining", this.daysRemaining());
    }
  }

	
	reset(): void {
    this.storage.remove(this.storageKey);
    this.emit("reset");
  }

  private log(msg: string): void {
    if (this.debug) console.log(msg);
  }
}

export default NotPaid;
export { NotPaid };
