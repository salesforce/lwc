import UI from "./ui.js";
import ADS from "raptor:ads";

export default ADS(UI, ADS.QL`
  fragment on User {
    getSomeData(size: $bar, f: $foo) {
      produce: {x, y} that are the props for baz class
    },
  }`
);

// Usage:
// <prototype-baz foo="something">
//     <p>do something</p>
// </prototype-baz>
