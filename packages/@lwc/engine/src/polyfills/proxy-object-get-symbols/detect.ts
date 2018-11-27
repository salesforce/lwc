import { hasNativeSymbolsSupport } from '../../shared/fields';
export default function detect(): boolean {
    return hasNativeSymbolsSupport;
}
