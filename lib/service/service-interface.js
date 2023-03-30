/*
 * Factory+ NodeJS Helpers
 * Service interface base class.
 * Copyright 2022 AMRC.
 */

export default class ServiceInterface {
    constructor (fplus) {
        this.fplus = fplus;
        this.debug = fplus.debug;
    }
}
