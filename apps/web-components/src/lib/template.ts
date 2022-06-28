export const TemplateEngine = function(html, options) {
  const re = /\{\{([^}}]+)?}}/g;
  const reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g;
  let code = 'var r=[];\\n';
  let cursor = 0
  let match;
  const add = function(line, js) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    js? (code += line.match(reExp) ? line + '\\n' : 'r.push(' + line + ');\\n') :
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\\\"') + '");\\n' : '');
    return add;
  }
  // eslint-disable-next-line no-cond-assign
  while(match = re.exec(html)) {
    // @ts-ignore
    add(html.slice(cursor, match.index))(match[1], true);
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    cursor = match.index + match[0].length;
  }
  // @ts-ignore
  add(html.substr(cursor, html.length - cursor));
  code += 'return r.join("");';
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function(code.replace(/[\\r\\t\\n]/g, '')).apply(options);
}
