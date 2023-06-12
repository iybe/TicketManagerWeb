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