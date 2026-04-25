/**
 * Utilidades para manejo de fechas usadas por NotPaid
 */

/**
 * Convierte una entrada en Date o retorna null si no es válida
 */
export function parseDate(input: string | Date | null | undefined): Date | null {
	if (!input) return null;
	if (input instanceof Date) return input;
	const d = new Date(input);
	return isNaN(d.getTime()) ? null : d;
}

/**
 * Devuelve la representación ISO (UTC) de una fecha
 */
export function toISO(date: Date): string {
	return date.toISOString();
}

/**
 * Obtiene una Date a partir de una cadena ISO o null si no es válida
 */
export function fromISO(iso?: string | null): Date | null {
	return parseDate(iso ?? null);
}

/**
 * Diferencia en días entre two fechas (ceil para contar días parciales como 1)
 * Resultado puede ser negativo si `to` es anterior a `from`.
 */
export function differenceInDays(from: Date, to: Date = new Date()): number {
	const ms = to.getTime() - from.getTime();
	return Math.ceil(ms / 86400000);
}

/**
 * Días restantes hasta `dueDate`. Nunca devuelve negativo (0 mínimo).
 */
export function daysRemaining(dueDate: Date, now: Date = new Date()): number {
	const diff = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
	return Math.max(0, diff);
}

/**
 * Días de atraso: cuántos días han pasado desde `dueDate`. Nunca negativo.
 */
export function daysLate(dueDate: Date, now: Date = new Date()): number {
	const diff = Math.ceil((now.getTime() - dueDate.getTime()) / 86400000);
	return Math.max(0, diff);
}

/**
 * Añade días a una fecha y devuelve una nueva Date
 */
export function addDays(date: Date, days: number): Date {
	const d = new Date(date.getTime());
	d.setDate(d.getDate() + days);
	return d;
}

/**
 * Comprueba si `dueDate` ya está expirado respecto a `now`
 */
export function isExpired(dueDate: Date, now: Date = new Date()): boolean {
	return now.getTime() > dueDate.getTime();
}

