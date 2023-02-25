import store from "@/stores/store";
import commonFn from "@/commons/commonFunction";

// Implement the driver here.
class IndexedDB {
  _db = null;
  _dbName = "ams";
  _keyField = "_k";
  _valueField = "_v";
  _table = 'cache';

  init(tenantId) {
    const me = this;

    me._table = String(tenantId);

    try {
      // In the following line, you should include the prefixes of implementations you want to test.
      window.indexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB;

      window.IDBTransaction =
        window.IDBTransaction ||
        window.webkitIDBTransaction ||
        window.msIDBTransaction;
      window.IDBKeyRange =
        window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

      if (!window.indexedDB) {
        console.log("Your browser doesn't support a stable version of IndexedDB.")
      }
    } catch (err) {
      //   console.error(err);
    }

    //Open database (version changed by time)
    var db;
    const DBOpenRequest = window.indexedDB.open(me._dbName, new Date().getTime());

    DBOpenRequest.onerror = function(event) {};

    DBOpenRequest.onupgradeneeded = function(event) {

      var db  = event.target.result;

      //Nếu đã có dbObject lưu rồi thì ko createObject nữa -> return.
      if (db.objectStoreNames && db.objectStoreNames.length) {
        for (let i = 0; i < db.objectStoreNames.length; i++) {
          if (db.objectStoreNames[i] === me._table) {
            console.log('indexedDB', me._table, 'existed');
            return;
          }
        }
      }

      var store = db.createObjectStore(me._table, {
        keyPath: me._keyField
      });

      //set global variable to extract from app.
      me._db = db;
    };

    //close db when don't need to.
    DBOpenRequest.onsuccess = function(event) {
      db = event.target.result;
      me._db = db;
    };

  }

  get(key) {
    const me = this,
      table = me.getTable();

    let transaction = me._db.transaction([table], "readwrite");
    let objectStore = transaction.objectStore(table);
    let request = objectStore.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = function(event) {
        let data = null;
        if (request.result) {
          data = request.result[me._valueField];
        }
        resolve(data);
      };
      request.onerror = function(event) {
        reject();
      };
    });
  }

  remote(key) {
    const me = this,
    table = me.getTable();

    let transaction = me._db.transaction([table], "readwrite");
    let objectStore = transaction.objectStore(table);
    let request = objectStore.delete(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = function(event) {
        resolve(request.result[me._valueField]);
      };
      request.onerror = function(event) {
        reject();
      };
    });
  }

  set(key, value) {
    const me = this,
      table = me.getTable();


    let transaction = me._db.transaction([table], "readwrite");
    let objectStore = transaction.objectStore(table);

    let objectStoreGet = objectStore.get(key);
    objectStoreGet.onsuccess = function() {
      let data = objectStoreGet.result;

      if (typeof data === "undefined") {
        let cacheData = {};
        cacheData[me._keyField] = key;
        cacheData[me._valueField] = value;
        objectStore.add(cacheData);
      } else {
        data[me._valueField] = value;
        objectStore.put(data);
      }
    };
  }

  getTable() {
    return this._table;
  }
}

export default new IndexedDB();
