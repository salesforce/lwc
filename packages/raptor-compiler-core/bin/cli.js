#!/usr/bin/env babel-node

import {compile} from '../src/index';

const entry = 'test/fixtures/classAndTemplate/';

compile({ componentPath: entry });