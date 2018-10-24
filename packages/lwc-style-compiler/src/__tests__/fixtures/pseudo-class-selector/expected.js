export default function(hostSelector, shadowSelector) {
    let content = "";
    content += ":checked" + shadowSelector + " {}\nul" + shadowSelector + " li:first-child" + shadowSelector + " a" + shadowSelector + " {}\n";
    return content;
}
