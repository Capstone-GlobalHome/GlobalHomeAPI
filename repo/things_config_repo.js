"use strict";
import db from '../models'
const ThingsConfigDb = db.things_config

class ThingsConfigRepo {

    static create(req) {
        return ThingsConfigDb.create({
            index: req.body.index,
            thing_id: req.body.thing_id,
            identifier: req.body.identifier,
            serverUrl: req.body.serverUrl,
            command_protocal: req.body.command_protocal
        });
    }

    static find(conditions) {
        return ThingsConfigDb.findOne({
            where: conditions
        });
    }
}

export default ThingsConfigRepo
