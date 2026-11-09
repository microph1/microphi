import { isNodejs } from './is_nodejs';

export function getEnvironmentVariables() {

  let DEBUG: string;

  if (isNodejs()) {

    DEBUG = process.env['DEBUG'] || '';
  } else if (typeof localStorage !== 'undefined') {

    DEBUG = localStorage.getItem('debug') || '';
  } else {

    // neither Node nor a browser (e.g. Cloudflare Workers without nodejs_compat)
    DEBUG = '';
  }

  return { DEBUG };
}
