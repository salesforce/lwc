import * as babel from 'babel-core';
import * as fs from 'fs';
import * as p from 'path';

import plugin from '../src/index';

const baseDir = p.resolve(`${__dirname}/../test/fixtures`);

const BASE_OPTIONS = {
    strict: false,
    modules: true,
};

const ignore = [
    'emptyTemplateError',
    'expressionEvaluationError',
    'multiRootError',
    'mutliHtmlRootError',
    'rootTagTemplateError',
    'slotsErrorDirectives',
    'customElementInvalidAttributeError'
];

fs.readdirSync(baseDir).forEach((testName) => {
    if (ignore.indexOf(testName) !== -1) {
        return;
    }

    console.log('>> Build expected file for: ', testName);
    const src = fs.readFileSync(`${baseDir}/${testName}/actual.html`);

    const {code} = babel.transform(src, {
        plugins: [
            [plugin, BASE_OPTIONS],
        ],
    });

    fs.writeFileSync(`${baseDir}/${testName}/expected.js`, `${code}\n`);
});
