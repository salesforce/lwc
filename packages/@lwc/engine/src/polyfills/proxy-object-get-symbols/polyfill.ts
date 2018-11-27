import { ViewModelReflection } from '../../framework/utils';
import { ShadowRootKey, HostKey } from '../../faux-shadow/shadow-root';
import { getOwnPropertySymbols, create, getOwnPropertyNames, isUndefined } from '../../shared/language';

const privateSymbols = create(null);
privateSymbols[ViewModelReflection] = true;
privateSymbols[ShadowRootKey] = true;
privateSymbols[HostKey] = true;
function ObjectGetOwnPropertySymbolsProxy(o: any): symbol[] {
    return getOwnPropertySymbols(o).filter(item => isUndefined(privateSymbols[item]));
}

export default function apply() {
    Object.getOwnPropertySymbols = ObjectGetOwnPropertySymbolsProxy;
    Reflect.ownKeys = (target) => (getOwnPropertyNames(target) as any[]).concat(ObjectGetOwnPropertySymbolsProxy(target));
}
