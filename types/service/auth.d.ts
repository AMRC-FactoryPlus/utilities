import {ServiceClient, ServiceInterface} from "../service-client";

export type aclFunc = (permission: string, target: string, wild?: boolean) => boolean;

export interface kerberosObj {
    kerberos?: string;
    uuid?: string;
}

/**
 * Authentication Service for fetching ACLs from the Auth service.
 */
export default class Auth extends ServiceInterface {
    constructor(fplus: ServiceClient);

    root_principal: string;
    permission_group: string;

    /**
     * Checks if the given principal has the given permission on the given target
     * @param principal Kerberos principal
     * @param permission permission group to be verified
     * @param target target to be accessed
     * @param wild Boolean to allow null UUID in the target to be treated as a wildcard
     */
    check_acl(principal: string | kerberosObj, permission: string, target: string, wild?: boolean): Promise<boolean>;

    /**
     *
     * @param principal Kerberos principal
     * @param group permission group to be verified
     */
    fetch_acl(principal: string, group: string): Promise<aclFunc>;

    /**
     * Locate a principal and return its UUID. Returns null if not found.
     * @param query Object containing a principal name
     */
    resolve_principal(query: { kerberos: string }): Promise<string | null>;
}

