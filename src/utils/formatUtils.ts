/**
 * Utilidades para formateo de números y moneda
 * Soporta formato colombiano: 50.000 (punto como separador de miles)
 */

/**
 * Formatea un número como moneda colombiana
 * 50000 => "50.000"
 * 1234567.89 => "1.234.567"
 *
 * @param value - Número a formatear
 * @param decimals - Cantidad de decimales (default: 0)
 * @returns String formateado
 */
export function formatCurrency(value: number | string | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  try {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
      return '0';
    }

    // Usar toLocaleString con opciones de Colombia
    return num.toLocaleString('es-CO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true
    });
  } catch (error) {
    console.error('[formatUtils] Error formatting currency:', error);
    return '0';
  }
}

/**
 * Formatea un número para mostrar con signo (+/-)
 * 50000 => "+50.000"
 * -50000 => "-50.000"
 *
 * @param value - Número a formatear
 * @param decimals - Cantidad de decimales (default: 0)
 * @returns String formateado con signo
 */
export function formatCurrencyWithSign(value: number | string | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  try {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
      return '0';
    }

    const formatted = formatCurrency(Math.abs(num), decimals);
    const sign = num >= 0 ? '+' : '-';

    return sign + formatted;
  } catch (error) {
    console.error('[formatUtils] Error formatting currency with sign:', error);
    return '0';
  }
}

/**
 * Extrae valor numérico de un string formateado
 * "50.000" => 50000
 * "1.234.567" => 1234567
 *
 * @param formattedValue - String formateado
 * @returns Número sin formato
 */
export function parseFormattedCurrency(formattedValue: string | null | undefined): number {
  if (!formattedValue) {
    return 0;
  }

  try {
    // Remover todos los puntos (separadores de miles)
    const cleaned = formattedValue.replace(/\./g, '').trim();
    const num = parseFloat(cleaned);

    return isNaN(num) ? 0 : num;
  } catch (error) {
    console.error('[formatUtils] Error parsing formatted currency:', error);
    return 0;
  }
}

/**
 * Retorna el label y color basado en si la diferencia es positiva o negativa
 * 50000 => { icon: '✓', label: 'Excedente', color: '#2e7d32' }
 * -50000 => { icon: '✗', label: 'Faltante', color: '#d32f2f' }
 *
 * @param value - Valor de la diferencia
 * @returns Objeto con icon, label, y color
 */
export function getDifferenceDisplay(value: number | string | null | undefined): {
  icon: string;
  label: string;
  color: string;
  sign: string;
} {
  if (value === null || value === undefined || value === '') {
    return {
      icon: '○',
      label: 'Sin diferencia',
      color: '#999',
      sign: ''
    };
  }

  try {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
      return {
        icon: '○',
        label: 'Sin diferencia',
        color: '#999',
        sign: ''
      };
    }

    if (num > 0) {
      return {
        icon: '✓',
        label: 'Excedente',
        color: '#2e7d32', // Verde
        sign: '+'
      };
    } else if (num < 0) {
      return {
        icon: '✗',
        label: 'Faltante',
        color: '#d32f2f', // Rojo
        sign: '-'
      };
    } else {
      return {
        icon: '○',
        label: 'Cuadrado',
        color: '#1976d2', // Azul
        sign: ''
      };
    }
  } catch (error) {
    console.error('[formatUtils] Error getting difference display:', error);
    return {
      icon: '○',
      label: 'Sin diferencia',
      color: '#999',
      sign: ''
    };
  }
}

/**
 * Formatea un número para mostrar en rango de 0-999
 * Si es mayor, usa notación con K/M
 * 5000 => "5.000"
 * 1234567 => "1.2M"
 *
 * @param value - Número a formatear
 * @returns String formateado
 */
export function formatCompactCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  try {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num) || num === 0) {
      return '0';
    }

    const absNum = Math.abs(num);

    if (absNum >= 1000000) {
      return (num / 1000000).toLocaleString('es-CO', {
        maximumFractionDigits: 1
      }) + 'M';
    } else if (absNum >= 1000) {
      return (num / 1000).toLocaleString('es-CO', {
        maximumFractionDigits: 1
      }) + 'K';
    } else {
      return formatCurrency(num);
    }
  } catch (error) {
    console.error('[formatUtils] Error formatting compact currency:', error);
    return '0';
  }
}
