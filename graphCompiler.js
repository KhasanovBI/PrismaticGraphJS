function getFunctionParams(fn) {
    return fn.toString().match(/\((.*)\)/)[1].split(/ *, */);
}

function Vertex(calculationFunction) {
    this.visited = false;
    this.dependencies = getFunctionParams(calculationFunction);
    this.calculationFunction = calculationFunction;
}

function makeVertexGraph(graph) {
    var vertexGraph = {};
    for (var returnValue in graph) {
        vertexGraph[returnValue] = new Vertex(graph[returnValue]);
    }
    return vertexGraph;
}

function findLazy(vertexGraph, params, vertexName) {
    var vertex = vertexGraph[vertexName];
    if (vertex === undefined) {
        throw new Error("Dependency missing: " + vertexName);
    }
    if (vertex.returnValue === undefined) {
        if (vertex.visited) {
            throw new Error("Cannot compile cyclic graph.");
        }
        vertex.visited = true;
        var args = [];
        for (var i = 0; i < vertex.dependencies.length; i++) {
            var dependencyVertexName = vertex.dependencies[i];
            if (dependencyVertexName in params) {
                args.push(params[dependencyVertexName]);
            } else {
                args.push(findLazy(vertexGraph, params, dependencyVertexName));
            }
        }
        vertex.returnValue = vertex.calculationFunction.apply(vertex, args);
        vertex.visited = false;
    }
    return vertex.returnValue;
}

function lazyCompile(graph) {
    var vertexGraph = makeVertexGraph(graph);
    return function (params) {
        return function (vertexName) {
            var result = {};
            result[vertexName] = findLazy(vertexGraph, params, vertexName);
            return result;
        }
    }
}

function eagerCompile(graph) {
    var vertexGraph = makeVertexGraph(graph);
    return function (params) {
        var result = {};
        Object.keys(vertexGraph).forEach(function (key) {
            result[key] = findLazy(vertexGraph, params, key);
        });
        return result;
    }
}

module.exports = {
    eagerCompile: eagerCompile,
    lazyCompile: lazyCompile
};
