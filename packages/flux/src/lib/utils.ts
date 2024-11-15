export function html(strings: TemplateStringsArray, ...values: unknown[]) {
  // Join the template strings and values
  const result = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
  return result;
}

export function css(strings: TemplateStringsArray, ...values: unknown[]) {
  // Join the template strings and values


  const result = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
  return result;
}
