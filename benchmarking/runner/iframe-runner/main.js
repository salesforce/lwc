import './performance-polyfill';

import {
    registered,
} from './benchmark';

export function getRegisteredBenchmark() {
    return registered;
}

export {
    register as benchmark,
} from './benchmark';

export {
    startBenchmarkSuite,
    runSingleBenchmark,
} from './runner';
