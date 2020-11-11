import { createElement } from 'lwc';
import Container from 'x/container';

it('should receive event with correct target', function () {
    const elm = createElement('x-container', { is: Container });
    document.body.appendChild(elm);

    elm.focusFirstInput();
    elm.focusSecondInput();

    expect(elm.relatedTargetTagName).toBe('X-INPUT');
});
