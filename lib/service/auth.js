/*
 * Factory+ NodeJS Utilities
 * Auth service interface.
 * Copyright 2022 AMRC.
 */

import { Service, Null as Null_UUID } from "../uuids.js";

import ServiceInterface from "./service-interface.js";

export default class Auth extends ServiceInterface {
    constructor (fplus) {
        super(fplus);

        this.service = Service.Authentication;
        this.root_principal = fplus.opts.root_principal;
        this.permission_group = fplus.opts.permission_group;
    }
    
    /* Verifies if principal has permission on target. If 'wild' is true
     * then the null UUID in an ACE will match any target. */
    async check_acl (principal, permission, target, wild) {
        const acl = await this.fetch_acl(principal, this.permission_group);
        return acl(permission, target, wild);
    }

    /* Takes a principal and a permission group. Returns a function
     * which checks a particular permission and target against the
     * returned ACL. */
    async fetch_acl (princ_req, group) {
        const [type, principal] =
            typeof(princ_req) == "string"   ? ["kerberos", princ_req]
            : "kerberos" in princ_req       ? ["kerberos", princ_req.kerberos]
            : "uuid" in princ_req           ? ["uuid", princ_req.uuid]
            : [null, null];
        if (type == null) {
            this.debug.log("acl", 
                "Unrecognised principal request: %o", princ_req);
            return () => false;
        }
        const by_uuid = type == "uuid";

        if (this.root_principal 
            && type == "kerberos" 
            && principal == this.root_principal)
            return () => true;

        const res = await this.fplus.fetch({
            service:    Service.Authentication,
            url:        "/authz/acl",
            query:      { principal, permission: group, "by-uuid": by_uuid },
        });
        if (!res.ok) {
            this.debug.log("acl", `Failed to read ACL for ${principal}: ${res.status}`);
            return () => false;
        }
        const acl = await res.json();
        this.debug.log("acl", "Got ACL for %s: %o", principal, acl);

        return (permission, target, wild) => 
            acl.some(ace => 
                ace.permission == permission
                && (ace.target == target
                    || (wild && ace.target == Null_UUID)));
    }

    /* Resolve a principal to a UUID. Query is an object with a single
     * key; currently this must be 'kerberos' to search for principals
     * by Kerberos principal name. */
    async resolve_principal (query) {
        const res = await this.fplus.fetch({
            service:    Service.Authentication,
            url:        "/authz/principal/find",
            query,
        });
        if (!res.ok) {
            this.debug.log("princ", 
                "Failed to resolve %o: %s", query, res.status);
            return null;
        }
        const uuid = await res.json();
        this.debug.log("princ", "Resolved %o to %s", query, uuid);
        return uuid;
    }
}
