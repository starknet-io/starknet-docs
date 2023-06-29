// rpc.js

function fetchAndDisplayJSON() {
  var url = "https://raw.githubusercontent.com/starkware-libs/starknet-specs/master/api/starknet_api_openrpc.json?token=ASNPSF625O5JPOCD2SYH5D3BO3AAM&uiSchema%5BappBar%5D%5Bui:input%5D=false&uiSchema%5BappBar%5D%5Bui:darkMode%5D=true&uiSchema%5BappBar%5D%5Bui:examplesDropdown%5D=false";

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error fetching JSON: " + response.status);
      }
      return response.json();
    })
    .then(jsonData => {
      var prettifiedJson = JSON.stringify(jsonData, null, 2); // Use 2 spaces for indentation
      document.getElementById("jsonContainer").innerHTML = prettifiedJson;
    })
    .catch(error => {
      console.error(error);
    });
}

// Call the fetchAndDisplayJSON function when the page has loaded
document.addEventListener("DOMContentLoaded", fetchAndDisplayJSON);
