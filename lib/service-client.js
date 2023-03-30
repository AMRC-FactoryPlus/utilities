/*
 * Factory+ NodeJS Helpers
 * Service client library.
 * Copyright 2022 AMRC
 */

import { Debug } from "./debug.js";
import { Service } from "./uuids.js";

import Auth from "./service/auth.js";
import Discovery from "./service/discovery.js";
import Fetch from "./service/fetch.js";
import MQTTInterface from "./service/mqtt.js";

export class ServiceClient {
    constructor (opts) {
        opts ??= {};
        this.opts = opts;

        this.debug = new Debug();
    }

    async init () {
        return this;
    }

    static define_interfaces (...interfaces) {
        for (const [name, klass, methlist] of interfaces) {
            const meths = methlist.split(/\s+/).filter(s => s.length);
            Object.defineProperty(this.prototype, name, {
                configurable: true,
                get () { return this[`_${name}`] ??= new klass(this); },
            });
            for (const meth of meths) {
                Object.defineProperty(this.prototype, meth, {
                    configurable: true,
                    writable: true,
                    value (...args) { return this[name][meth](...args); },
                });
            }
        }
    }

    async fetch_configdb (app, obj) {
        const res = await this.fetch({
            service:    Service.Registry,
            url:        `/v1/app/${app}/object/${obj}`,
        });
        if (!res.ok) {
            this.debug.log("configdb", `Can't get ${app} for ${obj}: ${res.status}`);
            return;
        }
        return await res.json();
    }
}

ServiceClient.define_interfaces(
    ["Auth", Auth, `check_acl fetch_acl resolve_principal`],
    ["Discovery", Discovery,
        `set_service_url set_service_discovery service_url service_urls`],
    ["Fetch", Fetch, `fetch`],
    ["MQTT", MQTTInterface, `mqtt_client`],
);
