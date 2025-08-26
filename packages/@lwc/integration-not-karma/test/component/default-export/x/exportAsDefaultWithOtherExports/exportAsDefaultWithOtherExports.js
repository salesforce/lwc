import { LightningElement } from 'lwc';

const exportee = 'foo';

class ExportAsDefaultWithOtherExports extends LightningElement {}

export { ExportAsDefaultWithOtherExports as default, exportee };
