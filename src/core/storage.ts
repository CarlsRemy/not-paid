/**
 * Servicio de persistencia de datos en localStorage
 * Proporciona métodos para guardar, recuperar, actualizar y eliminar datos
 */

export interface IStorageData {
  key: string;
  value: any;
  timestamp?: number;
  expiresAt?: number;
}

export class StorageService {
  private prefix: string = "not-paid";

  constructor(prefix?: string) {
    if (prefix) this.prefix = prefix;
  }

  /**
   * Construye la clave con el prefijo
   */
  private buildKey(key: string): string {
    return `${this.prefix}-${key}`;
  }

  /**
   * Guarda un dato en localStorage
   */
  save(key: string, value: any, expiresInMs?: number): void {
    try {
      const fullKey = this.buildKey(key);
      const data: IStorageData = {
        key,
        value,
        timestamp: Date.now(),
      };

      if (expiresInMs) {
        data.expiresAt = Date.now() + expiresInMs;
      }

      localStorage.setItem(fullKey, JSON.stringify(data));
    } catch (error) {
      console.error(`[StorageService] Error al guardar ${key}:`, error);
    }
  }

  /**
   * Recupera un dato del localStorage
   */
  get<T = any>(key: string): T | null {
    try {
      const fullKey = this.buildKey(key);
      const item = localStorage.getItem(fullKey);

      if (!item) return null;

      const data: IStorageData = JSON.parse(item);

      // Verificar si ha expirado
      if (data.expiresAt && Date.now() > data.expiresAt) {
        this.remove(key);
        return null;
      }

      return data.value as T;
    } catch (error) {
      console.error(`[StorageService] Error al obtener ${key}:`, error);
      return null;
    }
  }

  /**
   * Actualiza un dato en localStorage
   */
  update(key: string, value: any, expiresInMs?: number): void {
    const existing = this.get(key);
    if (existing !== null) {
      this.save(key, value, expiresInMs);
    }
  }

  /**
   * Elimina un dato del localStorage
   */
  remove(key: string): void {
    try {
      const fullKey = this.buildKey(key);
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`[StorageService] Error al eliminar ${key}:`, error);
    }
  }

  /**
   * Elimina todos los datos con el prefijo
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("[StorageService] Error al limpiar storage:", error);
    }
  }

  /**
   * Verifica si existe una clave
   */
  exists(key: string): boolean {
    const fullKey = this.buildKey(key);
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * Obtiene todas las claves almacenadas
   */
  getAllKeys(): string[] {
    const keys: string[] = [];
    const prefix = `${this.prefix}-`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key.replace(prefix, ""));
      }
    }

    return keys;
  }

  /**
   * Obtiene todos los datos almacenados
   */
  getAll(): Record<string, any> {
    const data: Record<string, any> = {};
    const keys = this.getAllKeys();

    keys.forEach((key) => {
      const value = this.get(key);
      if (value !== null) {
        data[key] = value;
      }
    });

    return data;
  }
}
