export default {
    test(target, snapshot, consoleCalls) {
        // Expect no errors or warnings, hydration or otherwise
        TestUtils.expectConsoleCalls(consoleCalls, {
            error: [],
            warn: [],
        });
    },
};
