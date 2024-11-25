import { LightningElement, api } from "lwc";

export default class extends LightningElement {
  @api array
  @api object
  @api deep

  result

  connectedCallback() {
    const results = []
    
    try {
      this.array.push('bar')
    } catch (err) {
      results.push('array: error hit during mutation')
    }

    try {
      this.object.foo = 'baz'
    } catch (err) {
      results.push('object: error hit during mutation')
    }
    
    try {
      this.deep.foo[0].quux = 'quux'
    } catch (err) {
      results.push('deep: error hit during mutation')
    }

    try {
      delete this.object.foo
    } catch (err) {
      results.push('object: error hit during deletion')
    }

    this.result = '\n' + results.join('\n')
  }
}
