import {
    ADS,
} from "aura";

import {
    method,
    attribute,
} from "aura";

class adsBaz {
    @attribute({ required: true })
    foo = [];
    bar = {};
    @attribute()
    baz = "3453";
    @method()
    focus() {
        // do something
    }
}

// desugaring version of the class adsBaz
class adsBazInternal {
    foo = [];
    bar = {};
    baz = "3453";
    static attrsTypes = {
        foo: AuraTypes.Array.required,
        baz: AuraTypes.String,
    }
    static attrsValues = {
        foo: [],
        baz: "3453",
    }
}

export default ADS(adsBaz, {
  fragments: {
    user: () => ADS.QL`
      fragment on User {
        profilePhoto(size: $baz, f: $foo) {
          uri,
        },
      }
    `,
  },
});

<adsBaz foo="something" />
