export default function(hostSelector, shadowSelector) {
    let content = "";
    content += "input[min]" + shadowSelector + " {}\ninput[min=100]" + shadowSelector + " {}\n";
    return content;
}
