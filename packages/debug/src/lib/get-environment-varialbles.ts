import { isNodejs } from "./is_nodejs";

export function getEnvironmentVariables() {

  let DEBUG: string;

  if (isNodejs()) {

    DEBUG = process.env['DEBUG'] || '';
  } else {

    DEBUG = localStorage.getItem('debug') || '';
  }

  return { DEBUG };
}
