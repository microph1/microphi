import { RestActions } from './actions';

export const ActionMetadata = '@Action';

export type ActionsMetadata = RestActions[];

export function getActionMetadata(instance): ActionsMetadata {
  return Reflect.getMetadata(ActionMetadata, instance.constructor);
}
