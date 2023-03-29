/*
 * Factory+ / AMRC Connectivity Stack (ACS) NodeJS Helpers
 * Service discovery.
 * Copyright 2022 AMRC.
 */

import { Service } from "../uuids.js";

import ServiceInterface from "./service-interface.js";

export default class Discovery extends ServiceInterface {
    constructor (fplus) {
        super(fplus);
        this.urls = new Map();

        const opts = fplus.opts;
        /* XXX back-compat */
        if (opts.authn_url != null)
            this.set_service_url(Service.Authentication, opts.authn_url);

        if (opts.directory_url != null)
            this.set_service_url(Service.Directory, opts.directory_url);
    }

    /* We have a service URL from somewhere... */
    set_service_url (service, url) {
        this.urls.set(service, url);
    }

    /* We know how to find service URLs (hook for the Directory) */
    set_service_discovery (locator) {
        this.find_service_urls = locator;
    }

    async find_service_urls (service) {
        const res = await this.fplus.fetch({
            service:        Service.Directory,
            url:            `/v1/service/${service}`,
        });
        if (!res.ok) {
            this.debug.log("service", "Can't find service %s: %s",
                service, res.status);
            return;
        }
        const specs = await res.json();
        this.debug.log("service", "Found %o for %s via the Directory",
            specs, service);
        return specs.map(s => s.url).filter(u => u != null);
    }

    async service_urls (service) {
        this.debug.log("service", `[${service}] Looking for URL...`);
        if (this.urls.has(service)) {
            const url = this.urls.get(service);
            this.debug.log("service", `[${service}] Found ${url} preconfigured.`);
            return [url];
        }

        const urls = await this.find_service_urls(service);

        if (urls) {
            this.debug.log("service", "[%s] Discovery returned %s",
                service, urls.join(", "));
            return urls;
        } else {
            return [];
        }
    }

    /* XXX This interface is deprecated. Services may have multiple
     * URLs, and we cannot do liveness testing here as we don't know all
     * the protocols. */
    async service_url (service) {
        const urls = await this.service_urls(service);
        return urls?.[0];
    }
}
