import {Debug} from "./debug";
import Fetch from "./service/fetch";
import Auth from "./service/auth";
import Discovery from "./service/discovery";
import MQTTInterface from "./service/mqtt";


interface ServiceClient extends Auth, Fetch, Discovery, MQTTInterface {

}

export class ServiceClient {
    constructor(config?: ServiceClientConfig);

    /**
     * Debug Object.
     */
    debug: Debug;

    /**
     * Process available interfaces and define them under the properties of ServiceClient.
     * @param args list of Interface classes
     */
    static define_interfaces(...args: (string | typeof ServiceInterface)[][]): void;

    /**
     * Fetches JSON Object from Config DB
     * @param app App uuid
     * @param obj Object uuid
     */
    fetch_configdb(app: string, obj: string): Promise<object>;

    /**
     * Initialisation Function.
     * Has no uses currently.
     */
    init(): Promise<ServiceClient>;

}

/**
 * Based class for Service Interfaces
 */
export class ServiceInterface {
    constructor(fplus: ServiceClient);

    fplus: ServiceClient;
    debug: Debug;
}

/**
 * Interface object to be ingested by Service Client
 */
export interface InterfaceDefinition {
    name: string;
    klass: ServiceInterface;
    methodList: string;
}

export interface ServiceClientConfig {
    /**
     * Username for basic authentication
     */
    username?: string;
    /**
     * Password for basic authentication
     */
    password?: string;
    /**
     * 	Kerberos principal which overrides permission checks.
     */
    root_principal?: string;
    /**
     * Permission group for ACL checks.
     */
    permission_group?: string;
    /**
     * 	URL to the Directory.
     */
    directory_url?: string;

    /**
     * URL to Authentication
     */
    authn_url?: string;
}
