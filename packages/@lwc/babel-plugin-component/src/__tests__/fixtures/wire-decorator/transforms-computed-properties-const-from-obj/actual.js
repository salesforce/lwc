import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
import * as importee from 'some/importee'

const obj = { baz: 'baz', quux: 'quux' }

const { foo } = importee;
const bar = importee.bar;
const { baz } = obj
const quux = obj.quux

// TODO [#3956]: Investigate whether we really want to support this
export default class Test extends LightningElement {
  @wire(getFoo, {
    [foo]: '$foo',
    [bar]: '$bar',
    [baz]: '$baz',
    [quux]: '$quux'
  })
  wiredIdentifier;
}
