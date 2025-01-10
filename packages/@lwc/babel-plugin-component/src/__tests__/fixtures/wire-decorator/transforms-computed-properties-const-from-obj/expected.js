import { registerDecorators as _registerDecorators, LightningElement, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
import { getFoo } from "data-service";
import * as importee from 'some/importee';
const obj = {
  baz: 'baz',
  quux: 'quux'
};
const {
  foo
} = importee;
const bar = importee.bar;
const {
  baz
} = obj;
const quux = obj.quux;

// TODO [#3956]: Investigate whether we really want to support this
class Test extends LightningElement {
  wiredIdentifier;
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  wire: {
    wiredIdentifier: {
      adapter: getFoo,
      dynamic: [foo, bar, baz, quux],
      computed: [foo, bar, baz, quux].map(key => typeof key === "symbol" ? key : String(key)),
      config: function ($cmp, $computed) {
        return {
          [$computed[0]]: $cmp.foo,
          [$computed[1]]: $cmp.bar,
          [$computed[2]]: $cmp.baz,
          [$computed[3]]: $cmp.quux
        };
      }
    }
  }
});
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;