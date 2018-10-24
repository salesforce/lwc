export default function(hostSelector, shadowSelector) {
    let content = "";
    content += ":host {}\n" + hostSelector + " {}\n";
    return content;
}
