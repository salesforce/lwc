/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Borrowed from https://github.com/facebook/jest

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const { execSync } = require('child_process');
const { isBinaryFileSync } = require('isbinaryfile');

const getFileContents = (path) => fs.readFileSync(path, { encoding: 'utf-8' });
const isDirectory = (path) => fs.lstatSync(path).isDirectory();
const createRegExp = (pattern) => new RegExp(pattern);

const IGNORED_EXTENSIONS = [
    'lock',
    'patch',
    'exe',
    'bin',
    'cfg',
    'config',
    'conf',
    // 'html', // might have LWC components we want the header on
    'md',
    'markdown',
    'opam',
    'osm',
    'descr',
    'rst',
    'json',
    'key',
    'ini',
    'plist',
    'snap',
    'svg',
    'txt',
    'xcodeproj',
    'xcscheme',
    'xml',
    'yaml',
    'yml',
    'textile',
    'tsv',
    'csv',
    'pem',
    'csr',
    'der',
    'crt',
    'cert',
    'cer',
    'p7b',
    'iml',
    'org',
    'podspec',
    'modulemap',
    'pch',
    'lproj',
    'xcworkspace',
    'storyboard',
    'tvml',
    'xib',
    'pbxproj',
    'xcworkspacedata',
    'xccheckout',
    'xcsettings',
    'strings',
    'ipynb',
    'htm',
    'toml',
].map((extension) => createRegExp(`.${extension}$`));

const GENERIC_IGNORED_PATTERNS = [
    '(^|/)\\.[^/]+(/|$)',

    //'third[_\\-. ]party/',  // to be on the safe side
    '^node[_\\-. ]modules/',
    'gradlew\\.bat$',
    'gradlew$',
    'gradle/wrapper/',
    '.idea/',
    '__init__\\.py$',
    '^Setup.hs$',
    '^(readme|README|Readme)\\..*$',
    'Cargo\\.toml$',
    '^Cartfile.*$',
    '^.*\\.xcodeproj/$',
    '^.*\\.xcworkspace/$',
    '^.*\\.lproj/$',
    '^.*\\.bundle/$',
    '^MANIFEST\\.in$',
].map(createRegExp);

const CUSTOM_IGNORED_PATTERNS = [
    // add anything repo specific here
    'playground/',
    '/fixtures/',
    '/@lwc/integration-tests/src/(.(?!.*.spec.js$))*$',
    '/@lwc/integration-karma/test/.*$',
    '/@lwc/integration-karma/test-hydration/.*$',
    '/@lwc/engine-server/src/__tests__/modules/.*$',
].map(createRegExp);

const IGNORED_PATTERNS = [
    ...IGNORED_EXTENSIONS,
    ...GENERIC_IGNORED_PATTERNS,
    ...CUSTOM_IGNORED_PATTERNS,
];

const INCLUDED_PATTERNS = [
    // Any file with an extension
    /\.[^/]+$/,
];

// In 2022, Salesforce changed from "salesforce.com, inc." to "Salesforce, Inc."
const COPYRIGHT_HEADER_RE = /Copyright (\(c\))? 20[0-9]{2}, (s|S)alesforce(\.com)?, [iI]nc./;

function needsCopyrightHeader(file) {
    const contents = getFileContents(file);
    return contents.trim().length > 0 && !COPYRIGHT_HEADER_RE.test(contents);
}

function check(files) {
    const invalidFiles = files.filter(
        (file) =>
            INCLUDED_PATTERNS.some((pattern) => pattern.test(file)) &&
            !IGNORED_PATTERNS.some((pattern) => pattern.test(file)) &&
            !isDirectory(file) &&
            !isBinaryFileSync(file) &&
            needsCopyrightHeader(file)
    );

    if (invalidFiles.length > 0) {
        console.log(`Salesforce copyright header check failed for the following files:
  ${invalidFiles.join('\n  ')}
Please include the header or add an exception for the file in \`scripts/check-license-headers.js\``);
        process.exit(1);
    }
}

// Check provided files, if any, otherwise check all files tracked by git
check(
    process.argv.length > 2
        ? process.argv.slice(2)
        : execSync('git ls-files', { encoding: 'utf-8' }).trim().split('\n')
);
