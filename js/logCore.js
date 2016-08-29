/**
 * Created by songlin.ji on 2015/1/15.
 *
 * Description: the operate class of jrd
 */

'use strict';
(function (win) {
    const TAG = "JRDLog:";

    const QXDM_SIZE = '50';

    const STORAGE_NAME = 'storage';
    const APP_NAME = 'logman';
    const QXDM_NAME = 'qxdm';
    const RECORD_NAME = 'record';
    const LOGCAT_NAME = 'logcat';

    const STORAGE_INTERNAL = "0";
    const STORAGE_EXTERNAL = "1";

    const LOG_ENABLE = '1';
    const LOG_DISABLE = '0';

    var jrdExtension = navigator.jrdExtension;

    var jrdSetting = navigator.mozSettings;

    var persist = {
        autoEnable: "persist.sys.autolog.enable",
        autoSize: "persist.sys.autolog.props",

        qxdmEnable: "persist.sys.jrdqxdm.enable",
        qxdmPath: "persist.sys.jrdqxdm.path",
        qxdmCFG: "persist.sys.jrddiagcfg.enable",

        logcatEnable: 'persist.sys.jrdlogcat.enable',
        logcatPath: 'persist.sys.jrdlogcat.path',
        logcatFota: 'persist.sys.fotalog.enabled',
        logcatMMS: 'mms.debugging.enabled',

        diagEnable: "persist.sys.jrddiagcfg.enable"
    };

    function getStorageIndex() {
        var position;
        if (position = AppSetting.storagePosition.get()) {
            if (position != STORAGE_INTERNAL && position != STORAGE_EXTERNAL) {
                position = STORAGE_INTERNAL;
            }
        } else {
            position = STORAGE_INTERNAL;
        }

        return parseInt(position);
    }

    function getDefaultStorage() {
        return navigator.getDeviceStorages('sdcard')[getStorageIndex()];
    }

    function getRootPath(index) {
        var storageName;
        if (index && index instanceof Number && index >= 0 && index <= 1) {
            storageName = navigator.getDeviceStorages('sdcard')[index];
        } else {
            storageName = getDefaultStorage().storageName;
        }
        return '/' + STORAGE_NAME + '/' + storageName + '/' + APP_NAME;
    }

    function getQxdmPath() {
        return getRootPath() + '/' + QXDM_NAME;
    }

    function getRecordPath() {
        return getRootPath() + '/' + RECORD_NAME;
    }

    function getLogcatPath() {
        return getRootPath() + '/' + LOGCAT_NAME;
    }

    function getLogcatLogPath() {
        return getLogcatPath() + '/' + 'logcat.log';
    }

    function getQxdmSize() {
        var size;
        if (!(size = AppSetting.qxdmSize.get())) {
            AppSetting.qxdmSize.set(QXDM_SIZE);
            size = QXDM_SIZE;
        }

        return size;
    }

    function responseError(response, event) {
        if (response.onerror && response.onerror instanceof  Function) {
            response.onerror(event);
        }
    }

    function responseSuccess(response, event) {
        if (response.onsuccess && response.onsuccess instanceof  Function) {
            response.onsuccess(event);
        }
    }

    const FILE_EXIST = 'EXIST';

    const FILE_NO_EXIST = 'NO_EXIST';

    function checkFileExist(path) {
        var response = {};

        var fileExistReq = jrdExtension.checkIsFileExist(path);

        fileExistReq.onsuccess = function success(event) {
            if (FILE_EXIST === event.target.result) {
                responseSuccess(response);
            } else if (FILE_NO_EXIST === event.target.result) {
                responseError(response);
            }
        };

        fileExistReq.onerror = function error(e) {
            responseError(response);
        };

        return response;
    }

    function directPath(path) {
        var response = {};

        var request = checkFileExist(path);

        request.onsuccess = function success() {
            responseSuccess(response);
        };

        request.onerror = function error() {
            if (jrdExtension.createnewDirorFile) {
                jrdExtension.createnewDirorFile("DIRECTORY", path);
            } else {
                var a = path.substr(path.indexOf(APP_NAME));
                console.log(a);
                getDefaultStorage().createDirectory(a);
            }
            responseSuccess(response);

            //var req = jrdExtension.createnewDirorFile("DIRECTORY", path);
            //req.onsuccess = function success(event) {
            //    responseSuccess(response);
            //};
            //
            //req.onerror = function error(event) {
            //    responseError(response);
            //};
        };

        return response;
    }

    directPath(getRootPath()).onsuccess = function success() {
        directPath(getQxdmPath());
        directPath(getRecordPath());
        directPath(getLogcatPath());
    };

    function getPropsStatus(key) {
        return jrdExtension.readRoValue(key);
    }

    function setPropsStatus(key, value) {
        var response = {};

        var command = jrdExtension.setPropertyLE || jrdExtension.startUniversalCommand;
        var req = command("setprop " + key + " " + value, true);

        req.onsuccess = function success() {
            console.log(TAG + "setprop  " + key + ":" + value + "success");
            responseSuccess(response);
        };

        req.onerror = function onError() {
            console.log(TAG + "setprop  " + key + ":" + value + "error");
            responseError(response);
        };

        return response;
    }

    function getSettingStatus(key) {
        var response = {};

        var req = jrdSetting.createLock().get(key);

        req.onsuccess = function success() {
            responseSuccess(response, req.result[key]);
        };

        req.onerror = function error() {
            responseError(response);
        };

        return response;
    }

    function setSettingStatus(key, value) {
        var response = {};
        var cset = {};
        cset[key] = value;
        var req = jrdSetting.createLock().get(cset);
        req.onsuccess = function success() {
            responseSuccess(response);
        };

        req.onerror = function error() {
            responseError(response);
        };

        return response;
    }

    function startLogcatLog() {
        var response = {};

        var req = directPath(getLogcatPath());
        req.onsuccess = function success() {
            checkLogcatPathProp(response);
        };

        req.onerror = function error(event) {
            responseError(response);
        };

        return response;
    }

    function stopLogcatLog() {
        var response = {};
        var req = setPropsStatus(persist.logcatEnable, LOG_DISABLE);
        req.onsuccess = function onSuccess() {
            responseSuccess(response);
        };

        req.onerror = function onError() {
            responseError(response);
        };
        return response;
    }


    function checkLogcatPathProp(response) {
        var path = getLogcatLogPath();
        if (getPropsStatus(persist.logcatPath) !== path) {

            var reqLogcatPath = setPropsStatus(persist.logcatPath, path);

            reqLogcatPath.onsuccess = function onSuccess() {
                checkLogcatMMSProp(response);
            };

            reqLogcatPath.onerror = function error(event) {
                responseError(response);
            }
        } else {
            checkLogcatMMSProp(response);
        }
    }

    function checkLogcatMMSProp(response) {
        var mmsEnable = AppSetting.mmsDefault.get();
        if (getPropsStatus(persist.logcatMMS) !== LOG_ENABLE) {
            if (mmsEnable === 'true') {
                var reqMMS = setPropsStatus(persist.logcatMMS, LOG_ENABLE);
                reqMMS.onsuccess = function success() {
                    checkLogcatFotaProp(response);
                };

                reqMMS.onerror = function error(event) {
                    responseError(response);
                };
            } else {
                checkLogcatFotaProp(response);
            }
        } else {
            if (mmsEnable === 'true') {
                checkLogcatFotaProp(response);
            } else {
                var reqMMS = setPropsStatus(persist.logcatMMS, LOG_DISABLE);
                reqMMS.onsuccess = function success() {
                    checkLogcatFotaProp(response);
                };

                reqMMS.onerror = function error(event) {
                    responseError(response);
                };
            }
        }
    }

    function checkLogcatFotaProp(response) {
        var req = getSettingStatus(persist.logcatFota);
        req.onsuccess = function success(value) {
            var fotaEnable = AppSetting.fotaDefault.get();
            if (value) {
                if (fotaEnable === 'true') {
                    startLogcat(response);
                } else {
                    var req1 = setSettingStatus(persist.logcatFota, false);
                    req1.onsuccess = function success() {
                        startLogcat(response);
                    };

                    req1.onerror = function error(event) {
                        responseError(response);
                    }
                }

            } else {
                if (fotaEnable === 'true') {
                    var req1 = setSettingStatus(persist.logcatFota, true);
                    req1.onsuccess = function success() {
                        startLogcat(response);
                    };

                    req1.onerror = function error(event) {
                        responseError(response);
                    }
                } else {
                    startLogcat(response);
                }
            }
        };

        req.onerror = function error() {
            responseError(response);
        }
    }

    function startLogcat(response) {
        var reqLocatEnable = setPropsStatus(persist.logcatEnable, LOG_ENABLE);
        reqLocatEnable.onsuccess = function success() {
            responseSuccess(response);
        };

        reqLocatEnable.onerror = function error(event) {
            responseError(response);
        }
    }


    function startQXDMLog() {
        var response = {};

        var req = directPath(getQxdmPath());
        req.onsuccess = function onSuccess() {
            console.log(TAG + "check qxdm path success");

            var req;
            if (jrdExtension.execCmdLE) {
                var parmArray = new Array();
                parmArray.push('delete_jrdlog_file');
                parmArray.push(getQxdmPath() + '/*.qmdl');
                req = jrdExtension.execCmdLE(parmArray, 2);
            } else {
                var autoCommand = 'rm -r ' + getQxdmPath() + '/*.qmdl';
                req = jrdExtension.startUniversalCommand(autoCommand, true);
            }

            req.onsuccess = function onSuccess() {
                checkQXDMPathProp(response);
            };

            req.onerror = function error(event) {
                responseError(response);
            };
        };

        req.onerror = function error(event) {
            responseError(response);
        };

        return response;
    }

    function stopQXDMLog() {
        console.log(TAG + "qxdm stopping");
        var response = {};
        var req = setPropsStatus(persist.qxdmEnable, LOG_DISABLE);

        req.onsuccess = function onSuccess() {
            responseSuccess(response);
        };

        req.onerror = function onError() {
            responseError(response);
        };

        return response;
    }


    function checkQXDMPathProp(response) {
        var qxdmPath = getQxdmPath();
        if (getPropsStatus(persist.qxdmPath) !== qxdmPath) {
            var reqQxdmPath = setPropsStatus(persist.qxdmPath, qxdmPath);
            reqQxdmPath.onsuccess = function onSuccess() {
                checkQXDMAutoProp(response);
            };

            reqQxdmPath.onerror = function error(event) {
                responseError(response);
            }
        } else {
            checkQXDMAutoProp(response);
        }
    }

    function checkQXDMAutoProp(response) {
        if (getPropsStatus(persist.autoEnable) !== LOG_ENABLE) {
            var reqAutoEnable = setPropsStatus(persist.autoEnable, LOG_ENABLE);
            reqAutoEnable.onsuccess = function onSuccess() {
                checkQXDMSizeProp(response);
            };

            reqAutoEnable.onerror = function error(event) {
                responseError(response);
            }
        } else {
            checkQXDMSizeProp(response);
        }
    }

    function checkQXDMSizeProp(response) {
        var qxdmSize = getQxdmSize();
        if (getPropsStatus(persist.autoSize) !== qxdmSize) {
            var reqAutoProp = setPropsStatus(persist.autoSize, qxdmSize);
            reqAutoProp.onsuccess = function onSuccess() {
                checkQXDMCFGProp(response);
            };

            reqAutoProp.onerror = function error(event) {
                responseError(response);
            };
        } else {
            checkQXDMCFGProp(response);
        }
    }

    function checkQXDMCFGProp(response) {
        var cfgEnable = AppSetting.qxdmCFG.get();
        if (getPropsStatus(persist.qxdmCFG) !== LOG_ENABLE) {
            if (cfgEnable === 'true') {
                var reqQxdmCfg = setPropsStatus(persist.qxdmCFG, LOG_ENABLE);
                reqQxdmCfg.onsuccess = function success() {
                    startQXDM(response);
                };

                reqQxdmCfg.onerror = function error(event) {
                    responseError(response);
                };
            } else {
                startQXDM(response);
            }
        } else {
            if (cfgEnable === 'true') {
                startQXDM(response);
            } else {
                var reqQxdmCfg = setPropsStatus(persist.qxdmCFG, LOG_DISABLE);
                reqQxdmCfg.onsuccess = function success() {
                    startQXDM(response);
                };

                reqQxdmCfg.onerror = function error(event) {
                    responseError(response);
                };
            }
        }
    }

    function startQXDM(response) {
        console.log(TAG + "qxdm starting");
        if (getCatStatus(persist.qxdmEnable) === LOG_ENABLE) {
            responseSuccess(response);
        } else {
            var reqStart = setPropsStatus(persist.qxdmEnable, LOG_ENABLE);
            reqStart.onsuccess = function success() {
                responseSuccess(response);
            };

            reqStart.onerror = function error(event) {
                responseError(response);
            }
        }
    }

    function getQxdmStatus() {
        return getPropsStatus(persist.qxdmEnable) === LOG_ENABLE;
    }

    function getCatStatus() {
        return getPropsStatus(persist.logcatEnable) === LOG_ENABLE;
    }

    function getMMSStatus() {
        return getPropsStatus(persist.logcatMMS) === LOG_ENABLE;
    }

    function getFotaStatus() {
        var response = {};
        var req = getSettingStatus(persist.logcatFota);
        req.onsuccess = function success(event) {
            responseSuccess(response, event);
        };

        req.onerror = function error() {
            responseSuccess(response, null);
        };

        return response;
    }


    function saveLogsByRecordID(recordID, saveType) {
        var response = {};

        var path = getRecordPath() + '/' + recordID;

        var directReq = directPath(path);

        directReq.onsuccess = function success() {
            if (saveType && (saveType.qxdm === 'true' || saveType.logcat === 'true')) {
                var autoCommand = 'busybox tar -czf ' + path.substr(1) + '/log.tar.gz ';
                if (saveType.qxdm === 'true') {
                    autoCommand += getQxdmPath().substr(1) + ' ';
                }

                if (saveType.logcat === 'true') {
                    autoCommand += getLogcatPath().substr(1) + ' ';
                }

                console.log(TAG + autoCommand);
                var req = jrdExtension.startUniversalCommand(autoCommand, true);
                req.onsuccess = function success() {
                    responseSuccess(response);
                };

                req.onerror = function error() {
                    responseError(response);
                };
            } else {
                responseSuccess(response);
            }
        };

        directReq.onerror = function error() {
            responseError(response);
        };

        return response;
    }

    function findLogsByRecordID(recordID, index) {
        var response = {};
        var files = [];
        var st = index === 1 || index === 0 ? navigator.getDeviceStorages('sdcard')[index] : getDefaultStorage();
        var request = st.enumerate(APP_NAME + '/' + RECORD_NAME + '/' + recordID);
        request.onsuccess = function success() {
            console.log(TAG + "getFilesByRecordID success;RecordID " + recordID);
            var file = this.result;
            if (file) {
                files.push(file);
                this.continue();
            } else {
                responseSuccess(response, files);
            }
        };

        request.onerror = function error() {
            console.error(TAG + "getFilesByRecordID error;RecordID " + recordID);
            responseError(response);
        };

        return response;
    }

    function deleteLogsByRecordID(recordID, index) {
        var response = {};

        var autoCommand = 'rm -r ' + getRecordPath(index) + '/' + recordID;

        var command = jrdExtension.execCmdLE || jrdExtension.startUniversalCommand;
        var request = command(autoCommand, true);

        request.onsuccess = function success() {
            responseSuccess(response);
        };

        request.onerror = function error() {
            responseError(response);
        };

        return response;
    }

    win.QXDM = {
        start: startQXDMLog,
        stop: stopQXDMLog,
        size: getQxdmSize,
        status: getQxdmStatus
    };

    win.Logcat = {
        start: startLogcatLog,
        stop: stopLogcatLog,
        status: getCatStatus,
        mmsStatus: getMMSStatus,
        fotaStatus: getFotaStatus
    };

    win.JRDLog = {
        index: getStorageIndex,
        root: getRootPath,
        save: saveLogsByRecordID,
        find: findLogsByRecordID,
        delete: deleteLogsByRecordID
    };
})(window);





