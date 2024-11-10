import { getDebugger } from '@microphi/debug';

const d = getDebugger('traverse');

export function* traverse(node: any, includeAllChildren: boolean) {

  const children = node.children;

  for (const child of children) {
    yield child;

    if (child.hasChildNodes()) {

      // when shadow dom is used we can scan also the children because
      // the component's template elements are inside the shadow dom node hence not visible
      // on the other hand when not using shadow dow we need to avoid scanning a custom element children
      // otherwise wrong bindings will happen
      if (includeAllChildren) {

        yield* traverse(child, includeAllChildren);

      } else {

        const childName = 'getAttributeNS' in child ? child.getAttributeNS('fx', 'fx-component') : undefined;

        const isWebComponent = !!childName;

        if (!isWebComponent) {
          yield* traverse(child, includeAllChildren);
        } else {
          // look for transcluded content
          // transcluded content will be withing <fx-transclude> tags
          const transcluded = child.querySelector('fx-transclude');
          if (transcluded) {
            d('found transcluded content', transcluded);
            yield transcluded;
          }
        }

      }


    }
  }
}
