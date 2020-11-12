import { createElement } from 'lwc';
import Container from 'x/container';

it('should retarget relatedTarget', function () {
    const elm = createElement('x-container', { is: Container });
    document.body.appendChild(elm);

    elm.focusFirstInput();
    elm.focusSecondInput();

    expect(elm.relatedTargetClassName).toBe('first');
});
