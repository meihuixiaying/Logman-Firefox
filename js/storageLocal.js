/**
 * Created by songlin.ji on 2015/2/12.
 */

(function (win) {
    'use strict';
    const APP_USED = "USED";
    const APP_NOTIFICATION = "NOTIFICATION";

    const STAGE_ID = "STAGE_ID";
    const NOTICE = "NOTICE";
    const STAGE_MODEL = "MODEL";
    const STAGE_IMEI = 'IMEI';
    const STAGE_OPERATOR = "OPERATOR";
    const STAGE_PHONE = "PHONE";
    const STAGE_PLAT = "PLAT";
    const STAGE_BRANCH = "BRANCH";
    const STAGE_PERSO = "PERSO";
    const STAGE_OPERATOR_LONGNAME = "OPERATOR_LONGNAME";
    const STAGE_OPERATOR_SHORTNAME = "OPERATOR_SHORTNAME";

    const LOG_STORAGE_POSITION = "STORAGE_POSITION";
    const LOG_DEFAULT_QXDM = "DEFAULT_QXDM";
    const LOG_QXDM_SIZE = "QXDM_SIZE";
    const LOG_QXDM_CFG = "QXDM_CFG";
    const LOG_DEFAULT_LOGCAT = "DEFAULT_LOGCAT";
    const LOG_DEFAULT_MMS = "DEFAULT_MMS";
    const LOG_DEFAULT_FOTA = "DEFAULT_FOTA";

    const LOG_PHONE_QXDM = "LOG_PHONE_QXDM";
    const LOG_MESSAGE_QXDM = "LOG_MESSAGE_QXDM";
    const LOG_CONTACT_QXDM = "LOG_CONTACT_QXDM";
    const LOG_NET_QXDM = "LOG_NET_QXDM";
    const LOG_WIFI_QXDM = "LOG_WIFI_QXDM";
    const LOG_CAMERA_QXDM = "LOG_CAMERA_QXDM";
    const LOG_APPS_QXDM = "LOG_APPS_QXDM";
    const LOG_POWER_QXDM = "LOG_POWER_QXDM";
    const LOG_OTHERS_QXDM = "LOG_OTHERS_QXDM";

    const LOG_PHONE_LOGCAT = "LOG_PHONE_LOGCAT";
    const LOG_MESSAGE_LOGCAT = "LOG_MESSAGE_LOGCAT";
    const LOG_CONTACT_LOGCAT = "LOG_CONTACT_LOGCAT";
    const LOG_NET_LOGCAT = "LOG_NET_LOGCAT";
    const LOG_WIFI_LOGCAT = "LOG_WIFI_LOGCAT";
    const LOG_CAMERA_LOGCAT = "LOG_CAMERA_LOGCAT";
    const LOG_APPS_LOGCAT = "LOG_APPS_LOGCAT";
    const LOG_POWER_LOGCAT = "LOG_POWER_LOGCAT";
    const LOG_OTHERS_LOGCAT = "LOG_OTHERS_LOGCAT";


    const RECORD_HAVA_DATA = "RECORD_HAVA_DATA";

    const RECORD_UPLOADIN = "RECORD_UPLOADIN";

    var Config = {
        Configurable: false
    };

    Config.used = {
        get: function () {
            return convertNullValue(APP_USED);
        },
        set: function (value) {
            localStorage.setItem(APP_USED, value)
        },
        Configurable: false
    };

    Config.notification = {
        get: function () {
            return convertNullValue(APP_NOTIFICATION);
        },
        set: function (value) {
            localStorage.setItem(APP_NOTIFICATION, value);
        },
        Configurable: false
    };

    Config.stage = {
        Configurable: false,
        get: function () {
            return {
                model: convertNullValue(STAGE_MODEL),
                imei: convertNullValue(STAGE_IMEI),
                operator: convertNullValue(STAGE_OPERATOR),
                phone: convertNullValue(STAGE_PHONE),
                plat: convertNullValue(STAGE_PLAT),
                branch: convertNullValue(STAGE_BRANCH),
                perso: convertNullValue(STAGE_PERSO),
                operatorLongName: convertNullValue(STAGE_OPERATOR_LONGNAME),
                operatorShortName: convertNullValue(STAGE_OPERATOR_SHORTNAME)
            }
        },
        set: function (value) {
            localStorage.setItem(STAGE_MODEL, value.model);
            localStorage.setItem(STAGE_IMEI, value.imei);
            localStorage.setItem(STAGE_OPERATOR, value.operator);
            localStorage.setItem(STAGE_PHONE, value.phone);
            localStorage.setItem(STAGE_PLAT, value.plat);
            localStorage.setItem(STAGE_BRANCH, value.branch);
            localStorage.setItem(STAGE_PERSO, value.perso);
            localStorage.setItem(STAGE_OPERATOR_LONGNAME, value.operatorLongName);
            localStorage.setItem(STAGE_OPERATOR_SHORTNAME, value.operatorShortName);
        }
    };

    Config.stageID = {
        get: function () {
            return convertNullValue(STAGE_ID);
        },
        set: function (value) {
            localStorage.setItem(STAGE_ID, value);
        }
    };

    Config.notice = {
        get: function () {
            return convertNullValue(NOTICE);
        },
        set: function (value) {
            localStorage.setItem(NOTICE, value);
        }
    };

    Config.storagePosition = {
        get: function () {
            return convertNullValue(LOG_STORAGE_POSITION);
        },
        set: function (value) {
            localStorage.setItem(LOG_STORAGE_POSITION, value);
        }
    };

    Config.qxdmDeault = {
        get: function () {
            return convertTrueValue(LOG_QXDM_SIZE);
        },
        set: function (value) {
            localStorage.setItem(LOG_QXDM_SIZE, value);
        }
    };

    Config.qxdmSize = {
        get: function () {
            return convertNullValue(LOG_DEFAULT_QXDM);
        },
        set: function (value) {
            localStorage.setItem(LOG_DEFAULT_QXDM, value);
        }
    };

    Config.qxdmCFG = {
        get: function () {
            return convertFalseValue(LOG_QXDM_CFG);
        },
        set: function (value) {
            localStorage.setItem(LOG_QXDM_CFG, value);
        }
    };

    Config.logcatDeault = {
        get: function () {
            return convertTrueValue(LOG_DEFAULT_LOGCAT);
        },
        set: function (value) {
            localStorage.setItem(LOG_DEFAULT_LOGCAT, value);
        }
    };

    Config.mmsDefault = {
        get: function () {
            return convertTrueValue(LOG_DEFAULT_MMS);
        },
        set: function (value) {
            localStorage.setItem(LOG_DEFAULT_MMS, value);
        }
    };

    Config.fotaDefault = {
        get: function () {
            return convertTrueValue(LOG_DEFAULT_FOTA);
        },
        set: function (value) {
            localStorage.setItem(LOG_DEFAULT_FOTA, value);
        }
    };


    Config.Reset = function () {
        localStorage.clear();
    };

    Config.LogPhone = {
        get: function () {
            return {
                qxdm: convertTrueValue(LOG_PHONE_QXDM),
                logcat: convertTrueValue(LOG_PHONE_LOGCAT)
            }
        },
        set: function (value) {
            localStorage.setItem(LOG_PHONE_QXDM, value.qxdm);
            localStorage.setItem(LOG_PHONE_LOGCAT, value.logcat);
        }
    };

    Config.LogMessage = {
        get: function () {
            return {
                qxdm: convertTrueValue(LOG_MESSAGE_QXDM),
                logcat: convertTrueValue(LOG_MESSAGE_LOGCAT)
            }
        },
        set: function (value) {
            localStorage.setItem(LOG_MESSAGE_QXDM, value.qxdm);
            localStorage.setItem(LOG_MESSAGE_LOGCAT, value.logcat);
        }
    };

    Config.LogContact = {
        get: function () {
            return {
                qxdm: convertTrueValue(LOG_CONTACT_QXDM),
                logcat: convertTrueValue(LOG_CONTACT_LOGCAT)
            }
        },
        set: function (value) {
            localStorage.setItem(LOG_CONTACT_QXDM, value.qxdm);
            localStorage.setItem(LOG_CONTACT_LOGCAT, value.logcat);
        }
    };

    Config.LogNetwork = {
        get: function () {
            return {
                qxdm: convertTrueValue(LOG_NET_QXDM),
                logcat: convertTrueValue(LOG_NET_LOGCAT)
            }
        },
        set: function (value) {
            localStorage.setItem(LOG_NET_QXDM, value.qxdm);
            localStorage.setItem(LOG_NET_LOGCAT, value.logcat);
        }
    };

    Config.LogWifi = {
        get: function () {
            return {
                qxdm: convertTrueValue(LOG_WIFI_QXDM),
                logcat: convertTrueValue(LOG_WIFI_LOGCAT)
            }
        },
        set: function (value) {
            localStorage.setItem(LOG_WIFI_QXDM, value.qxdm);
            localStorage.setItem(LOG_WIFI_LOGCAT, value.logcat);
        }
    };

    Config.LogCamera = {
        get: function () {
            return {
                qxdm: convertTrueValue(LOG_CAMERA_QXDM),
                logcat: convertTrueValue(LOG_CAMERA_LOGCAT)
            }
        },
        set: function (value) {
            localStorage.setItem(LOG_CAMERA_QXDM, value.qxdm);
            localStorage.setItem(LOG_CAMERA_LOGCAT, value.logcat);
        }
    };

    Config.LogApps = {
        get: function () {
            return {
                qxdm: convertTrueValue(LOG_APPS_QXDM),
                logcat: convertTrueValue(LOG_APPS_LOGCAT)
            }
        },
        set: function (value) {
            localStorage.setItem(LOG_APPS_QXDM, value.qxdm);
            localStorage.setItem(LOG_APPS_LOGCAT, value.logcat);
        }
    };

    Config.LogPower = {
        get: function () {
            return {
                qxdm: convertTrueValue(LOG_POWER_QXDM),
                logcat: convertTrueValue(LOG_POWER_LOGCAT)
            }
        },
        set: function (value) {
            localStorage.setItem(LOG_POWER_QXDM, value.qxdm);
            localStorage.setItem(LOG_POWER_LOGCAT, value.logcat);
        }
    };

    Config.LogOhers = {
        get: function () {
            return {
                qxdm: convertTrueValue(LOG_OTHERS_QXDM),
                logcat: convertTrueValue(LOG_OTHERS_LOGCAT)
            }
        },
        set: function (value) {
            localStorage.setItem(LOG_OTHERS_QXDM, value.qxdm);
            localStorage.setItem(LOG_OTHERS_LOGCAT, value.logcat);
        }
    };

    Config.Uploading = {
        get: function () {
            return convertFalseValue(RECORD_UPLOADIN);
        },
        set: function (value) {
            localStorage.setItem(RECORD_UPLOADIN, value);
        }
    };

    Config.HaveNewData = {
        get: function () {
            return convertFalseValue(RECORD_HAVA_DATA);
        },
        set: function (value) {
            localStorage.setItem(RECORD_HAVA_DATA, value);
        }
    };

    win.AppSetting = Config;

    function convertNullValue(value) {
        var item = localStorage.getItem(value);
        if (!item || item === 'null' || item === 'undefined') {
            item = null;
        }

        return item;
    }

    function convertTrueValue(value) {
        var item = localStorage.getItem(value);
        if (!item || item === 'null' || item === 'undefined') {
            item = 'true';
        }

        return item;
    }

    function convertFalseValue(value) {
        var item = localStorage.getItem(value);
        if (!item || item === 'null' || item === 'undefined') {
            item = 'false';
        }

        return item;
    }

})(window);
