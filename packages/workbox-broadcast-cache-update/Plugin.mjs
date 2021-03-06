/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

import {assert} from 'workbox-core/_private/assert.mjs';
import {BroadcastCacheUpdate} from './BroadcastCacheUpdate.mjs';
import './_version.mjs';

/**
 * This plugin will automatically broadcast a message whenever a cached response
 * is updated.
 *
 * @memberof workbox.broadcastUpdate
 */
class Plugin {
    /**
   * Construct a new instance with a specific `channelName` to
   * broadcast messages on
   *
   * @param {string} channelName The name that will be used when creating
   * the `BroadcastChannel`.
   * @param {Object} options
   * @param {Array<string>}
   * [options.headersToCheck=['content-length', 'etag', 'last-modified']] A
   * list of headers that will be used to determine whether the responses
   * differ.
   * @param {string} [options.source='workbox-broadcast-cache-update'] An
   * attribution value that indicates where the update originated.
   */
  constructor(channelName, options) {
    this._broadcastUpdate = new BroadcastCacheUpdate(channelName, options);
  }
  /**
   * A "lifecycle" callback that will be triggered automatically by the
   * `workbox-sw` and `workbox-runtime-caching` handlers when an entry is
   * added to a cache.
   *
   * @private
   * @param {Object} input The input object to this function.
   * @param {string} input.cacheName Name of the cache the responses belong to.
   * @param {Response} [input.oldResponse] The previous cached value, if any.
   * @param {Response} input.newResponse The new value in the cache.
   * @param {string} input.url The cache key URL.
   */
  cacheDidUpdate({cacheName, oldResponse, newResponse, url}) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isType(cacheName, 'string', {
        moduleName: 'workbox-broadcast-cache-update',
        className: 'Plugin',
        funcName: 'constructor',
        paramName: 'cacheName',
      });
      assert.isInstance(newResponse, Response, {
        moduleName: 'workbox-broadcast-cache-update',
        className: 'Plugin',
        funcName: 'constructor',
        paramName: 'newResponse',
      });
    }

    if (!oldResponse) {
      // Without a two responses there is nothing to comapre
      return;
    }

    this._broadcastUpdate
      .notifyIfUpdated(oldResponse, newResponse, cacheName, url);
  }
}

export {Plugin};
