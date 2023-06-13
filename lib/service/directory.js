/*
 * Factory+ NodeJS Utilities
 * Directory service interface.
 * Copyright 2023 AMRC.
 */

import { Service, Null as Null_UUID } from "../uuids.js";

import ServiceInterface from "./service-interface.js";

export default class Directory extends ServiceInterface {
    constructor (fplus) {
        super(fplus);
        this.service = Service.Directory;
        this.log = this.debug.log.bind(this.debug, "directory");
    }
    
    async get_service_urls (service) {
        const [st, specs] = await this.fetch(`/v1/service/${service}`);
        if (st == 404) {
            this.log("Can't find service %s: %s", service, st);
            return;
        }
        if (st != 200)
            throw `Directory: Can't get service records for ${service}: ${st}`;

        return specs.map(s => s.url).filter(u => u != null);
    }

    async register_service_url (service, url) {
        const [st] = await this.fetch({
            method:     "PUT", 
            url:        `v1/service/${service}/advertisment`,
            body:       { url },
        });
        if (st != 204)
            throw `Directory: Can't register service ${service}: ${st}`;
        this.log("Registered %s for %s", url, service);
    }
}
