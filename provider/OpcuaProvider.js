
import ThingsMappingRepo from '../repo/things_mapping_repo'

import OpcuaSessionHelper from '../opcua/opcua_session'
const opcuaSessionHelper = new OpcuaSessionHelper();

const opcua = require("node-opcua");
const endPointUrl = "opc.tcp://25.21.162.217:48050";

class OpcuaProvider {

    async execute(getThingType, value) {

        const project = await ThingsMappingRepo.findThingMappingConfig(getThingType);
        if (project === null) {
            console.log('Not found!');
        } else {
            console.log("Full command", project.executing_command); // 'My Title'
        }
        // const opcuaclient = await this.buildOpcuaExecutionCommand(project)
        const read = await opcuaSessionHelper.readNode(endPointUrl);
        const write = await opcuaSessionHelper.writeToNode(endPointUrl);
    }


    async buildOpcuaExecutionCommand(project) {
        const client = await opcuaSessionHelper.getOpcuaClient()
        console.log("client[" + client + "]");
        const session = await opcuaSessionHelper.getOPcuaSession(client);
        // console.log("session[" + session+"]");
        const cmd = "ns=13;s=GVL.astSMIBlind[1].lrSetPosition";
        var status_code = await session.writeSingleNode(cmd, { dataType: opcua.DataType.Double, value: 10 });
        console.log('writeOPCUACommands status_code =', status_code);
    }

    async getstate() {
        // getting mapping from things-mapping-config
        // call to things_temp_value table for stub api call.
        const client = opcuaSessionHelper.getOpcuaClient()
        const session = opcuaSessionHelper.getOPcuaSession(client);
        const dataValue = await session.read({ nodeId, attributeId: AttributeIds.Value });
        if (dataValue.statusCode !== StatusCodes.Good) {
            console.log("Could not read ", nodeId);
        }
        console.log(` temperature = ${dataValue.value.toString()}`);
    }
}
export default OpcuaProvider