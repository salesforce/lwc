const fs = require('fs-extra');
const path = require('path');
const rollup = require('rollup');
const lwcCompilerPlugin = require('rollup-plugin-lwc-compiler');
const templates = require('../src/shared/templates.js');

// -- Build Config -------------------------------------------
const mode = process.env.MODE || 'compat';
const isCompat = /compat/.test(mode);
const testSufix = '.test.js';
const testPrefix = 'test-';
const functionalTestDir = path.join(__dirname, '../', 'src/components');
const functionalTests = fs.readdirSync(functionalTestDir);
const testEntries = functionalTests.reduce((seed, functionalFolder) => {
    const testsFolder = path.join(functionalTestDir, functionalFolder);
    const tests = fs.readdirSync(testsFolder).map((test) => {
        const testPath = path.join(testsFolder, test, `${test}${testSufix}`);
        return {
            path: testPath,
            namespace: functionalFolder,
            name: getTestName(testPath),
        };
    });
    return seed.concat(tests);
}, []);
const testOutput = path.join(__dirname, '../', 'public');
const testSharedOutput = path.join(testOutput, 'shared');

// -- Plugins & Helpers -------------------------------------

function getTestName(absPpath) {
    return path.basename(absPpath.replace(testPrefix, '').replace(testSufix, '.js'), '.js').replace(testPrefix, '');
}

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
                const testBundle = getTestName(id);
                return testBundle.startsWith('wired-') ? templates.todoApp(testBundle) : templates.app(testBundle);
            }
        },
    }
}

// -- Rollup config ---------------------------------------------

const globalModules = {
    'engine': 'Engine',
    'babel/helpers/classCallCheck': 'classCallCheck',
    'babel/helpers/possibleConstructorReturn': 'possibleConstructorReturn',
    'babel/helpers/inherits' : 'inherits',
    'babel/helpers/createClass' : 'createClass',
    'babel/helpers/defineProperty': 'defineProperty',
    'wire-service': 'WireService'
};

const baseInputConfig = {
    external: function (id) {
        if (id.includes('babel/helpers') || id.includes('engine') || id.includes('wire-service')) {
            return true;
        }
    },
    plugins: [
        entryPointResolverPlugin(),
        lwcCompilerPlugin({
            mode,
            exclude: `**/*${testSufix}`,
            resolveFromPackages: false,
            mapNamespaceFromPath: false,
            resolveProxyCompat: { global: 'window.Proxy' },
            globals: globalModules
        }),
        testCaseComponentResolverPlugin(),
    ]
};
const baseOutputConfig = {
    format: 'iife',
    globals: globalModules
};

// -- Build shared artifacts -----------------------------------------------------

const engineModeFile = path.join(require.resolve(`lwc-engine/dist/umd/${isCompat ? 'es5': 'es2017'}/engine.js`));
const compatPath = path.join(require.resolve('proxy-compat-build/dist/umd/compat_downgrade.js'));
const wireServicePath = path.join(require.resolve(`lwc-wire-service/dist/umd/${isCompat ? 'es5': 'es2017'}/wire-service.js`));

if (!fs.existsSync(engineModeFile)) {
    throw new Error("Compat version of engine not generated in expected location: " + engineModeFile
        + ".\nGenerate artifacts from the top-level Raptor project first");
}

// copy static files
fs.copySync(compatPath, path.join(testSharedOutput, 'compat.js'));
fs.copySync(engineModeFile, path.join(testSharedOutput,'engine.js'));
fs.copySync(wireServicePath, path.join(testSharedOutput, 'wire-service.js'));

// -- Build component tests -----------------------------------------------------=

testEntries.reduce(async (promise, test) => {
    await promise;
    const { name: testName, path: testEntry, namespace: testNamespace } = test;
    const bundle = await rollup.rollup({
        ...baseInputConfig,
        input: testEntry
    });

    const result = await bundle.write({
        ...baseOutputConfig,
        file: `${testOutput}/${testNamespace}/${testName}/${testName}.js`
    });

    fs.writeFileSync(`${testOutput}/${testNamespace}/${testName}/index.html`, testName.startsWith('wired-') ? templates.wireServiceHtml(testName, isCompat) : templates.html(testName, isCompat), 'utf8');

}, Promise.resolve())
.catch((err) => { console.log(err); });
