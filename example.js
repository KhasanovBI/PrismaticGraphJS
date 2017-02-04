var graphCompiler = require('./graphCompiler');

var statsGraph = {
    n: function (xs) {
        return xs.length;
    },
    m: function (xs, n) {
        return xs.reduce(
                function (a, b) {
                    return a + b;
                }) / n;
    },
    m2: function (xs, n) {
        return xs.map(
                function (x) {
                    return x * x;
                }).reduce(
                function (a, b) {
                    return a + b;
                }, 0) / n;
    },
    v: function (m, m2) {
        return m2 - m * m;
    }
};


var params = {xs: [1, 2, 3, 6]};

var eagerStats = graphCompiler.eagerCompile(statsGraph);
var lazyStats = graphCompiler.lazyCompile(statsGraph);
console.log('Eager stats:', eagerStats(params));
console.log('Lazy stats:', lazyStats(params)('m'));
