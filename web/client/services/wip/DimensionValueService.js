// @flow
import Promise from 'bluebird';

import APIService, { API_VERSION } from 'services/APIService';
import CachedMapService from 'services/wip/CachedMapService';
import DimensionService from 'services/wip/DimensionService';
import DimensionValue from 'models/core/wip/Dimension/DimensionValue';
import { convertIDToURI, convertURIToID } from 'services/wip/util';
import type { APIVersion, HTTPService } from 'services/APIService';
import type { Cache, RejectFn, ResolveFn } from 'services/wip/CachedMapService';
import type { URI, URIConverter } from 'services/types/api';

class DimensionValueService extends CachedMapService<DimensionValue>
  implements URIConverter {
  apiVersion: APIVersion = API_VERSION.V2;
  endpoint: string;
  _httpService: HTTPService;

  constructor(httpService: HTTPService, includeAllDimensions: boolean) {
    super();
    this.endpoint = includeAllDimensions
      ? 'wip/dimension_values'
      : 'wip/dimension_values/frontend_cache';
    this._httpService = httpService;
  }

  // eslint-disable-next-line class-methods-use-this
  buildCache(
    resolve: ResolveFn<DimensionValue>,
    reject: RejectFn,
  ): Promise<Cache<DimensionValue>> {
    // Performance optimization: preload services needed during deserialization
    // of the value so that we can use UNSAFE_deserialize. Prefer the unsafe
    // method since it does not generate thousands of promises that must be
    // tracked and resolved.
    return Promise.all([
      this._httpService.get(this.apiVersion, this.endpoint),
      DimensionService.getAll(),
    ])
      .then(([rawDimensionValuesList]) => {
        const cache = {};
        rawDimensionValuesList.forEach(rawDimensionValue => {
          const value = DimensionValue.UNSAFE_deserialize(rawDimensionValue);
          cache[value.id()] = value;
        });
        resolve(cache);
      })
      .catch(reject);
  }

  convertURIToID(uri: URI): string {
    return convertURIToID(uri, this.apiVersion, this.endpoint);
  }

  convertIDToURI(id: string): URI {
    return convertIDToURI(id, this.apiVersion, this.endpoint);
  }
}

// HACK (David): In most cases (e.g. AQT) we only wish to retrieve the dimension
// values for dimensions which we would typically cache and search in the
// frontend - excluding dimensions with many 1000s of values. In some cases,
// (e.g. dql) we need to override this.
export const FullDimensionValueService = new DimensionValueService(
  APIService,
  true,
);

export default new DimensionValueService(APIService, false);
