// Note: this is implemented as a .js + .d.ts, rather than just .js or .ts,
// so we can use it in both JS scripts without compiling and in TS test files

export default function virtual(code, name = '__virtual__') {
    return {
        resolveId(id) {
            // Don't turn the virtual module into a real file path
            if (id === name) return id;
        },
        load(id) {
            if (id === name) return code;
        },
    };
}
