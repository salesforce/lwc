import { createElement } from 'lwc'
import Component from 'x/component'

fit('should render styles with expected formatting', async () => {
  const elm = createElement('x-component', { is: Component })
  document.body.appendChild(elm)

  await Promise.resolve()

  const div = elm.shadowRoot.querySelector('div')
  expect(div.style.color).toBe('yellow')
})
