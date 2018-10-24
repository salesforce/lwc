export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "#foo" + shadowSelector + " {}\n";
    return content;
}
