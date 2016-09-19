import { ADS } from "aura";
import { attribute } from "aura";

class adsBaz {
    @attribute({ required: true }) foo = [];
    bar = {};
    @attribute() baz = "3453";
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

// Usage:
// <adsBaz foo="something">
//     <p>do something</p>
// </adsBaz>
