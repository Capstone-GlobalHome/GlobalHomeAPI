import db from '../models';
import { THING_TYPE } from "../constants/things.constant";
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
export const buildDMXDataList = async (result, ThingDbOps, parent_id, res) => {
    let dmxListDataSet = {
        parent_id: null,
        groups: [
        ]
    };
    dmxListDataSet.parent_id = parent_id;
    let promises = [];

    for (let item of result) {
        if (item.thing_type === THING_TYPE.GROUP_PARENT_CHILD) {
            dmxListDataSet.groups.push(item);
            promises.push(
                ThingDbOps.findAll({
                    where: {
                        parent_id: item.id
                    }
                })
            );
        }
    }
    let allChilds = await Promise.all(promises);
    allChilds = allChilds.flat();



    dmxListDataSet = JSON.parse(JSON.stringify(dmxListDataSet));

    for (let i = 0; dmxListDataSet.groups[i]; i++) {
        const children = allChilds.filter((el) => el.parent_id === dmxListDataSet.groups[i].id);
        if (children.length) {
            dmxListDataSet.groups[i].children = children;

            Object.assign({}, dmxListDataSet);

        }
    }

    promises = [];
    for (var i = 0; dmxListDataSet.groups[i]; i++) {
        if (dmxListDataSet.groups[i].children) {
            for (var j = 0; dmxListDataSet.groups[i].children[j]; j++) {
                promises.push(ThingsConfig.findAll({
                    where: {
                        thing_id: dmxListDataSet.groups[i].children[j].id
                    }
                }))
            }
        }
    }

    let allConfigs = await Promise.all(promises);
    allConfigs = allConfigs.flat();

    dmxListDataSet = JSON.parse(JSON.stringify(dmxListDataSet))
    for (var i = 0; dmxListDataSet.groups[i]; i++) {
        if (dmxListDataSet.groups[i].children) {
            for (var j = 0; dmxListDataSet.groups[i].children[j]; j++) {
                const config = allConfigs.filter((el)=> el.thing_id === dmxListDataSet.groups[i].children[j].id);
                if(config.length) {
                    dmxListDataSet.groups[i].children[j].childId = config[0].id;
                    var props = JSON.parse(config[0].props.replace(/'/g, '"'));
                    dmxListDataSet.groups[i].children[j].address = props.address;
                    dmxListDataSet.groups[i].children[j].index = config[0].index;
                    dmxListDataSet.groups[i].children[j].url = config[0].url;
                    dmxListDataSet.groups[i].children[j].protocol = config[0].command_protocol;
                    //Object.assign(dmxListDataSet.groups[i].children[j], config[0]);
                }
            }
        }
    }



    res.status(200).json({
        status: "success",
        data: allChilds,
        parent: result,
        allConfigs: allConfigs,
        final: dmxListDataSet,
        statusCode: 200
    });

    // if(result.thing_type === THING.CHILD || result.thing_type === null || result.thing_type === THING.INDIVIDUAl) {
    //     dmxListDataSet.groups.child.push(
    //         {
    //             address: defineAddressFromName(),
    //             name: "identifier"
    //         }
    //     )



    //console.log(result);
}
const dataBuilder = () => {

}
const defineAddressFromName = () => {

}

