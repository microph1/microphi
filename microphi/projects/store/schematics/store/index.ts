import { Schema } from './Schema';
import { Rule, Tree } from '@angular-devkit/schematics'

export function store(options: Schema): Rule {
  console.log('options', options);
  return (tree: Tree) => {
    console.log('tree', tree);
    return tree;
  };
}
