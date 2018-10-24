export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "[hidden]" + shadowSelector + " {}\n[lang=\"fr\"]" + shadowSelector + " {}\n";
    return content;
}
