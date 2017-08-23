const fs = require('fs');
const proxyCompatSource = fs.readFileSync('./packages/proxy-compat/dist/proxy-compat.js');
const proxyCompatMin = fs.readFileSync('./packages/proxy-compat/dist/proxy-compat.min.js')

fs.readdirSync('./dist').forEach((fileName) => {
    if (/compat/.test(fileName)) {
        const contents = fs.readFileSync(`./dist/${fileName}`);
        const isMin = /min/.test(fileName);
        const source = `${isMin ? proxyCompatMin : proxyCompatSource}${contents}`;
        fs.writeFileSync(`./dist/${fileName}`, source);
    }
});
