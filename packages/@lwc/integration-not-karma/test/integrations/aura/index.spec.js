import { createElement } from 'lwc';
import Parent from 'c/parent';

it('should support component class marked to be resolved as circular reference', () => {
    const elm = createElement('c-parent', { is: Parent });
    document.body.appendChild(elm);
    // Verifying that shadow tree was created to ensure the component class was successfully processed
    const actual = elm.shadowRoot
        .querySelector('c-child-marked-as-circular')
        .shadowRoot.querySelector('.child');
    expect(actual).toBeDefined();
});

it('should resolve component class of module when it is marked as circular reference', () => {
    const elm = createElement('c-parent', { is: Parent });
    elm.renderCircularModule = true;
    document.body.appendChild(elm);
    // Verifying that shadow tree was created to ensure the component class was successfully processed
    const actual = elm.shadowRoot
        .querySelector('c-child-module-marked-as-circular')
        .shadowRoot.querySelector('.child');
    expect(actual).toBeDefined();
});
