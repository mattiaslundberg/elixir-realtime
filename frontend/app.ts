// Mock data instead of providing an API.
const REMOTE_DATA = {
  resources: [
    { name: "Projektor", booked: true },
    { name: "Konferensrum A", booked: false },
    { name: "Mikrofon", booked: false },
  ],
};

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

  bookButton.addEventListener("click", () => {
    const res = confirm(`Vill du ${bookedButtonDisplay(booked)}?`);
    if (res) {
      booked = !booked;
      status.innerText = bookedStatusDisplay(booked);
      bookButton.innerText = bookedButtonDisplay(booked);
      // NOTE: Update REMOTE_DATA with API call here.
    }
  });
};

const main = async () => {
  const data = REMOTE_DATA;
  data.resources.forEach(renderResource);
};
main();
