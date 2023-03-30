/*
 * Factory+ NodeJS Helpers
 * GSSAPI MQTT connection.
 * Copyright 2022 AMRC
 */

import timers from "timers/promises";

import { GSS, MQTT } from "../deps.js";
import { Service } from "../uuids.js";

import ServiceInterface from "./service-interface.js";

async function gss_init (host) {
    const ctx = GSS.createClientContext({
        server: `mqtt@${host}`,
    });
    const buf = await GSS.initSecContext(ctx);

    return [ctx, buf];
}

function get_verb_from (opts) {
    return opts.verbose ? console.log 
        : opts.log ?? (m => {});
}

/* Although MQTT.js supports MQTT5 extended auth, the support has not
 * really been thought through. The initial auth-data must be supplied
 * before a connection attempt is made, meaning we must build an AP-REQ
 * before we even know if the MQTT server is online. Then, we can't use
 * the auto-reconnect functionality, as this gives no opportunity to
 * create a new AP-REQ, as that might perform network activity and must
 * be awaited. So that has to be reimplemented manually based on
 * watching for the 'close' event. If we wanted to support a GSSAPI
 * exchange that took more than one step (e.g. SPNEGO) this would be
 * even more convoluted. */

/* Don't use .on("connect") on the object returned from here; we need
 * that event to complete the GSS auth. Use .on("authenticated") instead,
 * which doesn't fire until after we have finished authenticating the
 * server properly. */

/* This export is deprecated. Go via ServiceClient instead, as this
 * will allow fallback to username/password if this is all we have. */
export async function gss_mqtt (url, opts) {
    opts ??= {};
    const host = new URL(url).hostname;
    const reconnect = opts.reconnectPeriod ?? 3000;
    const verb = get_verb_from(opts);

    /* Has the connection deliberately been closed? */
    let ending = false;

    /* These are renewed every time we reconnect as Kerberos won't let
     * us replay AP-REQ packets. */
    let [ctx, buf] = await gss_init(host);

    const mqtt = MQTT.connect(url, {
        ...opts,
        protocolVersion: 5,
        reconnectPeriod: 0,
        properties: {
            ...opts.properties,
            authenticationMethod: "GSSAPI",
            authenticationData: buf,
        },
    });
    mqtt.on("connect", ack => {
        //verb("Got CONNACK: %o", ack);
        const srv_buf = ack.properties.authenticationData;
        GSS.initSecContext(ctx, srv_buf).then(next => {
            if (next.length)
                throw "GSS auth took more than one step";
            /* XXX I'm not sure this will properly abort if mutual auth
             * fails. We may need to be more drastic. */
            if (!ctx.isComplete())
                throw "MQTT server failed to authenticate itself!";
            verb("MQTT connected");
            mqtt.emit("gssconnect", ack);
            mqtt.emit("authenticated", ack);
        });
    });
    mqtt.on("close", () => {
        verb("MQTT connection closed");
        if (ending) return;
        timers.setTimeout(reconnect)
            .then(() => gss_init(host))
            .then(newgss => {
                [ctx, buf] = newgss;
                mqtt.options.properties.authenticationData = buf;
                verb("MQTT reconnecting...");
                mqtt.reconnect();
            });
    });
    mqtt.on("end", () => {
        verb("MQTT end");
        ending = true;
    });

    return mqtt;
}

async function basic_mqtt(url, opts) {
    const verb = get_verb_from(opts);

    verb(`Basic auth with ${opts.username}`);
    const mqtt = MQTT.connect(url,{
        ...opts
    });
    mqtt.on("connect", ack => {
        verb("MQTT connected");
        mqtt.emit("authenticated", ack);
    });
    mqtt.on("close", () => {
        verb("MQTT connection closed");
    });
    return mqtt;
}

export default class MQTTInterface extends ServiceInterface {
    async mqtt_client(opts) {
        opts ??= {};

        this.debug.log("mqtt", "Looking up MQTT broker URL");
        /* XXX Call service_urls instead and find one that works. */
        let url = opts.host;
        url ??= await this.fplus.service_url(Service.MQTT);

        if (url == null)
            return null;

        this.debug.log("mqtt", `Connecting to broker ${url}`);

        const { username, password } = this.fplus.opts;
        const mqopts = {
            ...opts,
            username, password,
            log: (...a) => this.debug.log("mqtt", ...a),
        };
        return username && password
            ? await basic_mqtt(url, mqopts)
            : await gss_mqtt(url, mqopts);
    }
}
