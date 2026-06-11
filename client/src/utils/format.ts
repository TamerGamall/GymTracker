export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

export const formatDateTime = (value: string | Date) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));

export const formatNumber = (value: number, digits = 1) => value.toFixed(digits);
