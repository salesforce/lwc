import { LightningElement } from 'lwc';

const foo = 'foo';

class ExportAsDefaultWithOtherExports extends LightningElement {}

export { ExportAsDefaultWithOtherExports as default, foo };
