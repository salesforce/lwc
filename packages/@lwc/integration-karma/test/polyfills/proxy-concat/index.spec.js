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
    const result = [1].concat([true], null, { x: 'x' }, [5]);

    expect(result.length).toBe(5);
    expect(result).toEqual([1, true, null, { x: 'x' }, 5]);
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

it('should invoke get traps for length, 0 and 1', () => {
    const getCalls = [];
    const hasCalls = [];

    const proxyHandler = {
        get(target, key) {
            getCalls.push([target, key]);
            return target[key];
        },
        has(target, key) {
            hasCalls.push([target, key]);
            return key in target;
        },
    };

    const first = [1, 2];
    const second = [3, 4];
    const secondProxified = new Proxy(second, proxyHandler);
    const result = first.concat(secondProxified);

    expect(result).toEqual([1, 2, 3, 4]);

    // Since Proxy COMPAT doesn't normalize the accessed key, we need to convert all the accessed keys to String to
    // ensure consistent behavior regardless with we use the Native or the COMPAT version of Proxy.
    //    Native Proxy => ['length', '0', '1']
    //    Native Proxy => ['length', 0, 1]
    const getKeys = getCalls.map((item) => String(item[1]));

    // Instead of comparing all the items using .toEqual(), we look if specific elements are present in the accessed
    // keys. On older versions of Chrome and Firefox we are running a strange mode where the served code is COMPAT,
    // while native proxy are used. Because of the transformations applied, some extra properties are accessed on the
    // native proxies (eg. _ES5ProxyType)
    expect(getKeys.includes('length')).toBe(true);
    expect(getKeys.includes('0')).toBe(true);
    expect(getKeys.includes('1')).toBe(true);
});
