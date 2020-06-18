let db;
//create new db request for a budget database
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  // create object store called pending and set autoincrement to true
  db.createObjectStore("pending", {
    autoIncrement: true,
  });
};

request.onsuccess = (event) => {
  db = event.target.result;
  //check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = (event) => {
  console.log("Oops!" + event.target.errorCode);
};

const saveRecord = (record) => {
  //create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");
  //access pending object store
  const store = transaction.objectStore("pending");
  //add record to store with add method
  store.add(record);
};

const checkDatabase = () => {
  //open a transaction on pending db
  const transaction = db.transaction(["pending"], "readwrite");
  //access pending object store
  const store = transaction.objectStore("pending");
  //get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      axios.post("/api/transaction/bulk", getAll.result).then(() => {
        //if success, open a transaction on pending db
        const transaction = db.transaction(["pending"], "readwrite");
        //access pending object store
        const store = transaction.objectStore("pending");
        //clear all items in store
        store.clear();
      });
    }
  };
};
//listen for app coming back online
window.addEventListener("online", checkDatabase);
