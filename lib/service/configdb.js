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

    async search (app, query, results) {
        const qs = Object.fromEntries([ 
            ...Object.entries(query)
                .map(([k, v]) => [k, JSON.stringify(v)]),
            ...Object.entries(results ?? {})
                .map(([k, v]) => [`@${k}`, v]),
        ]);
        const res = await this.fplus.fetch({
            service:    Service.ConfigDB,
            url:        `/v1/app/${app}/search`,
            query:      qs,
        });
        if (!res.ok) {
            this.debug.log("configdb", `Search failed: ${res.status}`);
            return;
        }
        return await res.json();
    }
}
