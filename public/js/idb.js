let db;

// connect to idb db called 'budget_tracker' and set it to v 1
const request = indexedDB.open('budget_tracker', 1);
// if version changes
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    // create an object store (table) called `new_transaction`, set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    // save db ref if successful
    db = event.target.result;
    if (navigator.onLine) {
        // checkDB();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// submit transaction with no connection
function saveRecord(record) {
    // open a new transaction with db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    // access the object store for `new_transaction`
    const  budgetObjectStore = transaction.objectStore('new_transaction');
    // add record to your store with add method
    budgetObjectStore.add(record);
}

function checkDB() {
    // open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    // access object store
    const budgetObjectStore = transaction.objectStore('new_transaction');
    // get all records from store 
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        // if there was data in store send to api 
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const budgetObjectStore = transaction.objectStore('new_transaction');
                    budgetObjectStore.clear();

                    alert('All saved transactions has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

// listen for app coming back online
window.addEventListener('online', checkDB);

