import {ServiceClient, ServiceInterface} from "../service-client";

/**
 * ConfigDB service interface.
 */
export default class Auth extends ServiceInterface {
    constructor(fplus: ServiceClient);

    get_config (app: string, obj: string): Promise<any>;
    search (app: string, query: object, results: object): Promise<object>;
    search (app: string, query: object): Promise<Array<string>>;
}
