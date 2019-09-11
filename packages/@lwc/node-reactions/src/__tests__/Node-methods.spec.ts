/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { reactWhenConnected, reactWhenDisconnected } from '../index';

describe('patches', () => {
    describe('appendChild()', () => {
        it('should be detected as connection', () => {
            const elm = document.createElement('div');
            let connected = false;
            let actualReactionType;
            reactWhenConnected(elm, function(element, reactionType) {
                connected = true;
                actualReactionType = reactionType;
            });
            document.body.appendChild(elm);
            expect(connected).toBe(true);
            expect(actualReactionType).toBe(1);
        });
    });

    describe('insertBefore()', () => {
        it('should be detected as connection', () => {
            const elm = document.createElement('div');
            let connected = false;
            let actualReactionType;
            reactWhenConnected(elm, function(element, reactionType) {
                connected = true;
                actualReactionType = reactionType;
            });
            document.body.insertBefore(elm, null);
            expect(connected).toBe(true);
            expect(actualReactionType).toBe(1);
        });
    });

    describe('replaceChild()', () => {
        it('should be detected as connection', () => {
            const anchor = document.createElement('a');
            const elm = document.createElement('div');
            let connected = false;
            let actualReactionType;
            reactWhenConnected(elm, function(element, reactionType) {
                connected = true;
                actualReactionType = reactionType;
            });
            document.body.appendChild(anchor);
            document.body.replaceChild(elm, anchor);
            expect(connected).toBe(true);
            expect(actualReactionType).toBe(1);
        });
    });

    describe('removeChild()', () => {
        it('should be detected as disconnection', () => {
            const elm = document.createElement('div');
            let disconnected = false;
            let actualReactionType;
            reactWhenDisconnected(elm, function(element, reactionType) {
                disconnected = true;
                actualReactionType = reactionType;
            });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(disconnected).toBe(true);
            expect(actualReactionType).toBe(2);
        });
    });
});
