const locateBtn = document.getElementById("locate-btn");
const saveLSBtn = document.getElementById("save-ls-btn");
const saveIDBBtn = document.getElementById("save-idb-btn");
const coordinatesDisplay = document.getElementById("coordinates");
const commentLSForm = document.getElementById("comment-form-ls");
const commentIDBForm = document.getElementById("comment-form-idb");
const localStorageData = document.getElementById("localstorage-data");
const indexedDBData = document.getElementById("indexeddb-data");
let latitude, longitude;

locateBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        coordinatesDisplay.textContent = `Координаты: ${latitude}, ${longitude}`;
      },
      (error) => {
        alert("Не удалось получить местоположение: " + error.message);
      }
    );
  } else {
    alert("Ваш браузер не поддерживает Geolocation API");
  }
});

saveLSBtn.addEventListener("click", () => {
  const comment = document.getElementById("comment-ls").value;
  if (latitude && longitude && comment) {
    const locationData = {
      latitude,
      longitude,
      comment,
      timestamp: new Date().toLocaleString(),
    };
    const existingData = JSON.parse(localStorage.getItem("locationData")) || [];
    existingData.push(locationData);
    localStorage.setItem("locationData", JSON.stringify(existingData));
    displayLocalStorageData();
    commentLSForm.reset();
  } else {
    alert("Введите комментарий и убедитесь, что местоположение определено.");
  }
});

function displayLocalStorageData() {
  localStorageData.innerHTML = "";
  const storedData = JSON.parse(localStorage.getItem("locationData")) || [];
  storedData.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Комментарий: ${item.comment} | Координаты: ${item.latitude}, ${item.longitude} | Дата: ${item.timestamp}`;
    localStorageData.appendChild(listItem);
  });
}

let db;
const request = indexedDB.open("locationCommentsDB", 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  const objectStore = db.createObjectStore("comments", { keyPath: "id", autoIncrement: true });
  objectStore.createIndex("timestamp", "timestamp", { unique: false });
};

request.onsuccess = (event) => {
  db = event.target.result;
  displayIndexedDBData();
};

saveIDBBtn.addEventListener("click", () => {
  const comment = document.getElementById("comment-idb").value;
  if (latitude && longitude && comment) {
    saveToIndexedDB(comment, latitude, longitude);
    commentIDBForm.reset();
  } else {
    alert("Введите комментарий и убедитесь, что местоположение определено.");
  }
});

function saveToIndexedDB(comment, latitude, longitude) {
  const transaction = db.transaction(["comments"], "readwrite");
  const objectStore = transaction.objectStore("comments");
  const data = {
    comment,
    latitude,
    longitude,
    timestamp: new Date().toLocaleString(),
  };
  objectStore.add(data);
  transaction.oncomplete = () => {
    displayIndexedDBData();
  };
}

function displayIndexedDBData() {
  indexedDBData.innerHTML = "";
  const transaction = db.transaction(["comments"], "readonly");
  const objectStore = transaction.objectStore("comments");
  const request = objectStore.getAll();
  request.onsuccess = (event) => {
    event.target.result.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Комментарий: ${item.comment} | Координаты: ${item.latitude}, ${item.longitude} | Дата: ${item.timestamp}`;
      indexedDBData.appendChild(listItem);
    });
  };
}

window.onload = () => {
  displayLocalStorageData();
  displayIndexedDBData();
};
