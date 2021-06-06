"use strict";
import db from '../models'
const ThingMappingConfigDb = db.thing_mapping_config

class ThingsMappingRepo {

    static async find(conditions) {
        return ThingMappingConfigDb.findOne({
            where: conditions
        });
    }

    static async findThingMappingConfig(obj) {
        // console.log("<---------obj------->", obj);
        const project = await ThingMappingConfigDb.findOne({
            where: {
                target_function: obj.target_function,
                identifier: obj.identifier,
                command: obj.command
            }
        });
        // console.log("<---------project------->", project);
        return project;

    }

    static async findThingMappingConfig(obj) {
        // console.log("<---------obj------->", obj);
        const project = await ThingMappingConfigDb.findOne({
            where: {
                target_function: obj.target_function,
                identifier: obj.identifier,
                command: obj.command
            }
        });
        // console.log("<---------project------->", project);
        return project;

    }

    static async findThingMappingConfingOrdered(obj) {
        // console.log("<---------obj------->", obj);
        const project = await ThingMappingConfigDb.findAll({
            where: {
                target_function: obj.target_function,
                identifier: obj.identifier,
                command: obj.command
            },
            order: [
                ['order', 'ASC']
            ]
        });
        // console.log("<---------project------->", project);
        return project;

    }

    static create(req) {
        return ThingMappingConfigDb.create({
            identifier: req.body.identifier,
            target_function: req.body.target_function,
            name_space: req.body.name_space,
            executing_command: req.body.executing_command,
            command: req.body.command,
            argument_type: req.body.argument_type,
            return_type: req.body.return_type,
            read_or_write: req.body.read_or_write,
            order: req.body.order
        });
    }
}

export default ThingsMappingRepo
