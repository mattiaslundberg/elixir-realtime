// Mock data instead of providing an API.
const REMOTE_DATA = {
  resources: [
    { id: 1, name: "Projektor", booked: true },
    { id: 2, name: "Konferensrum A", booked: false },
    { id: 3, name: "Mikrofon", booked: false },
  ],
};

import { Socket } from "phoenix";

let socket = new Socket("ws://localhost:4005/socket", {});
socket.connect();

const createElement = (
  elementType: string,
  parent: Element,
  attrs: Record<string, string>
): Element => {
  const elm = document.createElement(elementType);
  parent.appendChild(elm);

  Object.entries(attrs).forEach(([key, value]: Array<string>) => {
    if (key === "text") {
      elm.innerText = value;
    } else {
      elm.setAttribute(key, value);
    }
  });

  return elm;
};

const root = document.getElementById("container");

const bookedStatusDisplay = (booked) => (booked ? "Upptagen" : "Tillgänglig");
const bookedButtonDisplay = (booked) => (booked ? "Avboka" : "Boka");

const renderResource = (resource) => {
  const container = createElement("div", root, { class: "resource" });
  createElement("div", container, {
    class: "resource-name",
    text: resource.name,
  });

  let booked = resource.booked;
  const status = createElement("div", container, {
    class: "resource-status",
    text: bookedStatusDisplay(booked),
  });
  const bookButton = createElement("button", container, {
    class: "resource-book",
    text: bookedButtonDisplay(booked),
  });

  let channel = socket.channel(`booking:${resource.id}`, {});
  channel.join();
  channel.on("booking", (m) => {
    if (m.isLocked) {
      bookButton.setAttribute("disabled", true);
    } else {
      bookButton.removeAttribute("disabled");
    }
    if (m.hasOwnProperty("booked")) {
      updateBookingStatus(m.booked);
    }
  });

  const updateBookingStatus = (b) => {
    booked = !booked;
    status.innerText = bookedStatusDisplay(booked);
    bookButton.innerText = bookedButtonDisplay(booked);
  };

  bookButton.addEventListener("click", () => {
    channel.push("booking", { isLocked: true });
    const res = confirm(`Vill du ${bookedButtonDisplay(booked)}?`);
    if (res) {
      channel.push("booking", { isLocked: !booked, booked: !booked });
      updateBookingStatus(!booked);
      // NOTE: Update REMOTE_DATA with API call here.
    } else {
      channel.push("booking", { isLocked: false });
    }
  });
};

const main = async () => {
  const data = REMOTE_DATA;
  data.resources.forEach(renderResource);
};
main();
