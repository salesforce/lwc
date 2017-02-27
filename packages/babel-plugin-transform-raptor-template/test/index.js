/* eslint-env node */

import * as path from 'path';
import { babelFixtureTransform } from 'raptor-helper-fixture';

import transfromRaptorTemplate from '../src/index';

babelFixtureTransform(path.join(__dirname, 'fixtures'), {
    actualFileExtension: 'html',
    plugins: [
        transfromRaptorTemplate
    ]
});