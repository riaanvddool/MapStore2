/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {Observable} = require('rxjs');
const axios = require('../libs/ajax');
const urlUtil = require('url');
const {interceptOGCError} = require('../utils/ObservableUtils');
const toDescribeLayerURL = ({name, search = {}, url} = {}) => {
    const parsed = urlUtil.parse(search.url || url, true);
    return urlUtil.format(
        {
        ...parsed,
        search: undefined, // this allows to merge parameters correctly
        query: {
            ...parsed.query,

            service: "WMS",
            version: "1.1.1",
            layers: name,
            outputFormat: 'application/json',
            request: "DescribeLayer"
        }
    });
};
const describeLayer = l => Observable.defer( () => axios.get(toDescribeLayerURL(l))).let(interceptOGCError);
module.exports = {
    describeLayer,
    addSearch: l =>
        describeLayer(l)
        .map( ({data = {}}) => data && data.layerDescriptions[0])
        .map(({owsURL} = {}) => ({
            ...l,
            search: owsURL ? {
                type: "wfs",
                url: owsURL // TODO maybe we should we clean URL from authkey params
            } : undefined
        }))
};
