import { LightningElement } from 'lwc';

// A "shape-shifter" component that accepts any prop. It declares no @api
// fields because the set of props it receives is not known at authoring time
// (for example, in a generic wrapper that proxies many different authored
// components behind a single registered element).
export default class ShapeShifter extends LightningElement {
    static dynamicProps = true;
}
