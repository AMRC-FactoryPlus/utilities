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
}
