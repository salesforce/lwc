import {
    createElement,
    freezeTemplate,
    LightningElement,
    registerComponent,
    registerTemplate,
    registerDecorators,
} from 'lwc';

import HtmlTags from 'html/tags';
import UiSomething from 'ui/something';
import UiSomethingElse from 'ui/somethingElse';
import UiBoolean from 'ui/boolean';
import UiAnother from 'ui/another';
import UiOutputPercent from 'ui/outputpercent';
import ForceFoo from 'force/foo';
import NestedHtmlTags from 'nested/htmlTags';
import { extractDataIds } from 'test-utils';
import testProps from './act-components/test-props';
import testAttrs from './act-components/test-attrs';
import testBodySlot from './act-components/test-body-slot';
import testClassAttr from './act-components/test-class-attr';
import testConditionalFalseAttribute from './act-components/test-conditional-false-attribute';
import testConditionalTrueAttribute from './act-components/test-conditional-true-attribute';
import testEmptySlot from './act-components/test-empty-slot';
import testEmptySlotElementCreation from './act-components/test-empty-slot-element-creation';
import testHtmlTags from './act-components/test-html-tags';
import testMultipleChildrenInSlot from './act-components/test-multiple-children-in-slot';
import testMultipleSlots from './act-components/test-multiple-slots';
import testNestedHtmlTags from './act-components/test-nested-html-tags';
import testPropertyReference from './act-components/test-property-reference';
import testSlotAdjacentToNamedSlot from './act-components/test-slot-adjacent-to-named-slot';
import testSlotElementCreationWithDuplicateSlotNames from './act-components/test-slot-element-creation-with-duplicate-slot-names';
import testSlotInGrandchild from './act-components/test-slot-in-grandchild';
import testStyleAttr from './act-components/test-style-attr';

// Tests that confirm that the runtime LWC engine-dom is compatible with the compiled templates
// from the ACTCompiler
describe('ACTCompiler', () => {
    function createComponentFromTemplate(
        template,
        { props = {}, propsToTrack = [], methods = {} } = {}
    ) {
        const publicProps = {};
        for (const prop of Object.keys(props)) {
            if (!propsToTrack.includes(prop)) {
                publicProps[prop] = { config: 0 };
            }
        }

        class CustomElement extends LightningElement {
            constructor(...args) {
                super(...args);
                for (const key of Object.keys(props)) {
                    this[key] = props[key];
                }
            }
        }

        for (const methodName of Object.keys(methods)) {
            Object.defineProperty(CustomElement.prototype, methodName, {
                value: methods[methodName],
            });
        }

        const track = {};
        for (const prop of propsToTrack) {
            track[prop] = 1;
        }

        registerDecorators(CustomElement, {
            publicProps,
            track,
        });

        return registerComponent(CustomElement, {
            tmpl: template,
        });
    }

    function loadDependencies(dependencies) {
        return dependencies.map((depName) => {
            switch (depName) {
                case 'force/foo':
                    return ForceFoo;
                case 'html/tags':
                    return HtmlTags;
                case 'lwc':
                    return { freezeTemplate, registerComponent, registerTemplate };
                case 'nested/htmlTags':
                    return NestedHtmlTags;
                case 'ui/another':
                    return UiAnother;
                case 'ui/boolean':
                    return UiBoolean;
                case 'ui/outputpercent':
                    return UiOutputPercent;
                case 'ui/something':
                    return UiSomething;
                case 'ui/somethingElse':
                    return UiSomethingElse;
                default:
                    throw new Error('Unknown dependency: ' + depName);
            }
        });
    }

    function directoryNameToComponentName(dirName) {
        const [namespace, name] = dirName.split('/');
        return namespace + '-' + name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
    }

    function createAndInsertActComponent(createComponent, options) {
        const define = (moduleName, dependencyNames, moduleDef) => {
            const dependencies = loadDependencies(dependencyNames);
            const template = moduleDef(...dependencies);
            const componentName = directoryNameToComponentName(moduleName);
            const Component = createComponentFromTemplate(template, options);
            return createElement(componentName, { is: Component });
        };

        const component = createComponent(define);
        document.body.appendChild(component);
        return component;
    }

    it('props', () => {
        const component = createAndInsertActComponent(testProps);

        expect(component.tagName.toLowerCase()).toEqual('records-record-layout2');
        expect(component.shadowRoot.children.length).toEqual(1);
        expect(component.shadowRoot.children[0].tagName.toLowerCase()).toEqual('ui-something');

        const nodes = extractDataIds(component);

        expect(nodes.mode.textContent).toEqual('VIEW');
        expect(nodes.propWithDash.textContent).toEqual('X');
        expect(nodes.fieldLabel.textContent).toEqual('');
        expect(nodes.trueAttr.textContent).toEqual('true');
        expect(nodes.camelCase.textContent).toEqual('YZ');
    });

    it('attrs', () => {
        const component = createAndInsertActComponent(testAttrs);

        const uiSomething = component.shadowRoot.querySelector('ui-something');
        expect(uiSomething.getAttribute('data-blah-de-blah')).toEqual('special-data-attribute');
        expect(uiSomething.getAttribute('data-blah-blah')).toEqual('anotherDataAttribute');
        expect(uiSomething.getAttribute('role')).toEqual('listitem');
    });

    it('body slot', () => {
        const component = createAndInsertActComponent(testBodySlot);

        expect(component.shadowRoot.children.length).toEqual(1);
        expect(component.shadowRoot.children[0].tagName.toLowerCase()).toEqual('force-foo');

        const forceFoo = component.shadowRoot.querySelector('force-foo');
        expect(forceFoo.children.length).toEqual(1);
        expect(forceFoo.children[0].tagName.toLowerCase()).toEqual('ui-something');

        const nodes = extractDataIds(component);

        expect(nodes.name.textContent).toEqual('Elizabeth Shaw');
        expect(nodes.text.textContent).toEqual('Hello');
    });

    it('class attribute', () => {
        const component = createAndInsertActComponent(testClassAttr);
        const uiSomething = component.shadowRoot.querySelector('ui-something');
        expect(uiSomething.classList.length).toEqual(2);
        expect(uiSomething.classList.contains('slds-has-divider_top')).toEqual(true);
        expect(uiSomething.classList.contains('slds-grid')).toEqual(true);
    });

    it('conditional false attribute - false', () => {
        const component = createAndInsertActComponent(testConditionalFalseAttribute, {
            props: { state: { irrelevant: false } },
            propsToTrack: ['state'],
        });

        expect(component.shadowRoot.children.length).toEqual(1);
        expect(component.shadowRoot.children[0].tagName.toLowerCase()).toEqual('ui-boolean');

        const nodes = extractDataIds(component);
        expect(nodes.other.textContent).toEqual('irrelevant');
    });

    it('conditional false attribute - true', () => {
        const component = createAndInsertActComponent(testConditionalFalseAttribute, {
            props: { state: { irrelevant: true } },
            propsToTrack: ['state'],
        });

        expect(component.shadowRoot.children.length).toEqual(0);
    });

    it('conditional true attribute - true', () => {
        const component = createAndInsertActComponent(testConditionalTrueAttribute, {
            props: { state: { irrelevant: true } },
            propsToTrack: ['state'],
        });

        expect(component.shadowRoot.children.length).toEqual(1);
        expect(component.shadowRoot.children[0].tagName.toLowerCase()).toEqual('ui-boolean');

        const nodes = extractDataIds(component);
        expect(nodes.other.textContent).toEqual('irrelevant');
    });

    it('conditional true attribute - false', () => {
        const component = createAndInsertActComponent(testConditionalTrueAttribute, {
            props: { state: { irrelevant: false } },
            propsToTrack: ['state'],
        });

        expect(component.shadowRoot.children.length).toEqual(0);
    });

    it('empty slot', () => {
        const component = createAndInsertActComponent(testEmptySlot);

        expect(component.shadowRoot.children.length).toEqual(1);
        expect(component.shadowRoot.children[0].tagName.toLowerCase()).toEqual('force-foo');
        expect(component.shadowRoot.querySelector('force-foo').children.length).toEqual(0);
    });

    it('empty slot element creation', () => {
        const component = createAndInsertActComponent(testEmptySlotElementCreation);

        const forceFoo = component.shadowRoot.querySelector('force-foo');
        const uiAnother = forceFoo.querySelector('ui-another');
        expect(uiAnother.children.length).toEqual(0); // slot is empty

        const nodes = extractDataIds(component);
        expect(nodes.name.textContent).toEqual('Elizabeth Shaw');
        expect(nodes.value.textContent).toEqual('Foo');
    });

    it('html tags', () => {
        const component = createAndInsertActComponent(testHtmlTags);

        const htmlTags = component.shadowRoot.querySelector('html-tags');

        expect(htmlTags.childNodes.length).toEqual(4);
        const span = htmlTags.childNodes[0];
        const div = htmlTags.childNodes[1];
        const img = htmlTags.childNodes[2];
        const text = htmlTags.childNodes[3];

        expect(span.tagName.toLowerCase()).toEqual('span');
        expect(span.style.color).toEqual('blue');
        expect(span.className).toEqual('class1');

        expect(div.getAttribute('title')).toEqual('test');
        expect(div.children.length).toEqual(1);
        expect(div.children[0].tagName.toLowerCase()).toEqual('h1');
        expect(img.src).toEqual(
            'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
        );
        expect(img.alt).toEqual('Smiley face');
        expect(img.getAttribute('height')).toEqual('42');
        expect(text.textContent).toEqual('</img>');
    });

    it('multiple children in slot', () => {
        const component = createAndInsertActComponent(testMultipleChildrenInSlot);

        expect(component.shadowRoot.querySelectorAll('ui-something').length).toEqual(2);
        expect(
            component.shadowRoot
                .querySelectorAll('ui-something')[0]
                .shadowRoot.querySelector('[data-id="text"]').textContent
        ).toEqual('Hello 1');
        expect(
            component.shadowRoot
                .querySelectorAll('ui-something')[1]
                .shadowRoot.querySelector('[data-id="text"]').textContent
        ).toEqual('Hello 2');
    });

    it('multiple slots', () => {
        const component = createAndInsertActComponent(testMultipleSlots);

        const forceFoo = component.shadowRoot.querySelector('force-foo');
        const defaultSlot = forceFoo.shadowRoot.querySelector('slot');
        const firstSlot = forceFoo.shadowRoot.querySelector('slot[name="first"]');
        const secondSlot = forceFoo.shadowRoot.querySelector('slot[name="second"]');
        expect(defaultSlot.assignedNodes().length).toEqual(0);
        expect(firstSlot.assignedNodes().length).toEqual(1);
        expect(secondSlot.assignedNodes().length).toEqual(1);

        const nodes1 = extractDataIds(firstSlot.assignedNodes()[0]);
        expect(nodes1.text.textContent).toEqual('Hello');
        const nodes2 = extractDataIds(secondSlot.assignedNodes()[0]);
        expect(nodes2.value.textContent).toEqual('Foo');
    });

    it('nested HTML tags', () => {
        const component = createAndInsertActComponent(testNestedHtmlTags);

        const nestedHtmlTags = component.shadowRoot.querySelector('nested-html-tags');

        expect(nestedHtmlTags.children.length).toEqual(1);
        expect(nestedHtmlTags.children[0].tagName.toLowerCase()).toEqual('div');
        expect(nestedHtmlTags.children[0].children.length).toEqual(1);
        expect(nestedHtmlTags.children[0].children[0].tagName.toLowerCase()).toEqual('div');
        expect(nestedHtmlTags.children[0].children[0].className).toEqual('inner');
        expect(nestedHtmlTags.children[0].children[0].children.length).toEqual(2);
        expect(nestedHtmlTags.children[0].children[0].children[0].tagName.toLowerCase()).toEqual(
            'div'
        );
        expect(nestedHtmlTags.children[0].children[0].children[1].tagName.toLowerCase()).toEqual(
            'h2'
        );
    });

    it('property reference and events', () => {
        let callCount = 0;
        const component = createAndInsertActComponent(testPropertyReference, {
            props: {
                non: {
                    value: 'foobar',
                },
                state: {
                    recordAvatars: 'foobaz',
                },
                data: {
                    label: 'bazquux',
                    record: 'quuxbar',
                },
            },
            propsToTrack: ['non'],
            methods: {
                handleToggleSectionCollapsed() {
                    callCount++;
                    this.non.value = 'foobar' + callCount;
                },
            },
        });

        const nodes = extractDataIds(component);

        expect(nodes.notWhitelisted.textContent).toEqual('foobar');
        expect(nodes.templateExpression.textContent).toEqual('foobaz');
        expect(nodes.label.textContent).toEqual('bazquux');
        expect(nodes.value.textContent).toEqual('quuxbar');

        expect(callCount).toEqual(0);

        const outputPercent = component.shadowRoot.querySelector('ui-outputpercent');
        outputPercent.fireToggleSectionCollapsedEvent();
        return Promise.resolve()
            .then(() => {
                expect(callCount).toEqual(1);
                expect(nodes.notWhitelisted.textContent).toEqual('foobar1');
                outputPercent.fireToggleSectionCollapsedEvent();
            })
            .then(() => {
                expect(callCount).toEqual(2);
                expect(nodes.notWhitelisted.textContent).toEqual('foobar2');
            });
    });

    it('slot adjacent to named slot', () => {
        const component = createAndInsertActComponent(testSlotAdjacentToNamedSlot);

        const forceFoo = component.shadowRoot.querySelector('force-foo');
        const defaultSlot = forceFoo.shadowRoot.querySelector('slot');
        const adjacentSlot = forceFoo.shadowRoot.querySelector('slot[name="adjacent"]');
        expect(defaultSlot.assignedNodes().length).toEqual(2);
        expect(adjacentSlot.assignedNodes().length).toEqual(1);
        expect(defaultSlot.assignedNodes()[0].tagName.toLowerCase()).toEqual('ui-another');
        expect(defaultSlot.assignedNodes()[1].tagName.toLowerCase()).toEqual('slot');
        expect(defaultSlot.assignedNodes()[1].assignedNodes().length).toEqual(0);
        expect(adjacentSlot.assignedNodes()[0].tagName.toLowerCase()).toEqual('ui-another');
        expect(extractDataIds(defaultSlot.assignedNodes()[0]).value.textContent).toEqual('Foo');
        expect(extractDataIds(adjacentSlot.assignedNodes()[0]).value.textContent).toEqual('Foo');
    });

    it('slot element creation with duplicate slot names', () => {
        const component = createAndInsertActComponent(
            testSlotElementCreationWithDuplicateSlotNames
        );
        const forceFoo = component.shadowRoot.querySelector('force-foo');
        const defaultSlot = forceFoo.shadowRoot.querySelector('slot');
        expect(defaultSlot.assignedNodes().length).toEqual(2);
        expect(defaultSlot.assignedNodes()[0].name).toEqual('first');
        expect(defaultSlot.assignedNodes()[1].name).toEqual('first');
        expect(defaultSlot.assignedNodes()[0].children.length).toEqual(1);
        expect(defaultSlot.assignedNodes()[1].children.length).toEqual(1);
        expect(defaultSlot.assignedNodes()[0].children[0].tagName.toLowerCase()).toEqual(
            'ui-something'
        );
        expect(defaultSlot.assignedNodes()[1].children[0].tagName.toLowerCase()).toEqual(
            'ui-something-else'
        );
    });

    it('slot in grandchild', () => {
        const component = createAndInsertActComponent(testSlotInGrandchild);
        const forceFoo = component.shadowRoot.querySelector('force-foo');
        const firstSlot = forceFoo.shadowRoot.querySelector('slot[name="first"]');
        expect(firstSlot.assignedNodes().length).toEqual(1);
        expect(firstSlot.assignedNodes()[0].tagName.toLowerCase()).toEqual('ui-something');
    });

    it('style attribute', () => {
        const component = createAndInsertActComponent(testStyleAttr);
        const uiSomething = component.shadowRoot.querySelector('ui-something');
        expect(uiSomething.style.color).toEqual('blue');
        expect(uiSomething.style.textAlign).toEqual('center');
    });
});
