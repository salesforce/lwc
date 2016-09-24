import ADS from "aura:ads";
import { attribute } from "aura";

class adsBaz {
    @attribute({ isRequired: true }) foo;
    @attribute() bar;

    // this method has generated code
    render({h}) {
        return h('div', {}, ['foo = ', this.foo, ' and bar = ', this.bar]);
    }
}

export default ADS(adsBaz, ADS.QL`
  fragment on User {
    profilePhoto(size: $baz, f: $foo) {
      uri,
    },
  }`
);

// Usage:
// <adsBaz foo="something">
//     <p>do something</p>
// </adsBaz>
