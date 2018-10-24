export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "[aria-labelledby]" + shadowSelector + " {}\n[aria-labelledby=\"bar\"]" + shadowSelector + " {}\n";
    return content;
}
