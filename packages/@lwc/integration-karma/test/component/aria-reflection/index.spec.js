import { createElement } from 'lwc'
import { ariaPropertiesMapping, extractDataIds } from 'test-utils'
import NoPropDeclared from 'x/noPropDeclared'
import PropDeclared from 'x/propDeclared'
import ApiPropDeclared from 'x/apiPropDeclared'

fdescribe('aria reflection', () => {

  const scenarios = [
    {
      name: 'No prop declared',
      tagName: 'x-no-prop-declared',
      Ctor: NoPropDeclared,
      expectAttrReflection: true
    },
    {
      name: 'Prop declared',
      tagName: 'x-prop-declared',
      Ctor: PropDeclared,
      // declaring a prop in the component results in no attribute reflection
      expectAttrReflection: false
    },
    {
      name: '@api prop declared',
      tagName: 'x-api-prop-declared',
      Ctor: ApiPropDeclared,
      // declaring a prop in the component results in no attribute reflection
      expectAttrReflection: false
    }
  ]

  scenarios.forEach(({ name, tagName, Ctor, expectAttrReflection }) => {

    describe(name, () => {

      Object.entries(ariaPropertiesMapping).forEach(([ propName, attrName ]) => {

        function validateAria(elm, expected) {
          const dataIds = extractDataIds(elm)

          // rendering the prop works
          expect(dataIds[propName].textContent).toBe(expected === null ? '' : expected)

          // the property is correct
          expect(elm[propName]).toBe(expected)
          expect(elm.getPropInternal(propName)).toBe(expected)

          // the attr is reflected (if we expect that to work)
          expect(elm.getAttribute(attrName)).toBe(expectAttrReflection ? expected : null)
          expect(elm.getAttrInternal(attrName)).toBe(expectAttrReflection ? expected : null)
        }

        describe(propName, () => {
          it('no initial value', async () => {
            const elm = createElement(tagName, {is: Ctor})

            document.body.appendChild(elm)

            await Promise.resolve()
            validateAria(elm, null)
            expect(elm.renderCount).toBe(1)
          })

          it('set externally', async () => {
            const elm = createElement(tagName, {is: Ctor})

            elm[propName] = 'foo'

            document.body.appendChild(elm)

            await Promise.resolve()
            validateAria(elm, 'foo')
            expect(elm.renderCount).toBe(1)

            elm[propName] = 'bar'

            await Promise.resolve()
            validateAria(elm, 'bar')
            expect(elm.renderCount).toBe(2)
          })

          it('set internally', async () => {
            const elm = createElement(tagName, {is: Ctor})

            elm.setPropInternal(propName, 'foo')

            document.body.appendChild(elm)

            await Promise.resolve()
            validateAria(elm, 'foo')
            expect(elm.renderCount).toBe(1)

            elm.setPropInternal(propName, 'bar')

            await Promise.resolve()
            validateAria(elm, 'bar')
            expect(elm.renderCount).toBe(2)
          })
        })
      })
    })
  })
})
