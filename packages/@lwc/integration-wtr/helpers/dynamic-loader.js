// Helpers for testing lwc:dynamic
const register = new Map();
/**
 * Called by compiled components to, well, load another component. The path to this file is
 * specified by the `experimentalDynamicComponent.loader` rollup plugin option.
 */
export const load = async (id) => await Promise.resolve(register.get(id));
export const registerForLoad = (name, Ctor) => register.set(name, Ctor);
export const clearRegister = () => register.clear();
