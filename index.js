const state = {
  userList: [],
  transfer: {},
  isActive: true,
  history: [],
};

// WARNING START
let warningArea = document.getElementById("warning-area");

function warning(type) {
  return `<div class="alert alert-warning alert-dismissible fade show " role="alert">
  <strong>Dikkat!</strong>
  ${
    type == "warning"
      ? "Tüm Bilgileri Girdiğinizden Emin Olun!"
      : type == "warning-transfer-empty"
      ? "Boş Bir Alan Bırakmadığınızdan Emin Olun!"
      : type == "warning-amount" &&
        "Kullanıcının Bakiyesinden Fazla Para Transferi Gerçekleştirilemez!"
  }  

  <button type="button" class="btn-close p-0 m-3" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}
// WARNING END

// USER LIST START

// add new user
function submitHandler(event) {
  let id = (Math.random() * 1000).toFixed(3) + 1; // create id for new user

  event.preventDefault(); // prevent default behavior (refresh)
  let name = document.getElementById("name").value;
  let money = document.getElementById("money").value;

  if (name && money) {
    // if input is not empty, add new user to list with id
    addUser("userList", { name, money, id });
    renderUserList();
    renderTransferSend();
    setState("history", [...state.history, { name, money, id, type: "add" }]);
    renderHistoryList();
  } else {
    // if input is empty, show warning
    warningArea.innerHTML = warning("warning");
  }
  document.getElementById("name").value = "";
  document.getElementById("money").value = "";
}

function addUser(type, value) {
  setState("userList", [...state.userList, value]);
}

function setState(type, arguments) {
  state[type] = arguments;
}

function renderUserList() {
  // create user list element and append to output area (render)
  let outputArea = document.getElementById("output-area");

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

function deleteUser(id) {
  // user delete function
  let user = state.userList.filter((user) => user.id == id);
  setState("history", [...state.history, { user, type: "delete" }]);
  renderHistoryList(); // send to history function to show delete operation

  state.userList = state.userList.filter((user) => user.id != id); // delete user from list

  renderUserList(state.userList); // delete user from output area

  renderTransferSend(); // delete user from transfer-send list
}

// USER LIST END

// TRANSFER PART START

// input areas for transfer
let whoSend = document.getElementById("who-send");
let whoReceive = document.getElementById("who-receive");

function renderTransferSend() {
  // transfer-send list function (render)
  whoSend.innerHTML = `<option selected>Kimden...</option>`;
  state.userList.forEach(function (element) {
    let newOption = document.createElement("option");
    newOption.setAttribute("value", element.name);
    newOption.innerText = element.name;
    newOption.setAttribute("id", element.id);
    whoSend.appendChild(newOption);
  });
}

// values for transfer equation
let selectedSend = {};
let selectedReceive = {};

whoSend.addEventListener("change", (event) => {
  // when user select a user from transfer-send list
  selectedSend = {
    name: whoSend.selectedOptions[0].value,
    id: whoSend.selectedOptions[0].id,
  };

  // if user select a user from transfer-send list, set default value to transfer-receive list
  whoReceive.innerHTML = `<option selected>Kime...</option>`;

  // create rest options for transfer-receive list
  let restUserList = state.userList.filter(
    (el) => el.name != selectedSend.name
  );

  // prevent showing same user in transfer-receive list
  renderTransferReceive(restUserList);
});

whoReceive.addEventListener("change", (event) => {
  // when user select a user from transfer-receive list
  selectedReceive = {
    name: whoReceive.selectedOptions[0].value,
    id: whoReceive.selectedOptions[0].id,
  };
});

function renderTransferReceive(restUserList) {
  // transfer-receive list function (render)
  restUserList.forEach((el) => {
    let newOption = document.createElement("option");
    newOption.setAttribute("value", el.name);
    newOption.setAttribute("id", el.id);
    newOption.innerText = el.name;
    whoReceive.appendChild(newOption);
  });
}

let transferList = document.getElementById("transfer-list");

function renderHistoryList() {
  let userLi = document.createElement("li");
  let unDoButton = document.createElement("span");
  let divElement = document.createElement("div");
  let idHistoryItem = (Math.random() * 10000).toFixed(3) + 1;
  state.history.forEach(function (el) {
    if (el.type == "add") {
      // if user added, send to history list
      userLi.classList.remove(
        "text-danger",
        "text-warning",
        "justify-content-start"
      );
      userLi.classList.add("d-flex", "justify-content-end", "text-secondary");
      userLi.innerHTML = `${el.name} kullanıcısı ${el.money} TL bakiyesi ile kullanıcı listemize eklendi. ---`;
    } else if (el.type == "delete") {
      // if user deleted, send to history list
      userLi.classList.add("d-flex", "justify-content-end", "text-danger");
      userLi.innerHTML = `${el.user[0].name} kullanıcısı silindi. ---`;
    } else if (el.type == "transfer") {
      // if money transfered, send to history list
      userLi.classList.remove("justify-content-end","text-warning");
      userLi.classList.add(
        "text-success",
        "d-flex",
        "align-items-center",
        "justify-content-start",
        "money-transfer-element"
      );
      userLi.innerHTML = `${el.sender.name} kullanıcısından, ${el.receiver.name} kullanıcısına ${el.amount} TL aktarıldı.`;
      unDoButton.style.cursor = "pointer";      
      unDoButton.setAttribute("id", idHistoryItem);
      unDoButton.setAttribute("class", "text-secondary fs-2 me-3");
      unDoButton.setAttribute(
        "onclick",
        `unDoTransfer(${el.sender.id},${el.receiver.id},${el.amount},${el.id})`
      );
      unDoButton.innerHTML = `&#8630`;
      userLi.prepend(unDoButton);
      divElement.setAttribute("id", el.id);
    } else if (el.type == "unDo") {
      
      userLi.classList.remove("text-secondary", "justify-content-end");
      userLi.classList.add("text-warning");
      userLi.innerHTML = `--- Havale İşlemi İptal Edildi.`;
    }
  });
  // append to history list

  divElement.setAttribute("class", "py-3 bg-light transferDiv");
  divElement.appendChild(userLi);

  transferList.prepend(divElement);
}

function submitToHistory(event) {
  // prevent default behavior (refresh)
  event.preventDefault();

  // if user points the amount field
  let amount = document.getElementById("amount-of-money").value;

  // if user points the amount more than user's money
  if (Number(amount) > Number(state.userList[1].money)) {
    warningArea.innerHTML = warning("warning-amount");
  } else {
    if (selectedSend && selectedReceive && amount) {
      let idHistoryItem = (Math.random() * 10000).toFixed(3) + 1;
      setState("history", [
        ...state.history,
        { sender:selectedSend, receiver:selectedReceive, amount:amount, type:"transfer", id:idHistoryItem }
      ]);
    } else {
      // if user doesn't select a field, show warning
      warningArea.innerHTML = warning("warning-transfer-empty");
      return false;
    }

    // send to history function
    renderHistoryList(state.transfer, "transfer");

    // user list update
    state.userList.forEach(function (element) {
      if (element.name == selectedSend.name) {
        element.money = element.money - parseInt(amount);
      }
      if (element.name == selectedReceive.name) {
        element.money = Number(element.money) + Number(amount);
      }
    });

    setState("transfer", {}); // transfer value reset

    renderUserList(); // render user list according to updated values

    document.getElementById("amount-of-money").value = "";
  }
}

function unDoTransfer(sendId, receiveId, amount, id) {
  // fin divs
 let divs = document.getElementsByClassName("transferDiv");

  // find the div element and delete them
  for (let i = 0; i < divs.length; i++) {
    if (divs[i].id == id) {
      divs[i].remove();
    }
  }

  setState("history", state.history.filter((el) => el.id != id));

  // find user from user list
  let userSend = state.userList.filter((user) => user.id == sendId);
  let userReceive = state.userList.filter((user) => user.id == receiveId);

  setState("isActive", false); // set isActive to false

  setState("history", [...state.history, { type: "unDo" }]);
  renderHistoryList(); // send to history list

  // user list update
  state.userList.forEach(function (element) {
    if (element.name == userSend[0].name) {
      element.money = Number(element.money) + Number(amount);
    }
    if (element.name == userReceive[0].name) {
      element.money = Number(element.money) - Number(amount);
    }
  });

  renderUserList(); // render user list according to updated values
}

let historySearch = document.getElementById("history-search");

historySearch.addEventListener("keyup", function (event) {
  // if user points the search field
  let searchValue = event.target.value;
  // prevent changing of state.history
  let copyHistoryArray = [...state.history];
  copyHistoryArray.filter(el=> el.name==searchValue);
}
);
