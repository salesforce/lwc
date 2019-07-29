import reactTo, { initialize_option1, ReactionEventType } from '../index';

describe('patches', () => {
    beforeAll(() => {
        initialize_option1();
    });
    describe('appendChild()', () => {
        it('should be detected as connection', () => {
            const elm = document.createElement('div');
            let connected = false;
            reactTo(elm, ReactionEventType.connected, function() {
                connected = true;
            });
            document.body.appendChild(elm);
            expect(connected).toBe(true);
        });
    });

    describe('insertBefore()', () => {
        it('should be detected as connection', () => {
            const elm = document.createElement('div');
            let connected = false;
            reactTo(elm, ReactionEventType.connected, function() {
                connected = true;
            });
            document.body.insertBefore(elm, null);
            expect(connected).toBe(true);
        });
    });

    describe('replaceChild()', () => {
        it('should be detected as connection', () => {
            const anchor = document.createElement('a');
            const elm = document.createElement('div');
            let connected = false;
            reactTo(elm, ReactionEventType.connected, function() {
                connected = true;
            });
            document.body.appendChild(anchor);
            document.body.replaceChild(elm, anchor);
            expect(connected).toBe(true);
        });
    });

    describe('removeChild()', () => {
        it('should be detected as disconnection', () => {
            const elm = document.createElement('div');
            let disconnected = false;
            reactTo(elm, ReactionEventType.disconnected, function() {
                disconnected = true;
            });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(disconnected).toBe(true);
        });
    });
});
