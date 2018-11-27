const SpecReporter = require('wdio-spec-reporter');

function decorateCompatPreface(reporter, preface) {
    const modePreface = ` [${reporter.options.mode}]`;
    return preface + modePreface;
}

class RaptorIntegrationReporter extends SpecReporter {
    getResultList(cid, suites, preface = '') {
        return super.getResultList.call(this, cid, suites, decorateCompatPreface(this, preface));
    }
}

RaptorIntegrationReporter.reporterName = 'RaptorIntegrationReporter';

module.exports = RaptorIntegrationReporter;