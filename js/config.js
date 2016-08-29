/**
 * Created by songlin.ji on 2015/2/13.
 */

'use strict';

window.addEventListener('DOMContentLoaded', function () {
    const TAG = "CONFIG:";
    const STORAGE_INTERNAL = "0";
    const STORAGE_EXTERNAL = "1";

    var translate = navigator.mozL10n.get;

    var back;
    if (back = document.getElementById('back')) {
        back.onclick = function click() {
            parent.document.getElementById("window").style.display = 'block';
            parent.document.getElementById("recordFrame").setAttribute('hidden', null);
            parent.document.getElementById("optionFrame").setAttribute('hidden', null);
            parent.document.getElementById('nextFrame').setAttribute('hidden', null);
        };
    }

    /*Stage*/
    var btnStage = document.getElementById('btn_stage');
    var stageRequest = getStage();

    stageRequest.onsuccess = function success(stage) {

        if (needUpdate(stage, AppSetting.stage.get())) {
            AppSetting.stage.set(stage);

            if (AppSetting.stageID.get()) {
                AppSetting.stageID.set(null);
            }
        }

        var stageID;
        if (stageID = AppSetting.stageID.get()) {
            setStage(stageID);
        } else {
            asyncStage();
            btnStage.onclick = asyncStage;
        }
    };

    stageRequest.onerror = function error(event) {
        alert(translate("config_getStage_error"));
    };


    function needUpdate(stage, localStage) {
        for (var key in stage) {
            if (stage[key]) {
                if (stage[key] != localStage[key]) {
                    return true;
                }
            } else if (localStage[key] && localStage[key] !== "0") {
                return true;
            }
        }

        return false;
    }


    function asyncStage() {
        var inStage;
        if (inStage = document.getElementById('in_stage')) {

            btnStage.disabled = true;

            inStage.setAttribute("rotate", null);

            var asyncError = function () {
                inStage.removeAttribute('rotate');
                btnStage.disabled = false;
            };

            var response = travel.formatStage(AppSetting.stage.get());

            response.onsuccess = function success(event) {
                console.log(TAG + 'format stage success');
                if (event.code == 0) {
                    AppSetting.stageID.set(event.body.stage);
                    setStage(event.body.stage);
                } else {
                    asyncError();
                }
            };

            response.onerror = asyncError;

            response.ontimeout = asyncError;
        }
    }


    function setStage(value) {
        btnStage.innerHTML = value;
        btnStage.disabled = false;
    }


    /* notice */
    var btnNotice = document.getElementById('btn_notice');
    var inNotice = document.getElementById('in_notice');

    var notification;

    function checkNoticeStatus() {
        if (AppSetting.notice.get() == 'true') {
            inNotice.setAttribute('src', '../img/opened.png');

            navigator.mozApps.getSelf().onsuccess = function (evt) {
                var app = evt.target.result;
                notification = new Notification("LogMan", {
                    body: translate('config_notice_title'),
                    icon: app.origin + '/img/icons/bug_man_48.png'
                });

                notification.addEventListener('click', function () {
                    app.launch();
                });
            };
        } else {
            inNotice.setAttribute('src', '../img/closed.png');

            if (notification) {
                notification.close();
            }

        }
    }

    btnNotice.onclick = function () {

        AppSetting.notice.set(!(AppSetting.notice.get() == 'true'));

        checkNoticeStatus();
    };

    checkNoticeStatus();


    /*Running Status*/
    var btnStatus = document.getElementById('btn_run');
    var inputStatus = document.getElementById('in_run');

    btnStatus.onclick = function () {
        if (QXDM.status() || Logcat.status()) {
            stopJRD();
        } else {
            startJRD();
        }
    };

    var callBack;

    function reqSuccess() {
        checkJrdStatus();

        if (callBack && callBack instanceof Function) {
            callBack();
            callBack = null;
        }
        btnStatus.disabled = false;
    }

    function reqError() {
        checkJrdStatus();
        btnStatus.disabled = false;
    }

    function startJRD() {
        function startLogcat() {
            if (Logcat.status()) {

                reqSuccess();

            } else {
                var req = Logcat.start();
                req.onsuccess = reqSuccess;
                req.onerror = reqError;
            }
        }

        function startQxdm() {
            if (QXDM.status()) {

                reqSuccess();
            } else {

                var req = QXDM.start();
                req.onsuccess = reqSuccess;
                req.onerror = reqError;
            }
        }

        if (AppSetting.qxdmDeault.get() === 'true' && AppSetting.logcatDeault.get() === 'true') {
            if (QXDM.status()) {
                startLogcat();
            } else {
                var start = QXDM.start();

                start.onsuccess = startLogcat;

                start.onerror = reqError;
            }
        } else {
            if (AppSetting.qxdmDeault.get() == 'true') {
                startQxdm();
            } else if (AppSetting.logcatDeault.get() == 'true') {
                startLogcat();
            }
        }
    }

    function stopJRD() {
        var req;
        if (QXDM.status() && Logcat.status()) {
            var stop = QXDM.stop();
            stop.onsuccess = function success() {
                req = Logcat.stop();

                req.onsuccess = reqSuccess;

                req.onerror = reqError;
            };

            stop.onerror = reqError;
        } else {
            if (QXDM.status()) {
                req = QXDM.stop();
            } else {
                req = Logcat.stop();
            }

            req.onsuccess = reqSuccess;

            req.onerror = reqError;
        }
    }

    function reStartJRD() {
        callBack = startJRD;
        stopJRD();
    }


    var tag_qxdm = document.getElementById('tag_qxdm');

    var tag_logcat = document.getElementById('tag_logcat');

    function checkJrdStatus() {
        var qxdmStatus = QXDM.status();

        qxdmStatus ? tag_qxdm.hidden = false : tag_qxdm.hidden = true;

        var logcatStatus = Logcat.status();

        logcatStatus ? tag_logcat.hidden = false : tag_logcat.hidden = true;

        if (qxdmStatus || logcatStatus) {
            inputStatus.setAttribute("src", "../img/opened.png");
        } else {
            inputStatus.setAttribute("src", "../img/closed.png");
        }
    }

    startJRD();


    /* Storage */
    var internal = document.getElementById('in_internal');
    var external = document.getElementById('in_external');

    function checkStorage() {
        var storagePosition;
        if (storagePosition = AppSetting.storagePosition.get()) {
            if (storagePosition == STORAGE_INTERNAL) {
                internal.checked = true;
            } else if (storagePosition == STORAGE_EXTERNAL) {
                external.checked = true;
            } else {
                AppSetting.storagePosition.set(STORAGE_INTERNAL);
                internal.checked = true;
            }
        } else {
            AppSetting.storagePosition.set(STORAGE_INTERNAL);
            internal.checked = true;
        }
    }

    checkStorage();

    internal.onchange = function change(event) {
        storageChanged();
    };

    external.onchange = function change(event) {
        storageChanged();
    };

    function storageChanged() {
        if (internal.checked) {
            AppSetting.storagePosition.set(STORAGE_INTERNAL);
        } else {
            AppSetting.storagePosition.set(STORAGE_EXTERNAL);
        }

        if (QXDM.status() || Logcat.status()) {
            reStartJRD()
        }

        checkStorage();
    }


    const UNIT_G = 'G';
    const UNIT_B = 'B';
    const UNIT_K = 'K';
    const UNIT_M = 'M';

    function changeUnit(value, unit) {
        if (unit === UNIT_G) {
            return value.toFixed(2) + unit;
        }

        if (value >= 1024) {
            switch (unit) {
                case UNIT_B:
                    return changeUnit(value / 1024, UNIT_K);
                case UNIT_K:
                    return changeUnit(value / 1024, UNIT_M);
                case UNIT_M:
                    return changeUnit(value / 1024, UNIT_G);
            }
        } else {
            return value.toFixed(2) + unit;
        }
    }

    (function () {
        var internal_remainder = document.getElementById('internal_remainder');

        var external_remainder = document.getElementById('external_remainder');

        var card0 = navigator.getDeviceStorages('sdcard')[0];

        var card1 = navigator.getDeviceStorages('sdcard')[1];

        card0.onchange = function () {
            checkCard0();
        };

        card1.onchange = function () {
            checkCard1();
        };

        const SDCARD_AVAILABLE = 'available';

        function checkCard0() {
            card0.available().onsuccess = function success(event) {
                if (event.target.result === SDCARD_AVAILABLE) {
                    internal.disabled = false;
                    card0.freeSpace().onsuccess = function freeSuccess(even) {
                        var free = even.target.result / (1024 * 1024);
                        card0.usedSpace().onsuccess = function usedSuccess(e) {
                            var used = e.target.result / (1024 * 1024);
                            internal_remainder.innerHTML = changeUnit(free, UNIT_M) + '/' + changeUnit(used + free, UNIT_M);
                        }
                    }
                } else {
                    internal_remainder.innerHTML = translate('config_unavailable');
                    internal.disabled = true;
                }
            };
        }

        function checkCard1() {
            card1.available().onsuccess = function success(event) {
                if (event.target.result === SDCARD_AVAILABLE) {
                    external.disabled = false;
                    card1.freeSpace().onsuccess = function freeSuccess(even) {
                        var free = even.target.result / (1024 * 1024);
                        card1.usedSpace().onsuccess = function usedSuccess(e) {
                            var used = e.target.result / (1024 * 1024);
                            external_remainder.innerHTML = changeUnit(free, 'M') + '/' + changeUnit(used + free, 'M');
                        }
                    }
                } else {
                    external.disabled = true;
                    external_remainder.innerHTML = translate('config_unavailable');
                    if (external.checked) {
                        internal.checked = true;
                        storageChanged();
                    }
                }
            };
        }

        checkCard0();

        checkCard1();
    })();


    var in_qxdm = document.getElementById('in_qxdm');
    var div_qxdm_size = document.getElementById('div_qxdm_size');
    var div_qxdm_cfg = document.getElementById('div_qxdm_cfg');


    function checkQxdmStatus() {
        if (AppSetting.qxdmDeault.get() == 'true') {
            in_qxdm.checked = true;
            div_qxdm_size.hidden = false;
            div_qxdm_cfg.hidden = false;
        } else {
            in_qxdm.checked = false;
            div_qxdm_size.hidden = true;
            div_qxdm_cfg.hidden = true;
        }
    }

    checkQxdmStatus();

    in_qxdm.onchange = function changed(event) {
        var value = event.target.checked;
        AppSetting.qxdmDeault.set(value);

        if (value) {
            if (!QXDM.status()) {
                var req = QXDM.start();
                req.onsuccess = function success() {
                    checkJrdStatus();
                };

                req.onerror = function error() {
                    checkJrdStatus();
                };
            }
        } else {
            if (QXDM.status()) {
                var req = QXDM.stop();
                req.onsuccess = function success() {
                    checkJrdStatus();
                };

                req.onerror = function error() {
                    checkJrdStatus();
                };
            }
        }

        checkQxdmStatus();
    };


    var spQxdmSize = document.getElementById('sp_qxdm_size');
    var inQxdmSize = document.getElementById('in_qxdm_size');

    function checkQxdmSize() {
        var size = parseInt(QXDM.size());
        inQxdmSize.value = size;
        spQxdmSize.innerHTML = String(size * 2);
        inQxdmSize.disabled = false;

    }

    checkQxdmSize();

    inQxdmSize.onchange = function (event) {
        inQxdmSize.disabled = true;
        AppSetting.qxdmSize.set(event.target.value);
        if (QXDM.status()) {
            reStartQxdm();
        } else {
            inQxdmSize.disabled = false;
        }
    };

    function reStartQxdm() {
        var req = QXDM.stop();
        req.onsuccess = function success() {
            checkJrdStatus();

            var req1 = QXDM.start();
            req1.onsuccess = function success() {
                checkJrdStatus();
                checkQxdmSize();
            };

            req1.onerror = error;
        };

        req.onerror = error;

        function error(event) {
            inQxdmSize.disabled = false;
        }
    }


    var cfg = document.getElementById('cfg');
    cfg.innerHTML = JRDLog.root() + "/diag.cfg";


    var in_logcat = document.getElementById('in_logcat');

    var in_logcat_mms = document.getElementById('in_logcat_mms');

    var in_logcat_fota = document.getElementById('in_logcat_fota');

    var div_mms = document.getElementById('div_mms');
    var div_fota = document.getElementById('div_fota');

    function checkLogcat() {

        if (AppSetting.logcatDeault.get() === 'true') {
            in_logcat.checked = true;
            div_mms.hidden = false;
            div_fota.hidden = false;
        } else {
            in_logcat.checked = false;
            div_mms.hidden = true;
            div_fota.hidden = true;
        }

        in_logcat_mms.checked = (AppSetting.mmsDefault.get() === 'true');

        in_logcat_fota.checked = (AppSetting.fotaDefault.get() === 'true');
    }

    checkLogcat();

    in_logcat.onchange = function changed(event) {
        var value = event.target.checked;
        AppSetting.logcatDeault.set(value);

        if (value) {
            if (!Logcat.status()) {
                var reqStart = Logcat.start();
                reqStart.onsuccess = result;

                reqStart.onerror = result;
            }
        } else {
            if (Logcat.status()) {
                var reqStop = Logcat.stop();
                reqStop.onsuccess = result;

                reqStop.onerror = result;
            }
        }

        function result(event) {
            checkJrdStatus();

            checkLogcat();
        }
    };

    in_logcat_mms.onchange = function change(event) {
        var value = event.target.checked;
        AppSetting.mmsDefault.set(value);

        if (Logcat.status()) {
            reStartLogcat();
        }
    };

    in_logcat_fota.onchange = function change(event) {
        var value = event.target.checked;
        AppSetting.fotaDefault.set(value);

        if (Logcat.status()) {
            reStartLogcat();
        }
    };

    function reStartLogcat() {
        var req = Logcat.stop();
        req.onsuccess = function success() {
            checkJrdStatus();

            var req1 = Logcat.start();
            req1.onsuccess = result;
            req1.onerror = result;
        };

        req.onerror = result;

        function result(event) {
            checkJrdStatus();
            checkLogcat();
        }
    }

    /* LOG_PHONE */
    var in_phone_logcat = document.getElementById('in_phone_logcat');
    var in_phone_qxdm = document.getElementById('in_phone_qxdm');

    var logPhone;

    function checkPhoneType() {
        logPhone = AppSetting.LogPhone.get();
        in_phone_qxdm.checked = logPhone.qxdm == "true";
        in_phone_logcat.checked = logPhone.logcat == "true";
    }

    in_phone_qxdm.onchange = function (event) {
        logPhone.qxdm = event.target.checked;
        AppSetting.LogPhone.set(logPhone);
        checkPhoneType();
    };

    in_phone_logcat.onchange = function (event) {
        logPhone.logcat = event.target.checked;
        AppSetting.LogPhone.set(logPhone);
        checkPhoneType();
    };

    checkPhoneType();


    /* LOG_MESSAGE */
    var in_message_logcat = document.getElementById('in_message_logcat');
    var in_message_qxdm = document.getElementById('in_message_qxdm');

    var logMessage;

    function checkMessageType() {
        logMessage = AppSetting.LogMessage.get();
        in_message_qxdm.checked = logMessage.qxdm == "true";
        in_message_logcat.checked = logMessage.logcat == "true";
    }

    in_message_qxdm.onchange = function (event) {
        logMessage.qxdm = event.target.checked;
        AppSetting.LogMessage.set(logMessage);
        checkMessageType();
    };

    in_message_logcat.onchange = function (event) {
        logMessage.logcat = event.target.checked;
        AppSetting.LogMessage.set(logMessage);
        checkMessageType();
    };

    checkMessageType();

    /* LOG_CONTACT */
    var in_contact_qxdm = document.getElementById('in_contact_qxdm');
    var in_contact_logcat = document.getElementById('in_contact_logcat');

    var logContact;

    function checkContactType() {
        logContact = AppSetting.LogContact.get();
        in_contact_qxdm.checked = logContact.qxdm == "true";
        in_contact_logcat.checked = logContact.logcat == "true";
    }

    in_contact_qxdm.onchange = function (event) {
        logContact.qxdm = event.target.checked;
        AppSetting.LogContact.set(logContact);
        checkContactType();
    };

    in_contact_logcat.onchange = function (event) {
        logContact.logcat = event.target.checked;
        AppSetting.LogContact.set(logContact);
        checkContactType();
    };

    checkContactType();

    /* LOG_NET */
    var in_net_qxdm = document.getElementById('in_net_qxdm');
    var in_net_logcat = document.getElementById('in_net_logcat');

    var logNet;

    function checkNetType() {
        logNet = AppSetting.LogNetwork.get();
        in_net_qxdm.checked = logNet.qxdm == "true";
        in_net_logcat.checked = logNet.logcat == "true";
    }

    in_net_qxdm.onchange = function (event) {
        logNet.qxdm = event.target.checked;
        AppSetting.LogNetwork.set(logNet);
        checkNetType();
    };

    in_net_logcat.onchange = function (event) {
        logNet.logcat = event.target.checked;
        AppSetting.LogNetwork.set(logNet);
        checkNetType();
    };

    checkNetType();


    /* LOG_WIFI */
    var in_wifi_qxdm = document.getElementById('in_wifi_qxdm');
    var in_wifi_logcat = document.getElementById('in_wifi_logcat');

    var logWIFI;

    function checkWIFIType() {
        logWIFI = AppSetting.LogWifi.get();
        in_wifi_qxdm.checked = logWIFI.qxdm == "true";
        in_wifi_logcat.checked = logWIFI.logcat == "true";
    }

    in_wifi_qxdm.onchange = function (event) {
        logWIFI.qxdm = event.target.checked;
        AppSetting.LogWifi.set(logWIFI);
        checkWIFIType();
    };

    in_wifi_logcat.onchange = function (event) {
        logWIFI.logcat = event.target.checked;
        AppSetting.LogWifi.set(logWIFI);
        checkWIFIType();
    };

    checkWIFIType();

    /* LOG_Camera */
    var in_camera_qxdm = document.getElementById('in_camera_qxdm');
    var in_camera_logcat = document.getElementById('in_camera_logcat');

    var logCamera;

    function checkCameraType() {
        logCamera = AppSetting.LogCamera.get();
        in_camera_qxdm.checked = logCamera.qxdm == "true";
        in_camera_logcat.checked = logCamera.logcat == "true";
    }

    in_camera_qxdm.onchange = function (event) {
        logCamera.qxdm = event.target.checked;
        AppSetting.LogCamera.set(logCamera);
        checkCameraType();
    };

    in_camera_logcat.onchange = function (event) {
        logCamera.logcat = event.target.checked;
        AppSetting.LogCamera.set(logCamera);
        checkCameraType();
    };

    checkCameraType();


    /* LOG_Apps */
    var in_apps_qxdm = document.getElementById('in_apps_qxdm');
    var in_apps_logcat = document.getElementById('in_apps_logcat');

    var logApps;

    function checkAppsType() {
        logApps = AppSetting.LogApps.get();
        in_apps_qxdm.checked = logApps.qxdm == "true";
        in_apps_logcat.checked = logApps.logcat == "true";
    }

    in_apps_qxdm.onchange = function (event) {
        logApps.qxdm = event.target.checked;
        AppSetting.LogApps.set(logApps);
        checkAppsType();
    };

    in_apps_logcat.onchange = function (event) {
        logApps.logcat = event.target.checked;
        AppSetting.LogApps.set(logApps);
        checkAppsType();
    };

    checkAppsType();

    /* LOG_Power */
    var in_power_qxdm = document.getElementById('in_power_qxdm');
    var in_power_logcat = document.getElementById('in_power_logcat');

    var logPower;

    function checkPowerType() {
        logPower = AppSetting.LogPower.get();
        in_power_qxdm.checked = logPower.qxdm == "true";
        in_power_logcat.checked = logPower.logcat == "true";
    }

    in_power_qxdm.onchange = function (event) {
        logPower.qxdm = event.target.checked;
        AppSetting.LogPower.set(logPower);
        checkPowerType();
    };

    in_power_logcat.onchange = function (event) {
        logPower.logcat = event.target.checked;
        AppSetting.LogPower.set(logPower);
        checkPowerType();
    };

    checkPowerType();


    /* LOG_Other */
    var in_other_qxdm = document.getElementById('in_other_qxdm');
    var in_other_logcat = document.getElementById('in_other_logcat');

    var logOther;

    function checkOtherType() {
        logOther = AppSetting.LogOhers.get();
        in_other_qxdm.checked = logOther.qxdm == "true";
        in_other_logcat.checked = logOther.logcat == "true";
    }

    in_other_qxdm.onchange = function (event) {
        logOther.qxdm = event.target.checked;
        AppSetting.LogOhers.set(logOther);
        checkOtherType();
    };

    in_other_logcat.onchange = function (event) {
        logOther.logcat = event.target.checked;
        AppSetting.LogOhers.set(logOther);
        checkOtherType();
    };

    checkOtherType();
});