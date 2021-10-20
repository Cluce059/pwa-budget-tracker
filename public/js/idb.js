let db;
const request = indexedDB.open('pwa-budget-tracker', 1);

request.onupgradeneeded = function(event) {
    // save a ref to the db 
    const db = event.target.result;
    // create an object store (table) called `new_transaction`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('waiting', { autoIncrement: true }); //waiting for obj store
  };

request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    // check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {
      // we haven't created this yet, but we will soon, so let's comment it out for now
      checkDb();
    }
  };
  
request.onerror = function(event){
    console.log(event.target.errorCode);
};

function saveRecord(record){
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
    //add method to store
    store.add(record);
};

function checkDb(){
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
    const getAll = store.getAll();

    getAll.onsuccess = function(){
        if(getAll.result.length > 0){
            fetch('/api/transaction/bulk', {
                method:'POST',
                body: JSON.stringify(getAll.results),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(['pending'], 'readwrite');
                const store = transaction.objectStore('pending');
                store.clear(); //clear items from store
            })
        }
    }
}

window.addEventListener('online', checkDb);


