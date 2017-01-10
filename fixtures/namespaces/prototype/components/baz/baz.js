import { HTMLElement } from "raptor";
import ADS from "raptor:ads";

class adsBaz extends HTMLElement {
    // foo = 1;
    // bar = 2;
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
