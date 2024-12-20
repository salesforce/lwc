/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DecoratorErrors } from '@lwc/errors';
import { generateError } from '../errors';
import { isApiDecorator } from './api';
import { isTrackDecorator } from './track';
import { isWireDecorator } from './wire';
import type { Decorator as EsDecorator } from 'estree';

export function validateUniqueDecorator(decorators: EsDecorator[]) {
    if (decorators.length < 2) {
        return;
    }

    const hasWire = decorators.some(isWireDecorator);
    const hasApi = decorators.some(isApiDecorator);
    const hasTrack = decorators.some(isTrackDecorator);

    if (hasWire) {
        if (hasApi) {
            throw generateError(DecoratorErrors.CONFLICT_WITH_ANOTHER_DECORATOR, 'api');
        }

        if (hasTrack) {
            throw generateError(DecoratorErrors.CONFLICT_WITH_ANOTHER_DECORATOR, 'track');
        }
    }

    if (hasApi && hasTrack) {
        throw generateError(DecoratorErrors.API_AND_TRACK_DECORATOR_CONFLICT);
    }
}
