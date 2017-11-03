const fs = require('fs-extra');
const path = require('path');
const rollup = require('rollup');
const raptorCompilerPlugin = require('rollup-plugin-raptor-compiler');
const templates = require('../src/shared/templates.js');

// -- Build Config -------------------------------------------
const mode = process.env.MODE || 'compat';
const isCompat = /compat/.test(mode);
const testSufix = '.test.js';
const testPrefix = 'test-';
const testDir = path.join(__dirname, '../', 'src/components');
const tests = fs.readdirSync(testDir);
const testEntries = tests.map(test => path.join(testDir, test, `${test}${testSufix}`));
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
                return templates.app(testBundle);
            }
        },
    }
}

// -- Rollup config ---------------------------------------------

const baseInputConfig = {
    external: function (id) {
        if (id.includes('babel/helpers') || id.includes('engine')) {
            return true;
        }
    },
    plugins: [
        entryPointResolverPlugin(),
        raptorCompilerPlugin({
            mode,
            exclude: `**/*${testSufix}`,
            resolveFromPackages: false,
            mapNamespaceFromPath: false,
            resolveProxyCompat: { global: 'window.Proxy' }
        }),
        testCaseComponentResolverPlugin()
    ]
};
const baseOutputConfig = {
    format: 'iife',
    globals: {
        'engine': 'Engine',
        'babel/helpers/classCallCheck': 'classCallCheck',
        'babel/helpers/possibleConstructorReturn': 'possibleConstructorReturn',
        'babel/helpers/inherits' : 'inherits',
        'babel/helpers/createClass' : 'createClass',
    }
};

// -- Build shared artifacts -----------------------------------------------------

const engineModeFile = path.join(require.resolve(`raptor-engine/dist/umd/${isCompat ? 'es5': 'es2017'}/engine.js`));
const compatPath = path.join(require.resolve('raptor-compat/dist/umd/compat_downgrade.js'));

if (!fs.existsSync(engineModeFile)) {
    throw new Error("Compat version of engine not generated in expected location: " + engineModeFile
        + ".\nGenerate artifacts from the top-level Raptor project first");
}

// copy static files
fs.copySync(compatPath, path.join(testSharedOutput, 'compat.js'));
fs.copySync(engineModeFile, path.join(testSharedOutput,'engine.js'));


// -- Build component tests -----------------------------------------------------=

testEntries.reduce(async (promise, testEntry) => {
    await promise;

    const testName = getTestName(testEntry);

    const bundle = await rollup.rollup({
        ...baseInputConfig,
        entry: testEntry
    });

    const result = await bundle.write({
        ...baseOutputConfig,
        dest: `${testOutput}/${testName}/${testName}.js`
    });

    fs.writeFileSync(`${testOutput}/${testName}/index.html`, templates.html(testName, isCompat), 'utf8');

}, Promise.resolve())
.catch((err) => { console.log(err); });
