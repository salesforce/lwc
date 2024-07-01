export default {
    test(_target, _snapshots, consoleCalls) {
        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [
                'Mismatch hydrating element <x-child>: attribute "class" has different values',
                'Hydration completed with errors.',
            ],
        });
    },
};
