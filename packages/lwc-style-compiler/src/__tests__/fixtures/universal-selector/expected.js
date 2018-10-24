export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "*" + shadowSelector + " {}\n";
    return content;
}
