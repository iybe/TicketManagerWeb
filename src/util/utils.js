import {
  weiToEther
} from "./interact"

export function convertGetGroupsToJSON(arrayRetornado) {
  const arrayJSON = [];

  for (let i = 0; i < arrayRetornado.length; i++) {
    const [eventId, eventName, organizer, value, quantity] = arrayRetornado[i];

    const groupTicket = {
      eventId: eventId,
      eventName: eventName,
      organizer: organizer,
      value: weiToEther(value),
      quantity: quantity
    };

    arrayJSON.push(groupTicket);
  }

  return arrayJSON;
}

export function convertTicketToJSON(arrayRetornado) {
  const arrayJSON = [];
  console.log(arrayRetornado);
  for (let i = 0; i < arrayRetornado.length; i++) {
    const [id, eventId, eventName, owner, organizer, age, limit, value, sale] = arrayRetornado[i];
    const saleS = sale ? "Sim" : "Não";

    const ticket = {
      id: id,
      eventId: eventId,
      eventName: eventName,
      owner: owner,
      organizer: organizer,
      age: age,
      limit: limit,
      value: weiToEther(value),
      sale: saleS
    };

    arrayJSON.push(ticket);
  }

  return arrayJSON;
}