
const fs = require('fs-extra');
const path = require('path');
const babel = require('@babel/core');
const rollup = require('rollup');
const templates = require('../src/shared/templates.js');
const rollupLwcCompilerPlugin = require('rollup-plugin-lwc-compiler');
const rollupCompatPlugin = require('rollup-plugin-compat').default;
const babelPresetCompat = require('babel-preset-compat');
const compatPolyfills = require('compat-polyfills');

// -- Build Config -------------------------------------------
const mode = process.env.MODE || 'compat';
const isCompat = /compat/.test(mode);

const engineModeFile = path.join(require.resolve(`lwc-engine/dist/umd/${isCompat ? 'es5': 'es2017'}/engine.js`));
const wireServicePath = path.join(require.resolve(`lwc-wire-service/dist/umd/${isCompat ? 'es5': 'es2017'}/wire.js`));
const todoPath = path.join(require.resolve('../src/shared/todo.js'));

const testSufix = '.test.js';
const testPrefix = 'test-';

const functionalTestDir = path.join(__dirname, '../', 'src/components');
const functionalTests = fs.readdirSync(functionalTestDir);

const testOutput = path.join(__dirname, '../', 'public');
const testSharedOutput = path.join(testOutput, 'shared');
const testEntries = functionalTests.reduce((seed, functionalFolder) => {
    const testsFolder = path.join(functionalTestDir, functionalFolder);
    const tests = fs.readdirSync(testsFolder).map((test) => {
        const testPath = path.join(testsFolder, test, `${test}${testSufix}`);
        return {
            path: testPath,
            namespace: functionalFolder,
            name: kebabToCamel(test.replace(testPrefix, ''))
        };
    });
    return seed.concat(tests);
}, []);

// -- Plugins & Helpers -------------------------------------
function testCaseComponentResolverPlugin() {
    return {
        name: 'test-case-resolver',
        resolveId(id, importee) {
            if (/test-case/.test(id)) {
                return path.resolve(`./src/shared/${id}.js`);
            }
        }
    };
}

function getTodoApp(testBundle) {
    return templates.todoApp(testBundle);
}

function entryPointResolverPlugin() {
    return {
        name: 'entry-point-resolver',
        resolveId(id, importee) {
            if (id.includes(testSufix)) {
                return id;
            }
        },
        load(id) {
            if (id.includes(testSufix)) {
                const namespace = path.dirname(id).split(path.sep).pop();
                const cmpTag = namespace.replace(testPrefix, '');
                const [ns, ...rest] = cmpTag.split('-');
                const moduleIdentifier = ns + '/'+ kebabToCamel(rest.join('-'));
                return moduleIdentifier.startsWith('wired') ? getTodoApp(moduleIdentifier, cmpTag) : templates.app(moduleIdentifier, cmpTag);
            }
        },
    }
}

function kebabToCamel(s) {
    return s.replace(/(\-\w)/g, function (m) { return m[1].toUpperCase(); });
}

// -- Rollup config ---------------------------------------------

const globalModules = {
    'compat-polyfills/downgrade': 'window',
    'compat-polyfills/polyfills': 'window',
    'engine': 'Engine',
    'wire-service': 'WireService',
    'todo': 'Todo'
};

const baseInputConfig = {
    external: function (id) {
        return id in globalModules
    },
    plugins: [
        entryPointResolverPlugin(),
        rollupLwcCompilerPlugin({
            mode,
            exclude: `**/*${testSufix}`,
            resolveFromPackages: false,
            mapNamespaceFromPath: false,
            ignoreFolderName: true,
            allowUnnamespaced: true,
            compat: { // In order to build faster we manually add compat artifacts later
                downgrade: false,
                polyfills: false
            }
        }),
        testCaseComponentResolverPlugin(),
    ].filter(Boolean)
};

const baseOutputConfig = { format: 'iife', globals: globalModules };

// -- Build shared artifacts -----------------------------------------------------

if (!fs.existsSync(engineModeFile)) {
    throw new Error("Compat version of engine not generated in expected location: " + engineModeFile
        + ".\nGenerate artifacts from the top-level Raptor project first");
}

// copy static files
fs.copySync(engineModeFile, path.join(testSharedOutput,'engine.js'));
fs.writeFileSync(path.join(testSharedOutput,'downgrade.js'), compatPolyfills.loadDowngrade());
fs.writeFileSync(path.join(testSharedOutput,'polyfills.js'), compatPolyfills.loadPolyfills());

fs.copySync(wireServicePath, path.join(testSharedOutput, 'wire.js'));
fs.copySync(todoPath, path.join(testSharedOutput, 'todo.js'));

// -- Build component tests -----------------------------------------------------=

testEntries.reduce(async (promise, test) => {
    await promise;
    const { name: testName, path: testEntry, namespace: testNamespace } = test;
    console.log(`Building integration test: ${testName}`);
    const bundle = await rollup.rollup({ ...baseInputConfig, input: testEntry });

    const result = await bundle.write({
        ...baseOutputConfig,
        file: `${testOutput}/${testNamespace}/${testName}/${testName}.js`
    });

    fs.writeFileSync(`${testOutput}/${testNamespace}/${testName}/index.html`, testName.startsWith('wired') ? templates.wireServiceHtml(testName, isCompat) : templates.html(testName, isCompat), 'utf8');

}, Promise.resolve())
.catch((err) => { console.log(err); });
