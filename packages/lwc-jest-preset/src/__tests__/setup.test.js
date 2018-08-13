test('draggable HTML global attribute should be defined', () => {
    const el = document.createElement('div');
    el.setAttribute('draggable', 'true');

    expect('draggable' in el);
    expect(el.draggable).toBe('true');
});
