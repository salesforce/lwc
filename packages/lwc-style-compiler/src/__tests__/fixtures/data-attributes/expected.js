export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "[data-foo]" + shadowSelector + " {}\n[data-foo=\"bar\"]" + shadowSelector + " {}\n";
    return content;
}
