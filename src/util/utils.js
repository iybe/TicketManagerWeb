export function convertGetGroupsToJSON(arrayRetornado) {
    const arrayJSON = [];

    for (let i = 0; i < arrayRetornado.length; i++) {
        const [eventId, eventName, organizer, value, quantity] = arrayRetornado[i];

        const groupTicket = {
            eventId: eventId,
            eventName: eventName,
            organizer: organizer,
            value: value,
            quantity: quantity
        };

        arrayJSON.push(groupTicket);
    }

    return arrayJSON;
}

export function convertNumberToHex(val) {
    const number = Number(val);
    console.log(number);
    const hex = number.toString(16);
    console.log(hex);
    return "0x" + hex;
}   