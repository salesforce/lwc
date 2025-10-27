import { describe, it, expect } from 'vitest';
import { toIteratorDirective } from '../to-iterator-directive';

describe('toIteratorDirective', () => {
    const iterables = [
        ['string', 'abc'],
        ['array', ['a', 'b', 'c']],
        ['set', new Set('abc')],
        [
            'generator function',
            (function* () {
                yield 'a';
                yield 'b';
                yield 'c';
            })(),
        ],
    ] as const;

    // False positive: https://github.com/vitest-dev/eslint-plugin-vitest/issues/802
    // eslint-disable-next-line vitest/no-done-callback
    it.for(iterables)('%s is converted', ([_label, iter]) => {
        const generator = toIteratorDirective(iter);
        expect([...generator]).toEqual([
            { value: 'a', index: 0, first: true, last: false },
            { value: 'b', index: 1, first: false, last: false },
            { value: 'c', index: 2, first: false, last: true },
        ]);
        expect(generator.next()).toEqual({ value: undefined, done: true });
    });
});
