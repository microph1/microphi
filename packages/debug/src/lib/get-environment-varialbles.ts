export function getEnvironmentVariables(process: {env: {[k:string]: string}}) {
    let DEBUG: string;

    if (typeof window === 'object') {

        DEBUG = localStorage.getItem('debug') || '';

    } else {

        DEBUG = process.env['DEBUG'];

    }

    return { DEBUG };
}
