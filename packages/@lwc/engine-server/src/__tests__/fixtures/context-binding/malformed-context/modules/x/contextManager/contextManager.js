// This is a malformed context signal that does not implement the connectContext or disconnectContext methods
class MockMalformedContextSignal {
    constructor() {
        trustedContext.add(this);
    }
}

export const defineMalformedContext = () => {
    return () => new MockMalformedContextSignal();
};
