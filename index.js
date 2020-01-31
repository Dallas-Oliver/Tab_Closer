let choose;

window.addEventListener("DOMContentLoaded", function() {
  const closeAll = document.querySelector("#close-all");
  closeAll.addEventListener("click", closeAllTabs);

  const refresh = document.getElementById("refresh");
  refresh.addEventListener("click", refreshSession);

  choose = document.getElementById("choose-tabs");

  choose.addEventListener("click", chooseTabsToKeepOpen);
});

function closeAllTabs() {
  chrome.windows.getCurrent({ populate: true }, function(window) {
    tabsToClose = window.tabs.map(tab => {
      return tab.id;
    });

    closeTabs(tabsToClose);
  });
}

async function refreshSession() {
  let newTabId = openNewTab();
  let tabsToClose;

  chrome.windows.getCurrent({ populate: true }, function(window) {
    tabsToClose = window.tabs.map(tab => {
      if (tab.id !== newTabId) {
        return tab.id;
      }
    });

    closeTabs(tabsToClose);
  });
}

function chooseTabsToKeepOpen() {
  let tabsToKeep = [];

  chrome.windows.getCurrent({ populate: true }, function(window) {
    window.tabs.map(tab => {
      let li = document.createElement("li");
      li.textContent = tab.title;
      li.id = tab.title;
      li.classList.add("item", "currentTabs");

      li.addEventListener("click", function() {
        if (tabsToKeep.indexOf(tab.id) === -1) {
          tabsToKeep.push(tab.id);
          li.classList.add("marked");
        } else {
          tabsToKeep.splice(tabsToKeep.indexOf(tab.id), 1);
          li.classList.remove("marked");
        }
      });

      let chooseList = document.getElementById("choose-list");
      chooseList.appendChild(li);
    });
  });

  let deleteButton = document.createElement("button");
  deleteButton.textContent = "close tabs";
  let chooseList = document.getElementById("choose-list");
  chooseList.append(deleteButton);
  deleteButton.classList.add("btn");
  deleteButton.classList.add("btn-light");

  deleteButton.addEventListener(
    "click",
    async () => await tabSelector(tabsToKeep)
  );

  choose.removeEventListener("click", chooseTabsToKeepOpen);
  return tabsToKeep;
}

function tabSelector(tabsToKeep) {
  let tabsToDelete = [];
  chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, tabs => {
    tabs.forEach(tab => {
      if (!tabsToKeep.includes(tab.id)) {
        tabsToDelete.push(tab.id);
      }
    });
    closeTabs(tabsToDelete);
  });
}

function closeTabs(tabIds) {
  console.log(tabIds);

  chrome.tabs.remove(tabIds, function() {
    console.log(tabIds);
  });
}

function openNewTab() {
  chrome.windows.getCurrent({ populate: true }, function(window) {
    chrome.tabs.create({ active: false }, function(tab) {
      return tab.id;
    });
  });
}
