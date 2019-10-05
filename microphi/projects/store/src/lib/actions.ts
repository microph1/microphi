export interface Actions {
  // TODO rename to type
  event: string;
  payload: any;
}

export class RestActions {
  public static REQUEST = 'REQUEST';
  public static RESPONSE = 'RESPONSE';
  public static ERROR = 'ERROR';
}

