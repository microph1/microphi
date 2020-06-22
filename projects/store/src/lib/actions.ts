export const REQUEST_SUFFIX = '_REQUEST';
export const RESPONSE_SUFFIX = '_RESPONSE';
export const ERROR_SUFFIX = '_ERROR';

export interface Action {
  type: string;
  payload: any;
}

export interface RestActions {
  request: string;
  response: string;
  error: string;
}


/**
 * Action are defined with an enum. Such as:
 *
 * emun {
 *   GET_ALL,
 *   GET_ONE,
 *   DELETE,
 * }
 *
 * For each action defined a REQUEST, a RESPONSE and an ERROR are associated to it.
 *
 *
 */
export class Actions<A extends any> {

  /**
   * Example:
   * {
   *   0: { request: 'ACTION_NAME_REQUEST', response: 'ACTION_NAME_RESPONSE', error: 'ACTION_NAME_ERROR' }
   *   [....]
   * }
   */
  public actions: {
    [k: number]: RestActions;
  } = {};

  /**
   * Example:
   * {
   *   ACTION_NAME: 0
   *   [....]
   * }
   *
   */
  public names: {
    [actionName: string]: number;
  } = {};

  /**
   * Example:
   * {
   *   0: 'ACTION_NAME',
   *   [....]
   *
   * }
   */
  public codes: {
    [actionCode: number]: string
  } = {};

  /**
   * Example:
   * {
   *   ACTION_NAME': { request: 'ACTION_NAME_REQUEST', response: 'ACTION_NAME_RESPONSE', error: 'ACTION_NAME_ERROR' }
   *   [....]
   * }
   */
  public restActionsByName: {
    [name: string]: RestActions;
  } = {};

  constructor(actions: A) {
    Object.keys(actions).forEach((key) => {
      if (+key >= 0) {

        this.codes[key] = actions[key];

        this.actions[key] = Actions.createAction(actions[key]);

      } else {
        this.names[key] = actions[key];

        this.restActionsByName[key] = Actions.createAction(key);
      }

    });
  }

  private static createAction(key: string): RestActions {
    return {
      request: `${key}${REQUEST_SUFFIX}`,
      response: `${key}${RESPONSE_SUFFIX}`,
      error: `${key}${ERROR_SUFFIX}`,
    };
  }

  public getByName(actionName: string) {
    return this.names[actionName];
  }

  public getByCode(code: number) {
    return this.codes[code];
  }

  public getActionsByCode(key: number) {
    return this.actions[key];
  }

  public getActionsByName(actionName: string) {
    const code = this.getByName(actionName);
    return this.getActionsByCode(code);
  }

  public getActionNameFromChild(childAction: string): string {
    let actionName;

    Object.keys(this.restActionsByName).forEach((restAction) => {
      const restActions = this.restActionsByName[restAction];
      if (restActions.response === childAction || restActions.request === childAction || restActions.error === childAction) {
        actionName = restAction;
      }
    });

    return actionName;
  }

  public getActionCodeFromChild(childAction: string): number {
    let actionCode;

    Object.keys(this.actions).forEach((restAction) => {
      const restActions = this.actions[restAction];
      if (restActions.response === childAction || restActions.request === childAction || restActions.error === childAction) {
        actionCode = restAction;
      }
    });

    return Number(actionCode);
  }

}
