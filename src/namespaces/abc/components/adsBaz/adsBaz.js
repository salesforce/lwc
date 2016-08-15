import {
    ADS,
} from "aura:service";

class adsBaz {
    foo = [];
    bar = {};
    @attribute()
    baz = "3453";
}

const adsBazProxyHandler = {
    get(name) {
        if (name === 'baz') {
            return target[name] || "3453"; // or default value
        }
    }
    set(name, value) {
        if (name === 'baz') {
            assert('value for baz attribute to validate during dev')
            target[name] = value;
        }
    }
}

export default ADS(adsBaz, {
  fragments: {
    user: () => ADS.QL`
      fragment on User {
        profilePhoto(size: $baz) {
          uri,
        },
      }
    `,
  },
});


<adsBaz foo="something" />
