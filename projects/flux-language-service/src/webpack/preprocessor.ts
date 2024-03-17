import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('@flux/webpack/html-parser');

export async function preprocessor(content: string, loaderContext: any) {

  const resourcePath = loaderContext.resourcePath;

  if (!resourcePath.includes('index.html')) {
    d({content});
    // console.log(loaderContext);
    // console.log('resourcePath', resourcePath);

    const componentPath = resourcePath.replace('html', 'js');

    d({componentPath});

    // loaderContext.loadModule('/media/dcavaliere/extradrive1/dev/drugo/microphi/node_modules/ts-loader/index.js!/media/dcavaliere/extradrive1/dev/drugo/microphi/apps/metronoman-flux/src/components/fx-header.component.ts');

    // @ts-ignore
    // console.log(import.meta.webpack);

    // const module = await import(componentPath);
    // console.log({module});
    // loaderContext.emitError(new Error('My awesome error'));


  }

  // let result;
  //
  // try {
  //   result = Handlebars.compile(content)({
  //     firstname: "Value",
  //     lastname: "OtherValue",
  //   });
  // } catch (error) {
  //   loaderContext.emitError(error);
  //
  //   return content;
  // }
  //
  // return result;
  return content;
}
