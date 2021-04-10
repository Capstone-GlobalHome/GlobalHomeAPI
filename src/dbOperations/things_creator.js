import db from '../models';
const ThingDbOps = db.thing;
const ThingsConfig = db.things_config;

export const thingsObj = {
    "name": null,
    "identifier": null,
    "image": null,
    "isParent": null,
    "status": null,
    "fk_room_id": null,
    "position": null,
    "parent_id": null,
    "thing_type": null    
}
export const thingsConfigObj = {
    "index": null,
    "props": null,
    "command_protocol": null,
    "url": null,
    "thing_id": null
}
export class Thing {
    constructor(thingInitials) {
       this.thing = thingInitials;
    }
    async createNew() {
        // console.log("things8923893", ThingDbOps);
        // throw new Error();
        return ThingDbOps.create(this.thing)

    }
    async configure(config) {        
        return ThingsConfig.create(config);
    }
};

