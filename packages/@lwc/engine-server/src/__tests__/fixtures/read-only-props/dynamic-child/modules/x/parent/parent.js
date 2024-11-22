import { LightningElement } from "lwc";
import Child from 'x/child'

export default class extends LightningElement {
  ctor = Child
  array = [1, 2, 3]
  object = { foo: 'bar '}
  deep = { foo: [{ bar: 'baz' }]}
}
