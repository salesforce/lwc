import { createElement } from 'lwc';
import Container from 'x/container';

// Note that focusin events are not fired in Chrome and Firefox if the browser content window is not focused.
// Test for yourself: https://bl.ocks.org/nolanlawson/raw/d8ddc518041e9bf12498b8b50b39df95/
// So this test may "flap" during local development if your browser window isn't focused (e.g. you're focused on
// the DevTools instead).
it('should retarget relatedTarget', function () {
    const elm = createElement('x-container', { is: Container });
    document.body.appendChild(elm);

    elm.focusFirstInput();
    elm.focusSecondInput();

    expect(elm.relatedTargetClassName)
        .withContext(
            'This test may "flap" during local development if your browser window isn\'t focused'
        )
        .toBe('first');
});
