const fs = require('fs');
const t = require('babel-types');
const helpers = require('babel-helpers');
const generate = require('babel-generator').default;
const template = require('babel-template');
const runtimePath = require.resolve('regenerator-runtime/runtime'); // Intrinsic dependency on: babel-runtime/regenerator

const whitelist = [
    'typeof',
    // 'jsx', // <- Not needed
    'asyncIterator',
    'asyncGenerator',
    'asyncGeneratorDelegate',
    'asyncToGenerator',
    'classCallCheck',
    'createClass',
    'defineEnumerableProperties',
    'defaults',
    'defineProperty',
    'extends',
    'get',
    'inherits',
    'instanceof',
    // 'interopRequireDefault', // <- Not needed, we resolve our own modules
    // 'interopRequireWildcard', // <- Not needed, we resolve our own modules
    'newArrowCheck',
    'objectDestructuringEmpty',
    'objectWithoutProperties',
    'possibleConstructorReturn',
    // 'selfGlobal', // <- Not needed
    'set',
    'slicedToArray', // One of this two needs to go...
    // 'slicedToArrayLoose',  // <- Seems that is not used anywhere (or only when loose is enabled for the transform)
    'taggedTemplateLiteral', // One of this two needs to go...
    // 'taggedTemplateLiteralLoose', // <- Seems that is not used anywhere (or only when loose is enabled for the transform)
    'temporalRef',
    'temporalUndefined',
    'toArray', // Parameter destructuring
    'toConsumableArray' // We need this for array spread operator
];

function build(namespace, globalVar = "global", builder) {
    const body = [];
    const container = t.functionExpression(null, [t.identifier(globalVar)], t.blockStatement(body));
    const tree = t.program([
        t.expressionStatement(t.callExpression(container, [
            t.assignmentExpression('=',
                t.memberExpression(t.thisExpression(), t.identifier(globalVar)),
                t.logicalExpression('||',
                    t.memberExpression(t.thisExpression(), t.identifier(globalVar)),
                    t.objectExpression([])
                )
            )
        ]))
    ]);

    // AST for:  var globalMember = Global.globalMember = {};
    body.push(t.variableDeclaration("var", [
        t.variableDeclarator(
            t.identifier(namespace.name),
            t.assignmentExpression("=", t.memberExpression(
                    t.identifier(globalVar), namespace),
                    t.objectExpression([t.objectProperty(t.identifier('helpers'), t.objectExpression([]))])
            )
        ),
        t.variableDeclarator(t.identifier('helpers'), t.memberExpression(namespace, t.identifier('helpers')))
    ]));

    builder(body, namespace, globalVar);
    return tree;
}

function buildHelpers(body, whitelist) {
    helpers.list.forEach(function (name) {
        if (whitelist && whitelist.indexOf(name) < 0) return;

        const key = t.identifier(name);

        // AST tree for: objectMember.helperName = function () { ... }
        body.push(t.expressionStatement(t.assignmentExpression("=", t.memberExpression(t.identifier('helpers'), key), helpers.get(name))));
    });
}
// Regenerator is a special dependency that we want to include
// It stores itself in this.regeneratorRuntime
function buildRegenerator(body, namespace, globalVar) {
    const regenerateRuntime = fs.readFileSync(runtimePath).toString();
    const test = template(regenerateRuntime);
    body.push(test());

    // Regenerator must be attached to `this` so copy over to our exposed global object
    body.push(t.assignmentExpression("=", t.memberExpression(
        t.memberExpression(t.identifier(globalVar), namespace), t.identifier('regeneratorRuntime')),
        t.memberExpression(t.identifier('this'), t.identifier('regeneratorRuntime'))));

    // Clean up original global assignment
    body.push(t.unaryExpression('delete', t.memberExpression(t.identifier('this'), t.identifier('regeneratorRuntime'))));
}

function buildAll(body, whitelist, namespace, globalVar) {
    buildHelpers(body, whitelist);
    buildRegenerator(body, namespace, globalVar);
}

// -- Public API ----

exports.build = function(ns, globalVar) {
    const namespace = t.identifier(ns);
    const builderFactory = (body, namespace, globalVar) => buildAll(body, whitelist, namespace, globalVar);

    const tree = build(namespace, globalVar, builderFactory);
    const result = generate(tree).code;

   return result;
}

exports.helpers = whitelist;


