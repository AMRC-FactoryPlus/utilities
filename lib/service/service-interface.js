/*
 * Factory+ NodeJS Utilities
 * Service interface base class.
 * Copyright 2022 AMRC.
 */

import content_type from "content-type";
import Optional from "optional-js";

import { Service } from "../uuids.js";

const Names = Object.fromEntries(
    Object.entries(Service)
        .filter(([k, v]) => k != "Registry")
        .map(([n, u]) => [u, n]));

export class ServiceError extends Error {
    constructor (service, message, status) {
        super(message);
        this.service = service;
        this.status = status;
    }

    toString () {
        const srv = Names[this.service] ?? this.service;
        const st = this.status == undefined ? "" : `: ${this.status}`;
        return `${srv}: ${this.message}${st}`;
    }
}

export class ServiceInterface {
    constructor (fplus) {
        this.fplus = fplus;
        this.debug = fplus.debug;
    }

    throw (message, status) {
        throw new ServiceError(this.service, message, status);
    }

    async fetch (opts) {
        if (typeof opts == "string")
            opts = { url: opts };

        const body = "body" in opts ? JSON.stringify(opts.body) : undefined;

        const headers = { ...opts.headers };
        headers["Accept"] = opts.accept ?? "application/json";
        if (body)
            headers["Content-Type"] = opts.content_type ?? "application/json";

        opts = {
            ...opts,
            service:    this.service,
            headers,
            body,
        };
        const res = await this.fplus.fetch(opts);
        const json = Optional
            .ofNullable(res.headers.get("Content-Type"))
            .map(content_type.parse)
            .filter(ct => ct.type == "application/json")
            .map(_ => res.json())
            .orElse(undefined);

        return [res.status, await json];
    }

    async ping () {
        const [st, ping] = await this.fetch("/ping");
        if (st != 200) return;
        return ping;
    }
}
