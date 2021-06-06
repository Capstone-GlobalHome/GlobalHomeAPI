

export const buildCurtainHexString = (configProps, mappingProps, value) => {

    console.log("mappingProps", mappingProps);
    console.log("configProps", configProps);

    const thingMappingProps = JSON.parse(mappingProps);
    console.log(thingMappingProps);
    const thingConfigProps = JSON.parse(configProps);
    console.log(thingConfigProps);

    let map = new Map();
    buildMsgByte(thingMappingProps.byte_1_msg, map);
    buildAckLengthByte(thingMappingProps.byte_2_ack, thingMappingProps.byte_2_length, map);
    buildNodeTypeByte(thingMappingProps.byte_3_node_type, map);
    buildSourceTypeByte(thingConfigProps.source, map);
    buildDestinationTypeByte(thingConfigProps.dest, map);
    buildDataByte(thingMappingProps.byte_10_position, value, map);
    generateCheckSum(map)
    const hex = generateHex(map);
    return hex

}


const buildMsgByte = (byteMsg, map) => {
    let binaryTransformation = parseInt(byteMsg, 16).toString(2).toUpperCase();
    const transFormedObj = transForm(byteMsg, convertToNbits(binaryTransformation, 8));
    map.set("1", transFormedObj);
}

const buildAckLengthByte = (ackBit, lengthBit, map) => {
    let bitsAck = convertToNbits(parseInt(ackBit, 16).toString(2).toUpperCase(), 1);
    let bitsLength = convertToNbits(parseInt(lengthBit, 10).toString(2).toUpperCase(), 5);
    let binaryTransformation = bitsAck + "00" + bitsLength;
    const transFormedObj = transForm("ack:" + ackBit + ",lenght:" + lengthBit, convertToNbits(binaryTransformation, 8));
    map.set("2", transFormedObj);
}

const buildNodeTypeByte = (nodeTypeValue, map) => {
    let binaryTransformation = parseInt(nodeTypeValue, 16).toString(2).toUpperCase();
    const transFormedObj = transForm(nodeTypeValue, convertToNbits(binaryTransformation, 8));
    map.set("3", transFormedObj);
}

const buildSourceTypeByte = (source, map) => {
    const item = source.split(':');
    map.set("4", transForm(item[2],
        convertToNbits(parseInt(item[2], 16).toString(2).toUpperCase(), 8)));
    map.set("5", transForm(item[1],
        convertToNbits(parseInt(item[1], 16).toString(2).toUpperCase(), 8)));
    map.set("6", transForm(item[0],
        convertToNbits(parseInt(item[0], 16).toString(2).toUpperCase(), 8)));
}

const buildDestinationTypeByte = (source, map) => {
    const item = source.split(':');
    map.set("7", transForm(item[2],
        convertToNbits(parseInt(item[2], 16).toString(2).toUpperCase(), 8)));
    map.set("8", transForm(item[1],
        convertToNbits(parseInt(item[1], 16).toString(2).toUpperCase(), 8)));
    map.set("9", transForm(item[0],
        convertToNbits(parseInt(item[0], 16).toString(2).toUpperCase(), 8)));
}

const buildDataByte = (positionFunction, value, map) => {
    map.set("10", transForm(positionFunction, convertToNbits(parseInt(positionFunction, 16).toString(2).toUpperCase(), 8)));
    map.set("11", transForm(value, convertToNbits(parseInt(value, 10).toString(2).toUpperCase(), 8)));
    map.set("12", transForm("0", convertToNbits(parseInt("0", 16).toString(2).toUpperCase(), 8)));
    map.set("13", transForm("0", convertToNbits(parseInt("0", 16).toString(2).toUpperCase(), 8)));
    map.set("14", transForm("0", convertToNbits(parseInt("0", 16).toString(2).toUpperCase(), 8)));
    map.set("15", transForm("0", convertToNbits(parseInt("0", 16).toString(2).toUpperCase(), 8)));
}


const generateCheckSum = (map) => {
    let sum = 0;
    map.forEach((obj) => {
        sum = sum + parseInt(obj.deci, 10)
    })
    const bitCheckSum = convertToNbits(parseInt(sum, 10).toString(2).toUpperCase(), 16);
    const checksumHex = convertToNbits(calculateHex(bitCheckSum), 4);
    map.set("16", { hex: checksumHex.substring(0, 2) });
    map.set("17", { hex: checksumHex.substring(2, 4) });
}
const generateHex = (map) => {
    let hex = "";
    map.forEach((obj) => {
        hex = hex + " " + obj.hex
    })
    return hex.trim();
}



const convertToNbits = (binaryTransformation, length) => {
    while (binaryTransformation.length < length) {
        binaryTransformation = "0" + binaryTransformation;
    }
    return binaryTransformation
}


const transForm = (actaulKey, binaryTransformation) => {

    // console.log("THings-config", group.config);
    return Object.assign(
        {}, {
        key: actaulKey,
        binary: binaryTransformation,
        binary_complement: binary1sComplement(binaryTransformation),
        deci: calculateDecimal(binary1sComplement(binaryTransformation)),
        hex: calculateHex(binary1sComplement(binaryTransformation)),
    }
    )
}


const binary1sComplement = (binary) => {
    let invertedBits = binary.replace(/1/g, 'x')//convert '1' to temp char('x')
        .replace(/0/g, '1')//convert '0' to '1'
        .replace(/x/g, '0')
    return invertedBits;
}

const calculateDecimal = (binary) => {
    const deci = parseInt(binary, 2).toString(10).toUpperCase()
    return deci;
}

const calculateHex = (binary) => {
    const hex = parseInt(binary, 2).toString(16).toUpperCase()
    return hex;
}

