import { LightningElement } from 'lwc';

export default class Component extends LightningElement {
  rows = [
    {
      id: 1,
      foo: {
        bar: {
          baz: 'yolo'
        }
      }
    }
  ]
}
