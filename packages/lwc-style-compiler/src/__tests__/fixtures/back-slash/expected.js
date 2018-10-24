export default function(hostSelector, shadowSelector) {
    let content = "";
    content += ".foo" + shadowSelector + " { content: \"\\\\\"; }\n";
    return content;
}
