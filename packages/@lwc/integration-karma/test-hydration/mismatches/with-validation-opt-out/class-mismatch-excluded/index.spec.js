export default {
    test(_target, _snapshots, consoleCalls) {
        expect(consoleCalls.error).toHaveSize(2);
        expect(consoleCalls.error[0][0].message).toContain(
            'Mismatch hydrating element <x-child>: attribute "class" has different values'
        );
        expect(consoleCalls.error[1][0].message).toContain('Hydration completed with errors.');
    },
};
