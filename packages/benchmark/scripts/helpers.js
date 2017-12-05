const crypto = require('crypto');
const { execSync, spawnSync } = require('child_process');

function sanatizeBuffer(buffer) {
    return buffer.toString().trim();
}

function getRaptorVersion() {
    const res = spawnSync('npm', ['list']);
    const output = res.stdout.toString();
    let [, raptorVerion] = output.match(/raptor-engine@([\d\.]+)/);

    return raptorVerion;
}

function getCommitHash(short = false) {
    return sanatizeBuffer(execSync(`git rev-parse ${short ? '--short' : ''} HEAD`))
}

function sha1(data) {
    const generator = crypto.createHash('sha1');
    generator.update(data);
    return generator.digest('hex');
}

module.exports = {
    getRaptorVersion,
    getCommitHash,
    sha1,
}
