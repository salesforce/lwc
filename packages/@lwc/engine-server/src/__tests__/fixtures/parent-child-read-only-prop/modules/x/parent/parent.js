import { LightningElement } from "lwc";

export default class extends LightningElement {
  array = [1, 2, 3]
  object = { foo: 'bar '}
  deep = { foo: [{ bar: 'baz' }]}
}
