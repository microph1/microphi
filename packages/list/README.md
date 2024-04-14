# @microphi/list [![npm version](https://badge.fury.io/js/%40microphi%2Flist.svg)](https://badge.fury.io/js/%40microphi%2Flist)

> Simple and fast list-like class

It combines internally a javascrript map and an array of ids. The combination give this class the flexibility of an array and the ability to access directly to an element from its id.


## Install
With your preferred package manager install
```
@microphi/list
```

## How to use
```typescript

interface Entity {
  id: string;
  user: {
    email: string;
    name: string;
  };
  anotherField?: any;
}

const users: Entity[] = [
  { id: 'abc', user: {email: 'email1', name: 'name1'}},
  { id: 'bcd', user: {email: 'email2', name: 'name2'}},
  { id: 'cdf', user: {email: 'email3', name: 'name3'}},
];

// Create a list of users, specifying the `id` field and optionally an array of initial values.
const list = new List<Entity>('id', users);

// upsert items. I.e.: append if new, update otherwise
list.upsert({
  id: 'trs',
  user: {email: 'emailtrs', name: 'nametrs'},
});

const user1 = {
  id: 'lmn',
  user: {email: 'emaillmn', name: 'namelmn'}
};

// prepend items. I.e.: add at the beginning if new, update otherwise
list.prepend(user1);

// remove items.
list.delete(user1);

```
