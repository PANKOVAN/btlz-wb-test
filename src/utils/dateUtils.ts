/**
 * Форматирует дату в формат YYYY-MM-DD с учетом локального часового пояса
 * @param date - Дата для форматирования
 * @returns Строка в формате YYYY-MM-DD
 */
export function formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Форматирует дату и время в формат YYYY-MM-DD HH:mm:ss с учетом локального часового пояса
 * @param date - Дата для форматирования
 * @returns Строка в формате YYYY-MM-DD HH:mm:ss
 */
export function formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
