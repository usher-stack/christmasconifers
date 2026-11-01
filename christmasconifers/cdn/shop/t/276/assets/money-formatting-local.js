const currencyDigits = (currency) => {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits;
  } catch {
    return 2;
  }
};

export function convertMoneyToMinorUnits(value, currency = 'USD') {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value * (10 ** currencyDigits(currency))) : null;
  }
  if (typeof value !== 'string') return null;

  const normalized = value.trim().replace(/[,\s]/g, '').replace(/[^\d.+-]/g, '');
  if (!normalized || !/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * (10 ** currencyDigits(currency)));
}

function formattedAmount(minorUnits, decimals, thousandsSeparator, decimalSeparator) {
  const fixed = (Math.abs(minorUnits) / (10 ** decimals)).toFixed(decimals);
  const [integer, fraction] = fixed.split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  return `${minorUnits < 0 ? '-' : ''}${grouped}${fraction ? decimalSeparator + fraction : ''}`;
}

export function formatMoney(minorUnits, format = '{{amount}}', currency = 'USD') {
  const decimals = currencyDigits(currency);
  const amount = formattedAmount(minorUnits, decimals, ',', '.');
  const noDecimals = formattedAmount(minorUnits, 0, ',', '.');
  const commaAmount = formattedAmount(minorUnits, decimals, '.', ',');
  const commaNoDecimals = formattedAmount(minorUnits, 0, '.', ',');
  const replacements = {
    amount,
    amount_no_decimals: noDecimals,
    amount_with_comma_separator: commaAmount,
    amount_no_decimals_with_comma_separator: commaNoDecimals
  };
  const template = typeof format === 'string' ? format : '{{amount}}';
  return template.replace(/\{\{\s*(amount(?:_no_decimals|_with_comma_separator|_no_decimals_with_comma_separator)?)\s*\}\}/g,
    (match, token) => replacements[token] || amount);
}
