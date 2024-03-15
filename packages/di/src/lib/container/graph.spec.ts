import { CycleError, Graph } from './graph';


describe("Graph", () =>  {

  let graph: Graph;

  beforeEach(() => {
    graph = new Graph()
  });

  describe("Data structure", () =>  {

    it("Should add nodes and list them.", () => {
      graph
        .addNode("a")
        .addNode("b");
      expect(graph.nodes().length).toEqual(2);
      expect(graph.nodes()).toContain("a");
      expect(graph.nodes()).toContain("b");
    });


    it("Should remove nodes.", () => {
      graph.addNode("a")
        .addNode("b")
        .removeNode("a")
        .removeNode("b");
      expect(graph.nodes().length).toEqual(0);
    });


    it("Should add edges and query for adjacent nodes.", () => {
      graph.addNode("a");
      graph.addNode("b");
      graph.addEdge("a", "b");
      expect(graph.adjacent("a").length).toEqual(1);
      expect(graph.adjacent("a")[0]).toEqual("b");
    });

    it("Should implicitly add nodes when edges are added.", () => {
      graph.addEdge("a", "b");
      expect(graph.adjacent("a").length).toEqual(1);
      expect(graph.adjacent("a")[0]).toEqual("b");
      expect(graph.nodes().length).toEqual(2);
      expect(graph.nodes()).toContain( "a");
      expect(graph.nodes()).toContain( "b");
    });


    it("Should remove edges.", () => {
      graph.addEdge("a", "b");
      graph.removeEdge("a", "b");
      expect(graph.adjacent("a").length).toEqual(0);
    });


    it("Should not remove nodes when edges are removed.", () => {
      graph.addEdge("a", "b");
      graph.removeEdge("a", "b");
      expect(graph.nodes().length).toEqual(2);
      expect(graph.nodes()).toContain( "a");
      expect(graph.nodes()).toContain( "b");
    });

    it("Should remove outgoing edges when a node is removed.", () => {
      graph.addEdge("a", "b");
      graph.removeNode("a");
      expect(graph.adjacent("a").length).toEqual(0);
    });

    it("Should remove incoming edges when a node is removed.", () => {
      graph.addEdge("a", "b");
      graph.removeNode("b");
      expect(graph.adjacent("a").length).toEqual(0);
    });

    it("Should compute indegree.", () => {
      graph.addEdge("a", "b");
      expect(graph.inDegree("a")).toEqual(0);
      expect(graph.inDegree("b")).toEqual(1);

      graph.addEdge("c", "b");
      expect(graph.inDegree("b")).toEqual(2);
    });

    it("Should compute outdegree.", () => {
      graph.addEdge("a", "b");
      expect(graph.outDegree("a")).toEqual(1);
      expect(graph.outDegree("b")).toEqual(0);

      graph.addEdge("a", "c");
      expect(graph.outDegree("a")).toEqual(2);
    });

  });

  describe("Algorithms", () =>  {

    it("Should detect cycle.", () =>  {
      graph.addEdge("a", "b");
      graph.addEdge("b", "a");
      expect(graph.hasCycle()).toBeTruthy();
    });


    it("Should detect cycle (loop).", () =>  {
      graph.addEdge("a", "a");
      expect(graph.hasCycle()).toBeTruthy();
    });

    it("Should not detect cycle.", () =>  {
      graph.addEdge("a", "b");
      expect(graph.hasCycle()).toBeFalsy();
    });

    // This example is from Cormen et al. "Introduction to Algorithms" page 550
    it("Should compute topological sort.", () => {


      // Shoes depend on socks.
      // Socks need to be put on before shoes.
      graph.addEdge("socks", "shoes");

      graph.addEdge("shirt", "belt");
      graph.addEdge("shirt", "tie");
      graph.addEdge("tie", "jacket");
      graph.addEdge("belt", "jacket");
      graph.addEdge("pants", "shoes");
      graph.addEdge("underpants", "pants");
      graph.addEdge("pants", "belt");

      const sorted = graph.topologicalSort();

      expect(sorted).toEqual(["underpants", "pants", "shirt", "tie", "belt", "jacket", "socks", "shoes"])

      expect(sorted.length).toEqual(8);

    });

    it("Should compute topological sort, excluding source nodes.", () => {
      graph.addEdge("a", "b");
      graph.addEdge("b", "c");
      const sorted = graph.topologicalSort(["a"], false);
      expect(sorted.length).toEqual(2);
      expect(sorted[0]).toEqual("b");
      expect(sorted[1]).toEqual("c");

    });

    it("Should compute topological sort tricky case.", () => {
       //     / \
      graph.addEdge("a", "b"); //    b   |
      graph.addEdge("a", "d"); //    |   d
      graph.addEdge("b", "c"); //    c   |
      graph.addEdge("d", "e"); //     \ /
      graph.addEdge("c", "e"); //      e

      const sorted = graph.topologicalSort(["a"], false);
      expect(sorted.length).toEqual(4);
      expect(sorted).toContain( "b");
      expect(sorted).toContain( "c");
      expect(sorted).toContain( "d");
      expect(sorted[sorted.length - 1]).toEqual("e");

    });

    it("Should exclude source nodes with a cycle.", () => {
      graph
        .addEdge("a", "b")
        .addEdge("b", "c")
        .addEdge("c", "a");
      const sorted = graph.topologicalSort(["a"], false);
      expect(sorted.length).toEqual(2);
      expect(sorted[0]).toEqual("b");
      expect(sorted[1]).toEqual("c");


    });

    it("Should exclude source nodes with multiple cycles.", () => {
      graph

        .addEdge("a", "b")
        .addEdge("b", "a")

        .addEdge("b", "c")
        .addEdge("c", "b")

        .addEdge("a", "c")
        .addEdge("c", "a");

      const sorted = graph.topologicalSort(["a", "b"], false);
      expect(sorted).not.toContain('b');


    });

    it("Should error on non-DAG topological sort", () =>  {
      graph.addEdge("a", "b");
      graph.addEdge("b", "a");
      const t = () => {
        graph.topologicalSort();
      }

      expect(t).toThrow(new CycleError('Cycle found'));
    });

    it("Should compute lowest common ancestors.", () => {
      graph
        .addEdge("a", "b")
        .addEdge("b", "d")
        .addEdge("c", "d")
        .addEdge("b", "e")
        .addEdge("c", "e")
        .addEdge("d", "g")
        .addEdge("e", "g")
        .addNode("f");


      expect(graph.lowestCommonAncestors("a", "a")).toEqual(["a"]);
      expect(graph.lowestCommonAncestors("a", "b")).toEqual(["b"]);
      expect(graph.lowestCommonAncestors("a", "c")).toEqual(["d", "e"]);
      expect(graph.lowestCommonAncestors("a", "f")).toEqual([]);
    });
  });

  describe("Edge cases and error handling", () =>  {

    it("Should return empty array of adjacent nodes for unknown nodes.", () => {
      expect(graph.adjacent("a").length).toEqual(0);
      expect(graph.nodes()).toEqual([]);
    });

    it("Should return indegree of 0 for unknown nodes.", () => {
      expect(graph.inDegree("z")).toEqual(0);
    });

    it("Should return outdegree of 0 for unknown nodes.", () => {
      expect(graph.outDegree("z")).toEqual(0);
    });

  });

  describe("Serialization", () =>  {

    let serialized;

    function checkSerialized(graph){
      expect(graph.nodes.length).toEqual(3);
      expect(graph.links.length).toEqual(2);

      expect(graph.nodes[0].id).toEqual("a");
      expect(graph.nodes[1].id).toEqual("b");
      expect(graph.nodes[2].id).toEqual("c");

      expect(graph.links[0].source).toEqual("a");
      expect(graph.links[0].target).toEqual("b");
      expect(graph.links[1].source).toEqual("b");
      expect(graph.links[1].target).toEqual("c");
    }

    it("Should serialize a graph.", () => {
      graph
        .addEdge("a", "b")
        .addEdge("b", "c");
      serialized = graph.serialize();
      checkSerialized(serialized);
    });

    it("Should deserialize a graph.", () => {

      graph.deserialize(serialized);
      checkSerialized(graph.serialize());
    });

    it("Should chain deserialize a graph.", () => {
      const graph = new Graph().deserialize(serialized);
      checkSerialized(graph.serialize());
    });

    it("Should deserialize a graph passed to constructor.", () => {
      const graph = new Graph(serialized);
      checkSerialized(graph.serialize());
    });
  });

  describe("Edge Weights", () =>  {

    it("Should set and get an edge weight.", () => {
      graph.addEdge("a", "b", 5);
      expect(graph.getEdgeWeight("a", "b")).toEqual(5);
    });

    it("Should set edge weight via setEdgeWeight.", () => {
      graph
        .addEdge("a", "b")
        .setEdgeWeight("a", "b", 5);
      expect(graph.getEdgeWeight("a", "b")).toEqual(5);
    });

    it("Should return weight of 1 if no weight set.", () => {
      graph.addEdge("a", "b");
      expect(graph.getEdgeWeight("a", "b")).toEqual(1);
    });

  });

  describe("Dijkstra's Shortest Path Algorithm", () => {

    it("Should compute shortest path on a single edge.", () => {
      graph.addEdge("a", "b");
      const result = graph.shortestPath('a', 'b');
      expect(result).toStrictEqual({path: ['a', 'b'], weight: 1} );
    });

    it("Should compute shortest path on two edges.", () => {
      graph
        .addEdge("a", "b")
        .addEdge("b", "c");
      expect(graph.shortestPath("a", "c")).toEqual({path: ["a", "b", "c"], weight: 2});
    });

    it("Should compute shortest path on example from Cormen text (p. 659).", () => {
      graph
        .addEdge("s", "t", 10)
        .addEdge("s", "y", 5)
        .addEdge("t", "y", 2)
        .addEdge("y", "t", 3)
        .addEdge("t", "x", 1)
        .addEdge("y", "x", 9)
        .addEdge("y", "z", 2)
        .addEdge("x", "z", 4)
        .addEdge("z", "x", 6);

      expect(graph.shortestPath("s", "z")).toEqual({
        path: ["s", "y", "z"],
        weight: 5 + 2
      });
      expect(graph.shortestPath("s", "x")).toEqual({
        path: ["s", "y", "t", "x"],
        weight: 5 + 3 + 1
      });
    });

    it("Should throw error if source node not in graph.", () => {
      graph.addEdge("b", "c");

      expect(() => graph.shortestPath("a", "c")).toThrow();
    });

    it("Should throw error if dest node not in graph.", () => {
      graph.addEdge("b", "c");
      expect(() => graph.shortestPath("b", "g")).toThrow();
    });

    it("Should throw error if no path exists.", () => {
      graph
        .addEdge("a", "b")
        .addEdge("d", "e");
      expect(() => graph.shortestPath('a', 'e')).toThrow();
    });

    it("Should be robust to disconnected subgraphs.", () => {
      graph
        .addEdge("a", "b")
        .addEdge("b", "c")
        .addEdge("d", "e");
      expect(graph.shortestPath("a", "c")).toEqual({
        path: ["a", "b", "c"],
        weight: 2
      });
    });
  });

  describe("hadEdge", () => {
    it("Should compute hasEdge.", () => {
      graph.addEdge("a", "b");
      expect(graph.hasEdge("a", "b")).toEqual(true);
      expect(graph.hasEdge("b", "a")).toEqual(false);
      expect(graph.hasEdge("c", "a")).toEqual(false);
    });
  })
});


