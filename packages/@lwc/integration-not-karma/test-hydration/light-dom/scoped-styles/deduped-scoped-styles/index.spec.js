import { expectConsoleCalls } from '../../../../helpers/utils.js';

export default {
    test(target, snapshot, consoleCalls) {
        // W-19087941: Expect no errors or warnings, hydration or otherwise
        expectConsoleCalls(consoleCalls, {
            error: [],
            warn: [],
        });
    },
};
