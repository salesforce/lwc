export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "#foo.active" + shadowSelector + " {}\n";
    return content;
}
