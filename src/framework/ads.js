// @flow

export default function ADS(Ctor: Object, annotations: Object): Class {
    return class ADS {
        constructor(attrs: Object) {
            this.attrs = attrs;
            this.data = null;
            this.isDataReady = false;
            // kicks in the fetching process
        }
        render({v,t}: Object): Object {
            if (this.isDataReady) {
                return v(this.Ctor, this.computeNewAttributes());
            } else {
                return t('still loading...');
            }
        }
    }
}
