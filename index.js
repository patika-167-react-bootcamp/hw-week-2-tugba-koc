const state = {
  userList: [],
  transfer: {},
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
    id++;
    addUser("userList", { name, money, id });
    renderUserList();
    renderTransferSend();
    renderHistoryList(state.userList, "add");
  } else {
    // if input is empty, show warning
    warningArea.innerHTML = warning("warning");
  }
  document.getElementById("name").value = "";
  document.getElementById("money").value = "";
}

function addUser(type, value) {
  setState("userList", [...state.userList, value]);
  console.log(state.userList);
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
  let user = state.userList.filter((user) => user.id === id);

  renderHistoryList(user, "delete"); // send to history function to show delete operation

  state.userList = state.userList.filter((user) => user.id !== id); // delete user from list

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

function renderHistoryList(user, type) {
  let userLi = document.createElement("li");
  let unDoButton = document.createElement("button");
  if (type == "add") {
    // if user added, send to history list
    userLi.classList.add("text-end", "text-secondary");
    userLi.innerHTML = `${user[user.length - 1].name} kullanıcısı ${
      user[user.length - 1].money
    } TL bakiyesi ile kullanıcı listemize eklendi. ---`;
  } else if (type == "transfer") {
    // if money transfered, send to history list
    userLi.classList.add("text-success");
    unDoButton.setAttribute("class", "btn btn-danger");
    unDoButton.setAttribute(
      "onclick",
      `unDoTransfer(${user.selectedSend.id},${user.selectedReceive.id},${user.amount})`
    );
    unDoButton.innerText = "Geri Al";
    userLi.innerHTML = `${user.selectedSend.name} kullanıcısından, ${user.selectedReceive.name} kullanıcısına ${user.amount} TL aktarıldı.`;
    userLi.appendChild(unDoButton);
  } else {
    // if user deleted, send to history list
    userLi.classList.add("text-end", "text-danger");
    userLi.innerHTML = `${user[0].name} kullanıcısı silindi. ---`;
  }
  // append to history list
  let divElement = document.createElement("div");
  divElement.setAttribute("class", "py-3 bg-light");
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
      setState("transfer", { selectedSend, selectedReceive, amount });
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

    // transfer value reset
    setState("transfer", {});

    // render user list according to updated values
    renderUserList();

    document.getElementById("amount-of-money").value = "";
  }
}

function unDoTransfer(sendId, receiveId, amount) {
  // find user from user list
  let userSend = state.userList.filter((user) => user.id == sendId);
  let userReceive = state.userList.filter((user) => user.id == receiveId);

  // user list update
  state.userList.forEach(function (element) {
    if (element.name == userSend[0].name) {
      console.log(element.money, amount);

      element.money = Number(element.money) + Number(amount);
    }
    if (element.name == userReceive[0].name) {
      element.money = Number(element.money) - Number(amount);
    }
  });

  // render user list according to updated values
  renderUserList();
}
