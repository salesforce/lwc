import { createElement } from 'lwc';
import { expectEquivalentDOM } from 'test-utils';
import Outer from 'x/outer';

beforeAll(() => {
    customElements.define('x-external-shadow', class extends HTMLElement {});
});

it('renders slots not at the top level', async () => {
    const elm = createElement('x-outer', { is: Outer });
    document.body.appendChild(elm);

    await Promise.resolve();

    expectEquivalentDOM(
        elm,
        '<x-outer><template shadowrootmode="open"><x-inner><template shadowrootmode="open">a<slot>fallback for default</slot>b<slot name="foo">fallback for foo</slot>c</template><x-external-shadow><div slot="foo">I am the foo slot</div></x-external-shadow><x-external-shadow><div slot="foo">I am also the foo slot</div></x-external-shadow></x-inner></template></x-outer>'
    );
});
