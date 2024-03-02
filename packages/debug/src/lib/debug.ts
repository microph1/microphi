declare const process: any;
let DEBUG: string;
let PALETTE: string;

if (typeof window === 'object') {

  DEBUG = localStorage.getItem('debug') || '';
  PALETTE = localStorage.getItem('palette') || '';

} else {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  DEBUG = process.env['DEBUG'];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  PALETTE = process.env['PALETTE'];

}

const colors = new Map<string, string>();

type Palette = 'funky_dealer' | string;

const colorPalettes = new Map<Palette, string[]>();

colorPalettes.set('funky_dealer', [
  '#7dd823',
  '#d9d126',
  '#ffb611',
  '#ff6000',
  '#0f5940',
]);

const DEFAULT_PALETTE: Palette = 'funky_dealer';


export function getDebugger(namespace: string) {
  let lastTimeStamp = 0;

  const colorPalette = colorPalettes.get(PALETTE || DEFAULT_PALETTE) as string[];

  const random =  Math.floor(Math.random() * (colorPalette.length + 1));
  // Generate a random color
  const randomColor = colors.get(namespace) ||
    colors.set(namespace, colorPalette[random]).get(namespace) as string;

  // CSS style for the namespace with random color and bold
  const namespaceStyle = `color: ${randomColor}; font-weight: bold;`;

  return (...args: unknown[]) => {

    let formattedTime = undefined;
    const now = Date.now();

    if ((now - lastTimeStamp) > 1000) {

      const currentTime = new Date();
      const hours = currentTime.getHours().toString().padStart(2, '0');
      const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      const seconds = currentTime.getSeconds().toString().padStart(2, '0');

      formattedTime = `${hours}:${minutes}:${seconds}`;
      lastTimeStamp = now;

    } else {
      formattedTime = `+${now - lastTimeStamp}`.padStart(8, ' ');
    }


    if (DEBUG) {

      const regexs = DEBUG.split(',');
      for (const regex of regexs) {

        // console.info({debug});
        const match = namespace.match(regex);
        // console.log({match});

        if (match) {
          // Print formatted time with namespace
          console.log(`%c${formattedTime} %c${namespace}`, 'color: lightblue', namespaceStyle, ...args);
        }

      }

    }
  }
}
console.log('test');
