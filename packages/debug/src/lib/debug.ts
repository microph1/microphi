import { getEnvironmentVariables } from './get-environment-varialbles';
import { isNodejs } from './is_nodejs';


const colors = new Map<string, string>();

const colorPalette: string[] = [];

if (isNodejs()) {

  colorPalette.push(
    '\x1b[30m',
    '\x1b[31m',
    '\x1b[32m',
    '\x1b[33m',
    '\x1b[34m',
    '\x1b[35m',
    '\x1b[36m',
    '\x1b[37m',
    '\x1b[90m',
    '\x1b[91m',
    '\x1b[92m',
    '\x1b[93m',
    '\x1b[94m',
    '\x1b[95m',
    '\x1b[96m',
    '\x1b[97m',
  );

} else {

  colorPalette.push(
    '#0000FF', '#6699FF', // Blue
    '#FF0000', '#FF6666', // Red
    '#00FF00', '#66FF66', // Green
    '#FFFF00', '#FFFF66', // Yellow
    '#800080', '#CC66CC', // Purple
    '#FFA500', '#FFCC99', // Orange
    '#FFC0CB', '#FFCCCC', // Pink
    '#40E0D0', '#66CCCC'  // Turquoise
  );
}

export type Log = (...args: unknown[]) => void;

export function getDebugger(namespace: string): Log {


  let lastTimeStamp = 0;
  const {DEBUG} = getEnvironmentVariables();


  const random =  Math.floor(Math.random() * (colorPalette.length - 1));
  // Generate a random color
  const randomColor = colors.get(namespace) ||
    colors.set(namespace, colorPalette[random]).get(namespace) as string;


  // CSS style for the namespace with random color and bold
  const namespaceStyle = `color: ${randomColor}; font-weight: bold;`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {

    let formattedTime = '';
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

        const match = namespace.match(regex);

        if (match) {
          // Print formatted time with namespace

          if (isNodejs()) {

            console.log(`\x1b[7m${formattedTime}\x1b[0m`, `\x1b[1m${randomColor}${namespace}\x1b[0m`, ...args);

          } else {

            console.log(`%c${formattedTime} %c${namespace}`, 'color: lightblue', namespaceStyle, ...args);

          }
        }

      }

    }
  };
}
