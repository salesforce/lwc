const path = require('path');

const glob = require('glob');
const rimraf = require('rimraf');
const rollup = require('rollup');
const { Server, config } = require('karma');
const lwcRollupPlugin = require('@lwc/rollup-plugin');
const compatRollupPlugin = require('rollup-plugin-compat');

const SPEC_ENTRY = 'index.spec.js';
const TEST_FOLDER = path.resolve(__dirname, '../test');
const DIST_FOLDER = path.resolve(__dirname, '../dist');

const specDirs = glob
    .sync(`**/${SPEC_ENTRY}`, { cwd: TEST_FOLDER })
    .map(spec => path.dirname(spec));

cleanupDist();

for (const specDir of specDirs) {
    compileAndWatch(specDir);
}

function compileAndWatch(specDir) {
    const splitPath = specDir.split(path.sep);

    const name = splitPath.pop();
    const ancestors = splitPath;

    const watchHandler =  event => {
        const { code } = event;
        console.log(event)
        if (code === 'BUNDLE_END') {
            console.log(`Bundled ${specDir} in ${event.duration}ms`);
        } else if (code === 'ERROR' || code === 'FATAL') {
            console.error(event.error);
        }
    }

    const warnHandler = warning => {
        console.log(warning);
    };

    const watcher = rollup.watch({
        input: path.resolve(TEST_FOLDER, specDir, SPEC_ENTRY),
        onwarn: warnHandler,
        external: ['lwc'],

        plugins: [
            lwcRollupPlugin({
                // Disable package resolution for now of performance reasons.
                resolveFromPackages: false,
            }),
            compatRollupPlugin({
                polyfills: false,
            })
        ],

        output: {
            file: path.resolve(DIST_FOLDER, ...ancestors, `${name}.spec.js`),
            format: 'iife',
            sourcemap: 'inline',

            globals: {
                lwc: 'Engine',
            },
        },
    });

    watcher.on('event', watchHandler);
}

function cleanupDist() {
    rimraf.sync(DIST_FOLDER);
}

// const karmaConfig = config.parseConfig(path.resolve(__dirname, './karma.conf.js'));

// const server = new Server(karmaConfig, exitCode => {
//     console.log('>>>>>', exitCode)

//     runner.run(karmaConfig)
// });

// server.start();
