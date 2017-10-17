const SpecReporter = require('wdio-spec-reporter');

function decorateCompatPreface(reporter, preface) {
    const compatPreface = reporter.options.compat ? ' [COMPAT]' : '';
    return preface + compatPreface;
}

class RaptorIntegrationReporter extends SpecReporter {
    getResultList(cid, suites, preface = '') {
        return super.getResultList.call(this, cid, suites, decorateCompatPreface(this, preface));
    }
}

RaptorIntegrationReporter.reporterName = 'RaptorIntegrationReporter';

module.exports = RaptorIntegrationReporter;