const { LightningElement, Element } = Engine;

it('should be an alias to LightningElement', () => {
    expect(Element).toBe(LightningElement);
});
