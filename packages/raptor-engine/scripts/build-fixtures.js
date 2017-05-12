/*jshint node: true */

const path = require('path');
const fs = require('fs');
const argv = require('yargs').argv;
const raptor = require('rollup-plugin-raptor-compiler');
const uglify = require('rollup-plugin-uglify');
const strip = require('rollup-plugin-strip');
const rollup = require('rollup');
const glob = require("glob");

const componentsPlugins = [];
const configs = [];

if (argv.production) {
    componentsPlugins.push(strip({ debugger: true, functions: [ 'console.*', 'assert.*' ] }));
    componentsPlugins.push(uglify({ warnings: false }));
}

function buildBundle(bundleConfig) {
    return rollup.rollup(bundleConfig.input)
        .then(function(bundle) {
            if (bundleConfig.html) {
                fs.writeFileSync(`fake-html/${bundleConfig.name}.html`, bundleConfig.html);
            }
            return bundle.write(bundleConfig.output);
        }).then(() => bundleConfig.output.dest);
}

function buildBundles(configs) {
    const promises = configs.map(buildBundle);
    return Promise.all(promises)
        .then((bundles) => {
            console.log('-> built %d bundles', configs.length);
            fs.writeFileSync('fake-html/index.html', generateHTMLIndex(configs));
            return bundles;
        });
}

function generateHTMLIndex(configs) {
    const links = configs.map((config) => {
        return `
            <li>
                <a href="${config.name}.html">
                    ${config.name}
                </a> | ${config.isApp ? '(app)' : '(standalone component)'}
            </li>
        `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Raptor - Fixtures</title>
    </head>
    <body>
        <h1>Fixtures</h1>
        <div id="container">
            <ul>
                ${links}
            </ul>
        </div>
    </body>
    </html>
    `;
}

function generateHTML(bundleSource, elementName, ctorName, isApp) {
    const script = !isApp ? `
    <script>
        const container = document.getElementById('container');
        const element = Engine.createElement('${elementName}', { is: ${ctorName} });
        container.appendChild(element);
    </script>
    `: '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${elementName}</title>
    </head>
    <body>
        <div id="container"></div>
        <script src="engine.js"></script>
        <script src="${bundleSource}"></script>
        ${script}
    </body>
    </html>
    `;
}

// ------- BUNDLE -----------------------------------------------------------------------

glob.sync('fixtures/**/*.js').forEach(function (cmpPath) {
    const entry = path.basename(cmpPath, '.js');
    const p = path.dirname(cmpPath);
    const pieces = p.split(path.sep);
    const dirName = pieces.pop();
    const moduleName = entry.replace(/-/g, '$');
    const isApp = entry.indexOf('app-') !== -1;

    if (cmpPath.indexOf('/prototype') !== -1) {
        return;
    }

    if (isApp || dirName === entry) {
        configs.push({
            isApp,
            name: entry,
            moduleName,
            html: generateHTML(`${entry}.js`, entry, moduleName, isApp),
            folder: p,
            input: {
                entry: cmpPath,
                plugins: [
                    raptor({ resolveEngine: false })
                ].concat(componentsPlugins),
            },
            output: {
                dest: 'fake-cdn/' + entry + '.js',
                format: 'iife',
                moduleName: moduleName,
                sourceMap: 'inline',
                globals: { engine: 'Engine' },
            },
        });
    }
});

if (argv.watch) {
    console.log('watching...');
    const watch = require('watch');
    const EventEmitter = require('events');
    const watcher = new EventEmitter();

    configs.forEach((bundleConfig) => {
        watch.watchTree(bundleConfig.folder, function onFileChange() {
            buildBundle(bundleConfig)
                .then((dest) => {
                    console.log('-> built [%s] bundle', dest);
                    watcher.emit('rolled');
                })
                .catch((err) => {
                    console.error(err.stack)
                });
        })
    });
} else {
    console.log('building...');
    buildBundles(configs).catch((err) => {
        console.error(err.stack)
    });
}
