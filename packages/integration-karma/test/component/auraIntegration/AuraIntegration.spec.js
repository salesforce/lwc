import { createElement } from 'lwc';
import Parent from 'x/parent';

it('should support component class marked to be resolved as circular reference', () => {
    const elm = createElement('x-parent', { is: Parent });
    document.body.appendChild(elm);
    // Verifying that shadow tree was created to ensure the component class was successfully processed
    const actual = elm.shadowRoot
        .querySelector('x-child-marked-as-circular')
        .shadowRoot.querySelector('.child');
    expect(actual).toBeDefined();
});
