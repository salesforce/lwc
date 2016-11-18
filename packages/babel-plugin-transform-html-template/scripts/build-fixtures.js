import * as babel from 'babel-core';
import * as fs from 'fs';
import * as p from 'path';

import plugin from '../src/index';

const baseDir = p.resolve(`${__dirname}/../test/fixtures`);

const BASE_OPTIONS = {
    strict: false,
    strictMode: false,
    modules: false,
};

const fixtures = [
    'template',
    'forLoop',
    'nativeAttributeStyles',
    'all',
    // ['all', {
    //     extractSourceLocation: true,
    // }],
];

fixtures.forEach((fixture) => {
    let name = fixture;
    let options = {};

    if (Array.isArray(fixture)) {
        [name, options] = fixture;
    }

    const src = fs.readFileSync(`${baseDir}/${name}/actual.html`);
    const {code} = babel.transform(src, {
        plugins: [
            [plugin, BASE_OPTIONS],
        ],
    });

    fs.writeFileSync(`${baseDir}/${name}/expected.js`, `${code}\n`);
});