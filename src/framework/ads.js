// @flow

export default function ADS(Ctor: Object, annotations: Object): Class {
    const newCtor = class ADS {

        constructor() {
            this.data = null;
            this.isDataReady = false;
            // TODO: kicks in the fetching process
        }

        render({v,t}: Object): Object {
            if (this.isDataReady) {
                return v(this.Ctor, this.computeNewAttributes(), this.body);
            } else {
                return t('still loading...');
            }
        }

    }
    // TODO: inspect public api of Ctor and replicate it in newCtor
    //       important: if no public api is found, we might need to
    //       create a dummy instance for the first time, to kick in
    //       the decorators, then we can inspect the public api, and
    //       this process "might" be memoizable.
    return newCtor;
}
