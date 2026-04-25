/**
 * Sistema de Hooks/Eventos para NotPaid
 * Permite suscribirse y reaccionar a eventos del ciclo de vida
 */

export type NotPaidEventType = 
  | "expired" 
  | "close" 
  | "days-remaining" 
  | "reset" 
  | "display" 
  | "update";

export interface IEventListener<T = any> {
  (payload: T): void;
}

export interface IEventListeners {
  [key: string]: IEventListener[];
}

/**
 * Gestor de eventos para NotPaid
 */
export class EventManager {
  private listeners: IEventListeners = {};

  /**
   * Suscribirse a un evento
   */
  on<T = any>(event: NotPaidEventType, callback: IEventListener<T>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback as IEventListener);

    // Retornar función para desuscribirse
    return () => this.off(event, callback);
  }

  /**
   * Suscribirse a un evento solo una vez
   */
  once<T = any>(event: NotPaidEventType, callback: IEventListener<T>): () => void {
    const wrapper = (payload: T) => {
      callback(payload);
      this.off(event, wrapper as IEventListener);
    };

    return this.on(event, wrapper as IEventListener<T>);
  }

  /**
   * Desuscribirse de un evento
   */
  off(event: NotPaidEventType, callback: IEventListener): void {
    if (!this.listeners[event]) return;

    const index = this.listeners[event].indexOf(callback);
    if (index > -1) {
      this.listeners[event].splice(index, 1);
    }

    // Limpiar si no quedan listeners
    if (this.listeners[event].length === 0) {
      delete this.listeners[event];
    }
  }

  /**
   * Emitir un evento
   */
  emit<T = any>(event: NotPaidEventType, payload?: T): void {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`[EventManager] Error en listener de "${event}":`, error);
      }
    });
  }

  /**
   * Eliminar todos los listeners de un evento
   */
  removeAllListeners(event?: NotPaidEventType): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }

  /**
   * Obtener cantidad de listeners para un evento
   */
  listenerCount(event: NotPaidEventType): number {
    return this.listeners[event]?.length ?? 0;
  }

  /**
   * Obtener todos los nombres de eventos con listeners activos
   */
  eventNames(): string[] {
    return Object.keys(this.listeners);
  }
}

/**
 * Tipos de payloads para cada evento
 */
export interface NotPaidEventPayloads {
  expired: number; // días de retraso
  close: void;
  "days-remaining": number; // días restantes
  reset: void;
  display: { mode: string };
  update: any;
}
