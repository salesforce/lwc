import { LightningElement } from 'lwc';

const exportee = 'foo';

export default class ExportDefaultClassWithOtherExports extends LightningElement {}

export { exportee };
