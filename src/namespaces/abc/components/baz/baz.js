import ADS from "raptor:ads";

class adsBaz {
    @prop foo;
    @prop bar;
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
