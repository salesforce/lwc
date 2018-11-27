import readonly from "../readonly";

describe('readonly.ts', () => {
    describe('readonly()', () => {
        it('should throw when invoking it with no arguments', () => {
            expect(() => {
                readonly();
            }).toThrow();
        });

        it('should throw when invoking it with more than one argument', () => {
            expect(() => {
                readonly({}, {});
            }).toThrow();
        });

        it('should produce a readonly object that does not allow expandos', () => {
            const o = readonly({});
            expect(() => {
                o.something = 1;
            }).toThrow();
        });

        it('should produce a readonly object that does not allow mutations', () => {
            const o = readonly({ something: 1 });
            expect(() => {
                o.something = 2;
            }).toThrow();
        });
    });
});
