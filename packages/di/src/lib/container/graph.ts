export type NodeId = string;
export type EdgeWeight = number;
export type EncodedEdge = string;

export interface Serialized {
  nodes: { id: NodeId }[];
  links: { source: NodeId; target: NodeId; weight: EdgeWeight }[];
}

export class CycleError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CycleError.prototype);
  }
}

/**
 * A graph data structure with depth-first search and topological sort.
 */
export class Graph {
  /**
   * The adjacency list of the graph.
   * Keys are node ids.
   * Values are adjacent node id arrays.
   */
  edges: Record<NodeId, NodeId[]> = {};

  /**
   * The weights of edges.
   * Keys are string encodings of edges.
   * Values are weights (numbers).
   */
  edgeWeights: Record<EncodedEdge, EdgeWeight> = {};

  constructor(serialized?: Serialized) {
    if (serialized) {
      this.deserialize(serialized);
    }
  }

  /**
   * Deserializes the given serialized graph.
   * @param serialized
   */
  deserialize(serialized: Serialized) {
    serialized.nodes.forEach((node) => {
      this.addNode(node.id);
    });
    serialized.links.forEach((link) => {
      this.addEdge(link.source, link.target, link.weight);
    });
    return this;
  }

  /**
   * Gets the adjacent node list for the given node.
   * Returns an empty array for unknown nodes.
   * @param node
   */
  adjacent(node: NodeId): NodeId[] {
    return this.edges[node] || [];
  }

  /**
   * Adds a node to the graph.
   * If node was already added, this function does nothing.
   * If node was not already added, this function sets up an empty adjacency list.
   * @param node
   */
  addNode(node: NodeId) {
    this.edges[node] = this.adjacent(node);
    return this;
  }

  /**
   * Adds an edge from node u to node v.
   * Implicitly adds the nodes if they were not already added.
   * @param u
   * @param v
   * @param weight
   */
  addEdge(u: NodeId, v: NodeId, weight?: EdgeWeight) {
    this.addNode(u);
    this.addNode(v);
    this.adjacent(u).push(v);

    if (weight !== undefined) {
      this.setEdgeWeight(u, v, weight);
    }

    return this;
  }

  /**
   * Sets the weight of the given edge.
   * @param u
   * @param v
   * @param weight
   */
  setEdgeWeight(u: NodeId, v: NodeId, weight: EdgeWeight) {
    this.edgeWeights[this.encodeEdge(u, v)] = weight;
    return this;
  }

  /**
   * Computes a string encoding of an edge,
   * for use as a key in an object.
   * @param u
   * @param v
   */
  encodeEdge(u: NodeId, v: NodeId): EncodedEdge {
    return u + '|' + v;
  }

  /**
   * Removes a node from the graph.
   * Also removes incoming and outgoing edges.
   * @param node
   */
  removeNode(node: NodeId) {
    // Remove incoming edges.
    Object.keys(this.edges).forEach((u) => {
      this.edges[u].forEach((v) => {
        if (v === node) {
          this.removeEdge(u, v);
        }
      });
    });

    // Remove outgoing edges (and signal that the node no longer exists).
    delete this.edges[node];

    return this;
  }

  /**
   * Gets the list of nodes that have been added to the graph.
   */
  nodes(): NodeId[] {
    // TODO: Better implementation with set data structure
    const nodeSet: Record<NodeId, boolean> = {};

    Object.keys(this.edges).forEach((u) => {
      nodeSet[u] = true;
      this.edges[u].forEach((v) => {
        nodeSet[v] = true;
      });
    });
    return Object.keys(nodeSet);
  }

  /**
   * Gets the weight of the given edge.
   * Returns 1 if no weight was previously set.
   * @param u
   * @param v
   */
  getEdgeWeight(u: NodeId, v: NodeId): EdgeWeight {
    const weight = this.edgeWeights[this.encodeEdge(u, v)];
    return weight ?? 1;
  }

  /**
   * Removes the edge from node u to node v.
   * Does not remove the nodes.
   * Does nothing if the edge does not exist.
   * @param u
   * @param v
   */
  removeEdge(u: NodeId, v: NodeId) {
    if (this.edges[u]) {
      this.edges[u] = this.adjacent(u).filter((_v) => {
        return _v !== v;
      });
    }
    return this;
  }

  /**
   * Returns true if there is an edge from node u to node v.
   * @param u
   * @param v
   */
  hasEdge(u: NodeId, v: NodeId) {
    return this.adjacent(u).includes(v);
  }

  /**
   * Computes the indegree for the given node.
   * Not very efficient, costs O(E) where E = number of edges.
   *
   * @param node
   */
  inDegree(node: NodeId) {
    let degree = 0;
    function check(v: NodeId) {
      if (v === node) {
        degree++;
      }
    }
    Object.keys(this.edges).forEach((u) => {
      this.edges[u].forEach(check);
    });
    return degree;
  }

  /**
   * Computes the outdegree for the given node.
   *
   * @param node
   */
  outDegree(node: NodeId) {
    return node in this.edges ? this.edges[node].length : 0;
  }


  /**
   * Depth First Search algorithm, inspired by
   * Cormen et al. 'Introduction to Algorithms' 3rd Ed. p. 604
   * The additional option `includeSourceNodes` specifies whether to
   * include or exclude the source nodes from the result (true by default).
   * If `sourceNodes` is not specified, all nodes in the graph
   * are used as source nodes.
   *
   * @param sourceNodes
   * @param includeSourceNodes
   * @param errorOnCycle
   */
  depthFirstSearch(
    sourceNodes: NodeId[]|undefined,
    includeSourceNodes: boolean = true,
    errorOnCycle: boolean = false,
  ) {
    if (!sourceNodes) {
      sourceNodes = this.nodes();
    }

    if (typeof includeSourceNodes !== 'boolean') {
      includeSourceNodes = true;
    }

    const visited: Record<NodeId, boolean> = {};
    const visiting: Record<NodeId, boolean> = {};
    const nodeList: NodeId[] = [];

    const DFSVisit = (node: NodeId) => {
      if (visiting[node] && errorOnCycle) {
        throw new CycleError('Cycle found');
      }
      if (!visited[node]) {
        visited[node] = true;
        visiting[node] = true;  // temporary flag while visiting
        this.adjacent(node).forEach(DFSVisit);
        visiting[node] = false;
        nodeList.push(node);
      }
    };

    if (includeSourceNodes) {
      sourceNodes.forEach(DFSVisit);
    } else {
      sourceNodes.forEach((node) => {
        visited[node] = true;
      });
      sourceNodes.forEach((node) => {
        this.adjacent(node).forEach(DFSVisit);
      });
    }

    return nodeList;
  }


  /**
   * Returns true if the graph has one or more cycles and false otherwise
   */
  hasCycle(): boolean {
    try {
      this.depthFirstSearch(undefined, true, true);
      // No error thrown -> no cycles
      return false;
    }
    catch (error) {
      if (error instanceof CycleError) {
        return true;
      }
      else {
        throw error;
      }
    }
  }

  /**
   * Least Common Ancestors
   * Inspired by https://github.com/relaxedws/lca/blob/master/src/LowestCommonAncestor.php code
   * but uses depth search instead of breadth. Also uses some optimizations
   *
   * @param node1
   * @param node2
   */
  lowestCommonAncestors(node1: NodeId, node2: NodeId) {
    const node1Ancestors: NodeId[] = [];
    const lcas: NodeId[] = [];

    const  CA1Visit = (
      visited: Record<NodeId, boolean>,
      node: NodeId
    ): boolean => {
      if (!visited[node]) {
        visited[node] = true;
        node1Ancestors.push(node);
        if (node == node2) {
          lcas.push(node);
          return false; // found - shortcut
        }
        return this.adjacent(node).every(node => {
          return CA1Visit(visited, node);
        });
      } else {
        return true;
      }
    };

    const CA2Visit = (visited: Record<NodeId, boolean>, node: NodeId) => {
      if (!visited[node]) {
        visited[node] = true;
        if (node1Ancestors.indexOf(node) >= 0) {
          lcas.push(node);
        } else if (lcas.length == 0) {
          this.adjacent(node).forEach(node => {
            CA2Visit(visited, node);
          });
        }
      }
    };

    if (CA1Visit({}, node1)) {
      // No shortcut worked
      CA2Visit({}, node2);
    }

    return lcas;
  }

  /**
   * The topological sort algorithm yields a list of visited nodes
   * such that for each visited edge (u, v), u comes before v in the list.
   * Amazingly, this comes from just reversing the result from depth first search.
   * Cormen et al. 'Introduction to Algorithms' 3rd Ed. p. 613
   *
   * @param sourceNodes
   * @param includeSourceNodes
   */
  topologicalSort(
    sourceNodes?: NodeId[],
    includeSourceNodes: boolean = true
  ) {
    return this.depthFirstSearch(sourceNodes, includeSourceNodes, true).reverse();
  }

  /**
   * Dijkstra's Shortest Path Algorithm.
   * Cormen et al. 'Introduction to Algorithms' 3rd Ed. p. 658
   * Variable and function names correspond to names in the book.
   *
   * @param source
   * @param destination
   */
  shortestPath(source: NodeId, destination: NodeId) {
    // Upper bounds for shortest path weights from source.
    const d: Record<NodeId, EdgeWeight> = {};

    // Predecessors.
    const p: Record<NodeId, NodeId> = {};

    // Poor man's priority queue, keyed on d.
    let q: Record<NodeId, boolean> = {};

    const initializeSingleSource = () => {
      this.nodes().forEach((node) => {
        d[node] = Infinity;
      });
      if (d[source] !== Infinity) {
        throw new Error('Source node is not in the graph');
      }
      if (d[destination] !== Infinity) {
        throw new Error('Destination node is not in the graph');
      }
      d[source] = 0;
    };

    // Adds entries in q for all nodes.
    const initializePriorityQueue = () => {
      this.nodes().forEach((node) => {
        q[node] = true;
      });
    };

    // Returns true if q is empty.
    const priorityQueueEmpty = () => {
      return Object.keys(q).length === 0;
    };

    // Linear search to extract (find and remove) min from q.
    const extractMin = (): NodeId | null => {
      let min = Infinity;
      let minNode;
      Object.keys(q).forEach((node) => {
        if (d[node] < min) {
          min = d[node];
          minNode = node;
        }
      });
      if (minNode === undefined) {
        // If we reach here, there's a disconnected subgraph, and we're done.
        q = {};
        return null;
      }
      delete q[minNode];
      return minNode;
    };

    const relax = (u: NodeId, v: NodeId) => {
      const w = this.getEdgeWeight(u, v);
      if (d[v] > d[u] + w) {
        d[v] = d[u] + w;
        p[v] = u;
      }
    };

    const dijkstra = () => {
      initializeSingleSource();
      initializePriorityQueue();
      while (!priorityQueueEmpty()) {
        const u = extractMin();
        if (u === null) return;
        this.adjacent(u).forEach((v) => {
          relax(u as string, v);
        });
      }
    };

    // Assembles the shortest path by traversing the
    // predecessor subgraph from destination to source.
    const path = () => {
      const nodeList: { path: NodeId[], weight: EdgeWeight } = {
        path: [],
        weight: 0,
      };
      let node = destination;
      while (p[node]) {
        nodeList.path.push(node);
        nodeList.weight += this.getEdgeWeight(p[node], node);
        node = p[node];
      }
      if (node !== source) {
        throw new Error('No path found');
      }
      nodeList.path.push(node);
      nodeList.path.reverse();
      // nodeList.weight = 0;
      return nodeList;
    };

    dijkstra();

    return path();
  }

  /**
   * Serializes the graph.
   */
  serialize() {
    const serialized: Serialized = {
      nodes: this.nodes().map((id) => {
        return { id: id };
      }),
      links: []
    };

    serialized.nodes.forEach((node) => {
      const source = node.id;
      this.adjacent(source).forEach((target) => {
        serialized.links.push({
          source: source,
          target: target,
          weight: this.getEdgeWeight(source, target)
        });
      });
    });

    return serialized;
  }
}
