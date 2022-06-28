export function getNodesBoundToVariable(nodes: NodeListOf<ChildNode>, varName: string) {
  const _nodes: ChildNode[] = [];
  for (const node of nodes) {

    if (node.nodeValue?.includes(varName)) {
      _nodes.push(node);
    }

    _nodes.push(...getNodesBoundToVariable(node.childNodes, varName))
  }

  return _nodes;
}

export function getCallableAttributes(node: Element): Attr[] {
  return [...node.attributes].filter((attr) => attr.name.match(/\(.+\)/g));
}

export function getNodesWithVariables(nodes: NodeListOf<ChildNode>): {
  node: ChildNode;
  template: string;
  assignedVariable: string;
}[] {
  const nodesWithVariables: {
    node: ChildNode;
    template: string;
    assignedVariable: string;
  }[] = [];

  for (const node of nodes) {
    const varName = (node.nodeValue?.match(/\{\{([^}]+)}}/));
    if (varName?.length) {
      nodesWithVariables.push({
        node,
        template: node.nodeValue,
        assignedVariable: varName[1],
      });
    }

    nodesWithVariables.push(...getNodesWithVariables(node.childNodes));
  }

  return nodesWithVariables;
}

export function getChildrenWithBoundAttributes(children: HTMLCollection) {
  const nodes = [];

  for (const child of children) {
    for (const attribute of child.attributes) {
      const varName = attribute.value?.match(/\{\{([^}]+)}}/);
      if (varName?.length) {
        nodes.push({
          node: child,
          attribute: attribute,
          assignedVariable: varName[1]
        });
      }
    }

    nodes.push(...getChildrenWithBoundAttributes(child.children));
  }

  return nodes;
}

export function getNodesWithCallableAttributes(nodes: HTMLCollection): {node: Element, name: string, value: string}[] {

  const attributes = [];

  for (const node of nodes) {
    const attrs = getCallableAttributes(node).map((a) => {
      return {
        node,
        name: a.nodeName.match(/\((.+)\)/)[1],
        value: a.nodeValue.match(/(.+)\(.+\)?/)[1],
      }
    });
    attributes.push(...attrs);
    attributes.push(...getNodesWithCallableAttributes(node.children));
  }

  return attributes;
}

export function generateUUID() { // Public Domain/MIT
  let d = new Date().getTime();//Timestamp
  let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'FX_xxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16;//random number between 0 and 16
    if(d > 0){//Use timestamp until depleted
      r = (d + r)%16 | 0;
      d = Math.floor(d/16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r)%16 | 0;
      d2 = Math.floor(d2/16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
