it('should attach ShadowRoot to the global object if not present', () => {
    expect(typeof window.ShadowRoot).toBe('function');
    expect(String(window.ShadowRoot)).toMatch(/ShadowRoot|SyntheticShadowRoot/);
});
