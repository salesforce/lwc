export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "h1" + shadowSelector + " {}\n.foo" + shadowSelector + " {}\n[data-foo]" + shadowSelector + " {}\n[data-foo=\"bar\"]" + shadowSelector + " {}\n\n";
    return content;
}
