export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "h1" + shadowSelector + ", h2" + shadowSelector + " {}\n\nh1" + shadowSelector + ",\nh2" + shadowSelector + "\n{}\n";
    return content;
}
