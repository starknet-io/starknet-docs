function createJsonElement(data, indent) {
  const type = typeof data;

  if (Array.isArray(data)) {
    const element = document.createElement("div");
    element.classList.add("json-array");

    if (indent > 0) {
      element.classList.add("json-indent");
    }

    data.forEach((item) => {
      const itemElement = createJsonElement(item, indent + 1);
      element.appendChild(itemElement);
    });

    return element;
  } else if (type === "object" && data !== null) {
    const element = document.createElement("div");
    element.classList.add("json-object");

    if (indent > 0) {
      element.classList.add("json-indent");
    }

    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (key === "name") {
        const keyElement = document.createElement("span");
        keyElement.classList.add("json-key");
        keyElement.textContent = `${key}: `;

        const valueElement = createJsonElement(value, indent + 1);

        const sectionElement = document.createElement("div");
        sectionElement.classList.add("json-section");
        sectionElement.appendChild(keyElement);
        sectionElement.appendChild(valueElement);

        sectionElement.addEventListener("click", () => {
          sectionElement.classList.toggle("collapsed");
        });

        element.appendChild(sectionElement);
      } else {
        const nestedElement = createJsonElement(value, indent + 1);
        element.appendChild(nestedElement);
      }
    });

    return element;
  } else {
    const element = document.createElement("span");
    element.classList.add("json-value");

    if (type === "string") {
      element.classList.add("token", "string");
      element.textContent = `"${data}"`;
    } else if (type === "number") {
      element.classList.add("token", "number");
      element.textContent = data.toString();
    } else if (type === "boolean") {
      element.classList.add("token", "boolean");
      element.textContent = data.toString();
    } else if (type === "null") {
      element.classList.add("token", "null");
      element.textContent = "null";
    }

    return element;
  }
}

function fetchAndDisplayJSON() {
  var url = "https://raw.githubusercontent.com/starkware-libs/starknet-specs/master/api/starknet_api_openrpc.json?token=ASNPSF625O5JPOCD2SYH5D3BO3AAM&uiSchema%5BappBar%5D%5Bui:input%5D=false&uiSchema%5BappBar%5D%5Bui:darkMode%5D=true&uiSchema%5BappBar%5D%5Bui:examplesDropdown%5D=false";

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error fetching JSON: " + response.status);
      }
      return response.json();
    })
    .then((jsonData) => {
      var jsonContainer = document.getElementById("jsonContainer");
      var methodsData = jsonData.methods || {};

      jsonContainer.innerHTML = "";
      jsonContainer.appendChild(createJsonElement(methodsData, 0));
    })
    .catch((error) => {
      console.error(error);
    });
}

// Call the fetchAndDisplayJSON function when the page has loaded
document.addEventListener("DOMContentLoaded", fetchAndDisplayJSON);
