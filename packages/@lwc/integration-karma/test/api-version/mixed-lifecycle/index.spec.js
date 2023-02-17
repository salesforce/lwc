import { createElement } from 'lwc';
import SyntheticParent from 'x/syntheticParent';
import NativeParent from 'x/nativeParent';
import SyntheticChild from 'x/syntheticChild';
import NativeChild from 'x/nativeChild';

describe('mixed api versioning', () => {
    // native custom element lifecycle not supported in compat browsers
    if (!process.env.COMPAT) {
        describe('lifecycle callback timing', () => {
            function resetTimingBuffer() {
                window.timingBuffer = [];
            }

            beforeEach(() => {
                resetTimingBuffer();
            });

            afterEach(() => {
                delete window.timingBuffer;
            });

            async function testTimingBuffer(
                elm,
                expectedBufferAfterAppendingToContainer,
                expectedBufferAfterAppendingToBody
            ) {
                // Exploiting a bug in synthetic lifecycle callbacks to detect the difference between synthetic and native:
                // https://github.com/salesforce/lwc/issues/2609#issuecomment-1055938598
                const container = document.createElement('div');

                container.appendChild(elm);
                await Promise.resolve();
                // synthetic will fire connected callback here, native will not
                expect(window.timingBuffer).toEqual(expectedBufferAfterAppendingToContainer);
                resetTimingBuffer();

                document.body.appendChild(container);
                await Promise.resolve();
                // native will fire connected callback here, synthetic will  not
                expect(window.timingBuffer).toEqual(expectedBufferAfterAppendingToBody);
            }

            it('render v58 directly', async () => {
                const elm = createElement('x-synthetic-child', { is: SyntheticChild });

                await testTimingBuffer(
                    elm,
                    ['child:constructor', 'child:connectedCallback', 'child:renderedCallback'],
                    []
                );
            });

            it('render v59 directly', async () => {
                const elm = createElement('x-native-child', { is: NativeChild });

                await testTimingBuffer(
                    elm,
                    ['child:constructor'],
                    ['child:connectedCallback', 'child:renderedCallback']
                );
            });

            it('parent using v58 and child using v59', async () => {
                const elm = createElement('x-synthetic-parent', { is: SyntheticParent });

                await testTimingBuffer(
                    elm,
                    [
                        'parent:constructor',
                        'parent:connectedCallback',
                        'child:constructor',
                        'parent:renderedCallback',
                    ],
                    ['child:connectedCallback']
                );
            });

            it('parent using v59 and child using v58', async () => {
                const elm = createElement('x-native-parent', { is: NativeParent });

                await testTimingBuffer(
                    elm,
                    ['parent:constructor'],
                    [
                        'parent:connectedCallback',
                        'child:constructor',
                        'child:connectedCallback',
                        'child:renderedCallback',
                        'parent:renderedCallback',
                    ]
                );
            });
        });
    }
});
