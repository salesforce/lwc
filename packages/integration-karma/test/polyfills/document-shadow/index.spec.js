it('should attach ShadowRoot to the global object if not present', () => {
    expect(typeof window.ShadowRoot).toBe('function');
});
