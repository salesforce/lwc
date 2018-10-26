import styleSheet0 from "foo";
import styleSheet1 from "./foo.css";

export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += styleSheet0(hostSelector, shadowSelector, realShadow);
  content += styleSheet1(hostSelector, shadowSelector, realShadow);
}
