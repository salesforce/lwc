import ADS from "raptor:ads";

class adsBaz {
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
