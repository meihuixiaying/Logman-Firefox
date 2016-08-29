/**
 * Created by songlin.ji on 2015/1/10.
 */
'use strict';
(function () {
    const TAG = "DataBase: ";

    var db;

    const DB_NAME = "BugMan";
    const DB_VERSION = 1;
    const STORE_RECORD = "record";

    function OpenDB(callBack) {
        var request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function onUpgradeNeeded(event) {
            var innerDB = event.currentTarget.result;
            if (!innerDB.objectStoreNames.contains(STORE_RECORD)) {
                var record = innerDB.createObjectStore(STORE_RECORD, {keyPath: "ID", autoIncrement: true});
                record.createIndex("recordToken", "recordToken", {unique: true});
            }
        };

        request.onsuccess = function onSuccess(event) {
            console.log(TAG + "create database success");
            db = this.result;
            if (callBack) {
                callBack();
            }
        };

        request.onerror = function onError(event) {
            console.log(TAG + "create database error");
        };
    }

    OpenDB();

    function excuteOperator(callBack) {
        if (!db) {
            OpenDB(callBack);
        } else {
            callBack();
        }
    }

    var RecordObjBLL = {
        /**
         * 添加数据到数据库
         * @param value 要添加的数据
         */
        add: function (value) {
            var result = {};
            excuteOperator(function () {
                var tx = db.transaction(STORE_RECORD, 'readwrite');
                var store = tx.objectStore(STORE_RECORD);
                var request = store.add(value);

                request.onsuccess = function onSuccess(evt) {
                    console.debug("Insertion in DB successful");
                    var recordId = evt.target.result;
                    if (result.onsuccess && result.onsuccess instanceof  Function) {
                        result.onsuccess(recordId);
                    }
                };
                request.onerror = function onError(evt) {
                    console.error("add error", this.error);
                    if (result.onerror && result.onerror instanceof  Function) {
                        result.onerror();
                    }
                };
            });
            return result;
        },
        /**
         * 查找所有数据
         */
        findAll: function (callBack) {
            excuteOperator(function () {
                var resultList = [];
                try {
                    db.transaction([STORE_RECORD], "readonly").objectStore(STORE_RECORD).openCursor().onsuccess = function onSuccess(e) {
                        var cursor = e.target.result;
                        if (cursor) {
                            resultList.push(cursor.value);
                            cursor.continue();
                        } else {
                            if (callBack && callBack instanceof Function) {
                                callBack(resultList);
                            }
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            })
        },
        /**
         * 清空数据库中所有内容
         */
        clear: function () {
            var result = {};
            excuteOperator(function () {
                var request = db.transaction([STORE_RECORD], "readwrite").objectStore(STORE_RECORD).clear();
                request.onsuccess = function onSuccess(e) {
                    if (result.onsuccess && result.onsuccess instanceof  Function) {
                        result.onsuccess();
                    }
                };
                request.onerror = function onError(e) {
                    console.log("ERROR", e.target.error.code);
                    if (result.onerror && result.onerror instanceof  Function) {
                        result.onerror();
                    }
                };
            });
            return result;
        },

        /**
         * 根据主键删除数据
         * @param key 主键(是一个数字)
         */
        deleteByKey: function (key) {
            var response = {};
            excuteOperator(function () {
                if (key === "" || isNaN(key)) {
                    return;
                }
                var request = db.transaction([STORE_RECORD], "readwrite").objectStore(STORE_RECORD).delete(Number(key));
                request.onsuccess = function onSuccess(e) {
                    if (response.onsuccess && response.onsuccess instanceof  Function) {
                        response.onsuccess();
                    }
                };

                request.onerror = function onError(e) {
                    console.log(event.target.errorCode);
                    if (response.onerror && response.onerror instanceof  Function) {
                        response.onerror(e);
                    }
                };
            });
            return response;
        },

        /**
         * find data by key
         * @param key
         * @param callBack
         */
        findByKey: function (key, callBack) {
            excuteOperator(function () {
                try {
                    var transaction = db.transaction([STORE_RECORD], "readwrite");
                    var store = transaction.objectStore(STORE_RECORD);
                    var str;
                    if (db != null) {
                        store.get(key).onsuccess = function onSuccess(e) {
                            str = e.target.result;
                            if (callBack && callBack instanceof Function) {
                                callBack(str);
                            }
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            })
        },

        /**
         * updateByIndex
         * @param key
         * @param value
         * @param index
         * @returns {{}}
         */
        updateByIndex: function (key, value, index) {
            var result = {};
            excuteOperator(function () {
                try {
                    var transaction = db.transaction([STORE_RECORD], "readwrite");
                    var store = transaction.objectStore(STORE_RECORD);
                    var str;
                    if (db != null) {
                        var rq = store.get(key);
                        rq.onsuccess = function onSuccess(event) {
                            str = event.target.result;
                            if (!str) {
                                return;
                            }

                            if ("tokenId" === index) {
                                str.tokenId = value;
                            } else if ("fileUpdate" === index) {
                                str.fileUpdated = "fileUpdated";
                            }

                            var request = store.put(str);
                            request.onsuccess = function onSuccess(event) {
                                console.log("update success");
                                if (result.onsuccess && result.onsuccess instanceof  Function) {
                                    result.onsuccess(key);
                                }
                            };

                            request.onerror = function onError(event) {
                                console.log("update fail");
                                if (result.onerror && result.onerror instanceof  Function) {
                                    result.onerror();
                                }
                            };
                        };
                        rq.onerror = function onError(e) {
                            console.log(e);
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            });
            return result;
        },

        /**
         * 更新数据
         * @param record 要更新的对象
         * @returns {{}}
         */
        update: function (record) {
            var result = {};
            excuteOperator(function () {
                var transaction = db.transaction([STORE_RECORD], "readwrite");
                var store = transaction.objectStore(STORE_RECORD);

                var request = store.put(record);

                request.onsuccess = function onSuccess(evt) {
                    console.log(TAG + "update successful");
                    if (result.onsuccess && result.onsuccess instanceof  Function) {
                        result.onsuccess();
                    }
                };

                request.onerror = function onError(evt) {
                    console.log(TAG + "function error");
                    if (result.onerror && result.onerror instanceof  Function) {
                        result.onerror();
                    }
                };
            });
            return result;
        }
    };

    this.DataBase = {
        RecordBLL: RecordObjBLL
    };
}).apply(this);


