module.exports = function dedupeImports(path) {
    const body = path.get('body');
    const importStatements = body.filter((s) => s.isImportDeclaration());
    const visited = new Map();
    importStatements.forEach((importPath) => {
        const sourceLiteral = importPath.node.source;
        if (visited.has(sourceLiteral.value)) {
            const visitedImport = visited.get(sourceLiteral.value);
            visitedImport.node.specifiers.push(...importPath.node.specifiers);
            importPath.remove();
        } else {
            visited.set(sourceLiteral.value, importPath);
        }
    });
};
