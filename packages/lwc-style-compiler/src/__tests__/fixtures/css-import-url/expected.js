import styleSheet0 from "foo";
import styleSheet1 from "./foo.css";

export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
${styleSheet0(hostSelector, shadowSelector, nativeShadow)}
${styleSheet1(hostSelector, shadowSelector, nativeShadow)}
`
}
