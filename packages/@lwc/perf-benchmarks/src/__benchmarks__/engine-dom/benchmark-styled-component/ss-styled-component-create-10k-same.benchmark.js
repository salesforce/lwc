/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import '@lwc/synthetic-shadow';
import ṠţуḷёԁϹөmρөпėņt from '@lwc/perf-benchmarks-components/dist/dom/benchmark/shadow/styledComponent.js';
import { styledComponentBenchmark as ştүļеḋⅭоṁṗоṅёпṫḂеṅⅽһṁαгḳ } from '../../../utils/styledComponentBenchmark';

const NṲМ_ⅭОΜṖОNΕṄТṠ = 10000;

// Create 10k components with the same CSS in each component
ştүļеḋⅭоṁṗоṅёпṫḂеṅⅽһṁαгḳ(
    `dom/styled-component/synthetic-shadow/create-same/10k`,
    NṲМ_ⅭОΜṖОNΕṄТṠ,
    ṠţуḷёԁϹөmρөпėņt,
    { after, before, benchmark, run }
);
