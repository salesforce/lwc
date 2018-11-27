import { ViewModelReflection } from '../../framework/utils';
import { ShadowRootKey, HostKey } from '../../faux-shadow/shadow-root';

const { getOwnPropertySymbols, getOwnPropertyNames } = Object;
const privateSymbols = [ ViewModelReflection, ShadowRootKey, HostKey ];
function ObjectGetOwnPropertySymbolsProxy(o: any): symbol[] {
    return getOwnPropertySymbols(o).filter(item => privateSymbols.indexOf(item) === -1);
}

export default function apply() {
    Object.getOwnPropertySymbols = ObjectGetOwnPropertySymbolsProxy;
    Reflect.ownKeys = (target) => (getOwnPropertyNames(target) as any[]).concat(ObjectGetOwnPropertySymbolsProxy(target));
}
