const state = {
  userList: [],
  restUserList: [],
  transferList: [],
};

// WARNING START

let warningArea = document.getElementById("warning-area");

const WARNING = `<div class="alert alert-warning alert-dismissible fade show " role="alert">
<strong>Lütfen!</strong> Tüm Bilgileri Girdiğinizden Emin Olun!
<button type="button" class="btn-close p-0 m-3" data-bs-dismiss="alert" aria-label="Close"></button>
</div>`;

// WARNING END

// USER LIST START

// id defined as global variable
let id = 0;

// add new user
function submitHandler(event) {
  // prevent default behavior (refresh)
  event.preventDefault();
  let name = document.getElementById("name").value;
  let money = document.getElementById("money").value;

  if (name && money) {
    //  if input is not empty, add new user to list with id
    id++;
    setState([{ name, money, id }]);
  } else {
    // if input is empty, show warning
    warningArea.innerHTML = WARNING;
  }
  document.getElementById("name").value = "";
  document.getElementById("money").value = "";
}

function setState(arguments) {
  // set new state
  state.userList.push(...arguments);
  // show new state in output area
  renderUserList();
  renderTransferSend();
  sendToHistory(arguments, "add");
}

let outputArea = document.getElementById("output-area");

// create user list element and append to output area (render)
function renderUserList() {
  outputArea.innerHTML = "";
  state.userList.forEach(function (el) {
    let newRow = document.createElement("tr");
    let newName = document.createElement("td");
    let newMoney = document.createElement("td");
    let deleteButton = document.createElement("button");
    deleteButton.setAttribute("class", `btn btn-danger`);
    deleteButton.setAttribute("id", el.id);
    deleteButton.setAttribute("onclick", `deleteUser(${el.id})`);
    deleteButton.innerText = "Sil";
    newName.innerText = el.name;
    newMoney.innerText = el.money;
    newRow.appendChild(newName);
    newRow.appendChild(newMoney);
    newRow.appendChild(deleteButton);
    outputArea.appendChild(newRow);
  });
}

// user delete function
function deleteUser(id) {
  let user = state.userList.filter((user) => user.id === id);

  // send to history function to show delete operation
  sendToHistory(user, "delete");

  // delete user from list
  state.userList = state.userList.filter((user) => user.id !== id);

  // delete user from output area
  renderUserList(state.userList);

  // delete user from transfer-send list
  renderTransferSend();
}

// USER LIST END

// TRANSFER PART START

// input areas for transfer 
let whoSend = document.getElementById("who-send");
let whoReceive = document.getElementById("who-receive");

// transfer-send list function (render)
function renderTransferSend() {
  whoSend.innerHTML = `<option selected>Kimden...</option>`;
  state.userList.forEach(function (element) {
    let newOption = document.createElement("option");
    newOption.setAttribute("value", element.name);
    newOption.innerText = element.name;
    whoSend.appendChild(newOption);
  });
}

// values for transfer equation
let selectedSend = "";
let selectedReceive = "";

// when user select a user from transfer-send list
whoSend.addEventListener("change", (event) => {
  selectedSend = whoSend.selectedOptions[0].value;

  // if user select a user from transfer-send list, set default value to transfer-receive list
  whoReceive.innerHTML = `<option selected>Kime...</option>`;

  // prevent showing same user in transfer-receive list
  renderTransferReceive(selectedSend);
});

// when user select a user from transfer-receive list
whoReceive.addEventListener("change", (event) => {
  selectedReceive = whoReceive.selectedOptions[0].value;
});

// transfer-receive list function (render)
function renderTransferReceive(selectedSend) {
  state.restUserList = state.userList.filter((el) => el.name != selectedSend);
  state.restUserList.forEach((el) => {
    let newOption = document.createElement("option");
    newOption.setAttribute("value", el.name);
    newOption.innerText = el.name;
    whoReceive.appendChild(newOption);
  });
}

let transferList = document.getElementById("transfer-list");

function sendToHistory(user, type) {
  let userLi = document.createElement("li");
  if (type == "add") {
    userLi.classList.add("text-end", "text-secondary");
    userLi.innerHTML = `${user[0].name} kullanıcısı ${user[0].money} TL bakiyesi ile kullanıcı listemize eklendi. ---`;
  } else {
    userLi.classList.add("text-end", "text-danger");
    userLi.innerHTML = `${user[0].name} kullanıcısı silindi. ---`;
  }
  let divElement = document.createElement("div");
  divElement.setAttribute("class", "py-3 bg-light");
  divElement.appendChild(userLi);

  transferList.prepend(divElement);
}

function submitToHistory(event) {
  event.preventDefault();

  let amount = document.getElementById("amount-of-money").value;

  if (selectedSend && selectedSend && amount) {
    state.transferList.push({ selectedSend, selectedReceive, amount });
  }

  state.transferList.forEach(function (element) {
    let li = document.createElement("li");
    li.classList.add("text-success");
    li.innerText = `${element.selectedSend} kullanıcısından, ${element.selectedReceive} kullanıcısına ${element.amount} TL aktarıldı.`;
    let divElement = document.createElement("div");
    divElement.setAttribute("class", "py-3 bg-light");
    divElement.appendChild(li);
    transferList.prepend(divElement);
  });

  state.userList.forEach(function (element) {
    if (element.name == selectedSend) {
      element.money = element.money - parseInt(amount);
    }
    if (element.name == selectedReceive) {
      element.money = Number(element.money) + Number(parseInt(amount));
    }
  });

  renderUserList();

  state.transferList = [];

  document.getElementById("amount-of-money").value = "";
}
