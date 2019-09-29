import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { UserModel } from './user.model';
import * as UserActions from './user.actions';


export const userFeatureKey = 'users';

export interface State extends EntityState<UserModel> {}

export const adapter: EntityAdapter<UserModel> = createEntityAdapter<UserModel>({
  selectId: selectUserModelId,
  sortComparer: sortByName,
});

export const initialState: State = adapter.getInitialState();
console.log('initial state', initialState);

export function selectUserModelId(a: UserModel): string {
  //In this case this would be optional since primary key is id
  return a.id;
}

export function sortByName(a: UserModel, b: UserModel): number {
  return a.email.localeCompare(b.email);
}


const userReducer = createReducer(
  initialState,
  on(UserActions.addUser, (state, { user }) => {
    return adapter.addOne(user, state)
  }),
  on(UserActions.upsertUser, (state, { user }) => {
    return adapter.upsertOne(user, state);
  }),
  on(UserActions.addUsers, (state, { users }) => {
    return adapter.addMany(users, state);
  }),
  on(UserActions.upsertUsers, (state, { users }) => {
    return adapter.upsertMany(users, state);
  }),
  on(UserActions.updateUser, (state, { user }) => {
    return adapter.updateOne(user, state);
  }),
  on(UserActions.updateUsers, (state, { users }) => {
    return adapter.updateMany(users, state);
  }),
  on(UserActions.mapUsers, (state, { entityMap }) => {
    return adapter.map(entityMap, state);
  }),
  on(UserActions.deleteUser, (state, { id }) => {
    return adapter.removeOne(id, state);
  }),
  on(UserActions.deleteUsers, (state, { ids }) => {
    return adapter.removeMany(ids, state);
  }),
  on(UserActions.deleteUsersByPredicate, (state, { predicate }) => {
    return adapter.removeMany(predicate, state);
  }),
  on(UserActions.loadUsers, (state, { users }) => {
    return adapter.addAll(users, state);
  }),
  on(UserActions.clearUsers, state => {
    return adapter.removeAll({ ...state, selectedUserId: null });
  })
);

export function reducer(state: State | undefined, action: Action) {
  console.log('reducing', state, action);
  return userReducer(state, action);
}


// get the selectors
const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

// select the array of user ids
export const selectUserIds = selectIds;

// select the dictionary of user entities
export const selectUserEntities = selectEntities;

// select the array of users
export const selectAllUsers = selectAll;

// select the total user count
export const selectUserTotal = selectTotal;
