it('should accept a listener config as second parameter', () => {
    const handleEvent = jasmine.createSpy('handleEvent', () => {});

    const elm = document.createElement('div');
    elm.addEventListener('test', {
        handleEvent: handleEvent,
    });
    elm.dispatchEvent(new CustomEvent('test'));

    expect(handleEvent).toHaveBeenCalled();
});
