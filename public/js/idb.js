// create variable to hold db connection
let db;

// establish connection to indexedDB db called 'budget_tracker' and set to version 1
const request = indexedDB.open('budget_tracker', 1);

// this event will emit if the db version changes
request.onupgradeneeded = function(event) {
    //save a reference to the database
    const db = event.target.result;
    // create an object store (table) called `new_budget` auto incrementing primary key of sorts
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// upon success
request.onsuccess = function(event) {
    //when db is successfully created with the object store or connection made, save ref to global db
    db = event.target.result;
    // if app is online, send all local db data to api
    if (navigator.onLine) {
        //uploadBudget();
    }
};

//log error
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

//submit data if no connection
function saveRecord(record) {
    // open new transaction with db with read and write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add record to store
    budgetObjectStore.add(record);
}