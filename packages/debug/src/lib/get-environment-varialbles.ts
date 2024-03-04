import { isNodejs } from "./is_nodejs";

export function getEnvironmentVariables() {

    let DEBUG: string;

    try {

      isNodejs();

      DEBUG = process.env['DEBUG'] || '';

    } catch (error) {
      console.log(error);

      DEBUG = localStorage.getItem('debug') || '';
    }

    return { DEBUG };
}
