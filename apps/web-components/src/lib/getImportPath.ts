import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('web-components:getImportPath')

export function getImportPath(relative: string, {id, parents}: { id: string, parents: string[] }) {


  const filename = relative.replace(/^.*[\\/]/, '');
  d('filename', filename);

  const parentPath = parents[0];

  const templateUrl = parentPath.replace(/\.\/src\/(.+)\/{1,}(.+)/g, `$1/${filename}`);
  d('url', templateUrl);

  import(`components/test/${filename}`).then((m) => {
    d('template loaded', m);
  });

  // import(`../../src/${templateUrl}`).then((m) => {
  //   d('template loaded', m);
  // });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-var-requires
  // return require('components/test/' + templateUrl).default;

}
