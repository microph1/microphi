export interface Actions {
  // TODO rename to type
  type: string;
  payload: any;
}

export type RestActions = {
  request: string;
  response: string;
  error?: any;
}

export function createAction(action: string): RestActions {
  return {
    request: `${action}_REQUEST`,
    response: `${action}_RESPONSE`,
    error: `${action}_ERROR`
  };
}
