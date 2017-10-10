const fs = require('fs-extra');
const proxyCompatSource = fs.readFileSync('../proxy-compat/dist/proxy-compat.js');
const proxyCompatMin = fs.readFileSync('../proxy-compat/dist/proxy-compat.min.js')
const path = require('path');

const distDir = path.join(__dirname, '../../../dist');
const engineComat = path.join(distDir, 'engine_compat.js');

if (!fs.existsSync(engineComat)) {
    throw new Error("Compat version of engine not generated in expected location: " + engineComat
        + ".\nGenerate artifacts from the top-level Raptor project first");
}

fs.copySync(distDir, './public/engine/');
