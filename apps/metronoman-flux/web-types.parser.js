const {getDebugger} = require("@microphi/debug");
const d = getDebugger('@flux/web-types.parser');


module.exports = (content) => {
  // console.log('----------------------------')
  // console.log(JSON.stringify(content));
  // console.log('----------------------------')
  // d('start parsing', content);

  const selector = content.match(/selector:\s'(.+)'/);
  d({selector: selector?.[1]})

  // if (content.includes('FxRootComponent')) {
  //   const regex = new RegExp(/selector/igs);
  //
  //   const match = regex.exec(content)
  //
  //   if (match && match[1]) {
  //     console.log(match[1])
  //     const selector = match[2].match(/(selector): (['"].+['"])/ig)
  //     console.log('selector', selector)
  //     console.log('stringifing');
      // JSON.stringify(match[1], (t, k, v) => {
      //   console.log({t, k, v});
      //
      // });
      // const json = toJSON(match[1]);
      // console.log(json)
      // d('selector', json.selector);
    // }
  // }


  // d('type of content', typeof content);

  // if (content.match) {
  //   const matches = content.match(/@Component\((\{((\n?\s+(.+))+)\})/);
  //
  //   d(matches);
  // }

  return content;
}
