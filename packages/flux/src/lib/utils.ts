export function html(strings: TemplateStringsArray, ...values: any[]) {
  // Join the template strings and values
  const result = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
  return result;
}
