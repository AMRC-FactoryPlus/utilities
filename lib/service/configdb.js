/*
 * Factory+ NodeJS Utilities
 * ConfigDB service interface.
 * Copyright 2022 AMRC.
 */

import { Service, Null as Null_UUID } from "../uuids.js";

import ServiceInterface from "./service-interface.js";

export default class ConfigDB extends ServiceInterface {
    constructor (fplus) {
        super(fplus);
        this.service = Service.ConfigDB;
    }
    
    async get_config (app, obj) {
        const res = await this.fplus.fetch({
            service:    Service.ConfigDB,
            url:        `/v1/app/${app}/object/${obj}`,
        });
        if (!res.ok) {
            this.debug.log("configdb", `Can't get ${app} for ${obj}: ${res.status}`);
            return;
        }
        return await res.json();
    }

    async search (...args) {
        const opts = args.length == 3
            ? { app: args[0], query: args[1], results: args[2] }
            : args[0];

        const klass = opts.klass ? `/class/${opts.klass}` : "";
        const qs = Object.fromEntries([ 
            ...Object.entries(opts.query)
                .map(([k, v]) => [k, JSON.stringify(v)]),
            ...Object.entries(opts.results ?? {})
                .map(([k, v]) => [`@${k}`, v]),
        ]);

        const res = await this.fplus.fetch({
            service:    Service.ConfigDB,
            url:        `/v1/app/${opts.app}${klass}/search`,
            query:      qs,
        });
        if (!res.ok) {
            this.debug.log("configdb", `Search failed: ${res.status}`);
            return;
        }
        return await res.json();
    }

    async resolve (opts) {
        if ("results" in opts)
            throw "ConfigDB.resolve doesn't return results";

        const uuids = await this.search(opts);

        if (!Array.isArray(uuids))
            throw "ConfigDB search didn't return an array";
        if (uuids.length > 1)
            throw format("More than one result resolving %s with %o",
                opts.app, opts.query);

        return uuids[0];
    }
}
