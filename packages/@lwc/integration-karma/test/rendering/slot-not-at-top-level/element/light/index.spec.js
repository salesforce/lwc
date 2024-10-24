import { createElement } from 'lwc';
import { expectEquivalentDOM } from 'test-utils';
import Outer from 'x/outer';

it('renders slots not at the top level', async () => {
    const elm = createElement('x-outer', { is: Outer });
    document.body.appendChild(elm);

    await Promise.resolve();

    expectEquivalentDOM(
        elm,
        `<x-outer><x-inner>a<!----><div><div slot="foo">I am the foo slot</div></div><div><div slot="foo">I am also the foo slot</div></div><!---->b<!---->fallback for foo<!---->c</x-inner></x-outer>`
    );
});
