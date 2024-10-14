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
  /*!/*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  wire: {
    wiredIdentifier: {
      adapter: getFoo,
      dynamic: [foo, bar, baz, quux],
      config: function ($cmp) {
        return {
          [foo]: $cmp.foo,
          [bar]: $cmp.bar,
          [baz]: $cmp.baz,
          [quux]: $cmp.quux
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