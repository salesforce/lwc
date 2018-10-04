import { ShadowRoot } from "../../faux-shadow/shadow-root"

export default function apply() {
    (window as any).ShadowRoot = ShadowRoot;
}
