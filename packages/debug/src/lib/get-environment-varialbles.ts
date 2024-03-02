export function getEnvironmentVarialbles(process: {env: {[k:string]: string}}) {
    let DEBUG: string;
    let PALETTE: string;

    if (typeof window === 'object') {

        DEBUG = localStorage.getItem('debug') || '';
        PALETTE = localStorage.getItem('palette') || '';

    } else {

        DEBUG = process.env['DEBUG'];
        PALETTE = process.env['PALETTE'];

    }

    return { DEBUG, PALETTE };
}
