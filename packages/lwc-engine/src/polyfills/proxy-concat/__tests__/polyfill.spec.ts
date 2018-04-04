import applyPolyfill from '../polyfill';

applyPolyfill();

it('should correctly concatenate 2 standard arrays', () => {
    const first = [1, 2];
    const second = [3, 4];
    const result = first.concat(second);

    expect(result.length).toBe(4);
    expect(result).toEqual([1, 2, 3, 4]);
});

it('should correctly concatenate all parameters', () => {
    const result = [1].concat([2], [3, 4], [5]);

    expect(result.length).toBe(5);
    expect(result).toEqual([1, 2, 3, 4, 5]);
});

it('should correctly concatenate values and arrays', () => {
    const result = ([1] as any).concat([ true ], null, { x: 'x' }, [5]);

    expect(result.length).toBe(5);
    expect(result).toEqual([1, true, null, { x: 'x' }, 5]);
});

it('should respect isConcatSpreadable on arrays', () => {
    const first = [1, 2];
    const second = [3, 4];
    second[Symbol.isConcatSpreadable] = false;
    const result = first.concat(second);

    expect(result.length).toBe(3);
    expect(result).toEqual([1, 2, second]);
});

it('should respect isConcatSpreadable on array-like objects', () => {
    const first = [1, 2];
    const second: any = {
        [Symbol.isConcatSpreadable]: true,
        length: 2,
        0: 3,
        1: 4
    };
    const result = first.concat(second);

    expect(result.length).toBe(4);
    expect(result).toEqual([1, 2, 3, 4]);
});

it('should correctly concatenate when the target is a Proxy', () => {
    const first = new Proxy([1, 2], {});
    const second = [3, 4];
    const result = first.concat(second);

    expect(result.length).toBe(4);
    expect(result).toEqual([1, 2, 3, 4]);
});

it('should correctly concatenate when the parameter is a proxy', () => {
    const first = [1, 2];
    const second = new Proxy([3, 4], {});
    const result = first.concat(second);

    expect(result.length).toBe(4);
    expect(result).toEqual([1, 2, 3, 4]);
});

it('should correctly concatenate 2 proxified arrays', () => {
    const first = new Proxy([1, 2], {});
    const second = new Proxy([3, 4], {});
    const result = first.concat(second);

    expect(result.length).toBe(4);
    expect(result).toEqual([1, 2, 3, 4]);
});

it('should call all the proxy traps', () => {
    const getTrap = jest.fn((target, key) => Reflect.get(target, key));
    const hasTrap = jest.fn((target, key) => Reflect.has(target, key));
    const proxyHandler = {
        get: getTrap,
        has: hasTrap,
    };

    const first = [1, 2];
    const second = [3, 4];
    const secondProxified = new Proxy([3, 4], proxyHandler);
    const result = first.concat(secondProxified);

    expect(getTrap.mock.calls).toEqual([
        [second, Symbol.isConcatSpreadable, second],
        [second, 'length', second],
        [second, '0', second],
        [second, '1', second],
    ]);
    expect(hasTrap.mock.calls).toEqual([
        [second, '0'],
        [second, '1'],
    ]);
});
