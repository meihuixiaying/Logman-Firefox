'use strict';

var callPage = {
    title: "module_call",
    selects: ["call_poor_voice_quality", "call_drop", "call_cannot_answer", "call_cannot_hang_up_the_call", "call_no_incoming_call_interface", "call_no_ringing_vibration", "call_cannot_make_a_call"]
};
var messagePage = {
    title: "module_message",
    selects: ["message_send_failed", "message_receive_failed", "message_abnormal_display", "message_abnormal_input_method", "message_attachments_insert_exception", "message_delete_exception", "message_failed_download_attachments"]
};
var contactPage = {
    title: "module_contact",
    selects: ["contact_cannot_create", "contact_cannot_make_call", "contact_import_or_export_failed", "contact_cannot_share", "contact_cannot_delete", "contact_cannot_search", "contact_sorting_error"]
};
var intenetPage = {
    title: "module_network",
    selects: ["network_weak_signal", "network_unable_use_3G", "network_slow_download_speed", "network_slow_internet_speed", "network_webpage_display_exception", "network_slow_hotspot_speed", "network_slow_tethering_speed"]
};
var cameraPage = {
    title: "module_camera",
    selects: ["camera_poor_capture_effects", "camera_focus_abnormal", "camera_video_abnormal", "camera_flash_abnormal", "camera_scan_QR_abnormity", "camera_interface_display_abnormal"]
};
var wifi_btPage = {
    title: "module_wifi",
    selects: ["wifi_connection_exception", "wifi_signal_is_weak", "wifi_upload_or_download_speed_is_slow", "wifi_switching_exception", "bt_pairing_exception", "bt_searching_ability", "bt_disconnecting_exception"]
};
var powerPage = {
    title: "module_power",
    selects: ["power_consumption_too_fast", "power_unable_to_be_charged", "power_unable_to_power_on", "power_incorrect_battery_data", "power_shutdown_automatically"]
};
var otherPage = {
    title: "module_others",
    selects: ["other_virtual_keyboard_toch_inaccurate", "other_USB_sharing_switch_invalid", "other_unable_light_up_screen", "other_screen_unlock_abnormality", "other_interface_abnormality"]
};
window.addEventListener("load", function () {
    var savingRecode = false;
    var translate = navigator.mozL10n.get;
    var textTitle = document.getElementById("titleText");
    var optionFrame = parent.document.getElementById("optionFrame");
    var mainWin = parent.document.getElementById("window");
    var recordFrame = parent.document.getElementById('recordFrame');
    var nextFrame = parent.document.getElementById('nextFrame');
    textTitle.oninput = function onInput() {
        var newText = textTitle.value;
        var labels = document.getElementsByTagName("label");
        for (var j = 0; j < clicked.length; j++) {
            if (newText.indexOf(labels[parseInt(clicked[j])].childNodes[1].innerHTML) == -1) {
                labels[parseInt(clicked[j])].childNodes[0].checked = false;
                clicked.splice(j, 1);
            }
        }
        for (var i = 0; i < labels.length; i++) {
            if (newText.indexOf(labels[i].childNodes[1].innerHTML) != -1) {
                labels[i].childNodes[0].checked = true;
                clicked.push(i);
            }
        }
    };

    var back = document.getElementById('back');
    if (back) {
        back.onclick = function click() {
            if (savingRecode) {
                return;
            }
            optionFrame.src = "";
            mainWin.style.display = 'block';
            recordFrame.setAttribute("hidden", null);
            optionFrame.setAttribute('hidden', null);
            nextFrame.setAttribute('hidden', null);
        };
    }

    /**
     * 获取进入页面的name
     * @returns {*} 如果有name则返回，没有那么则返回-1
     */
    function getName() {
        var name = '-1';
        var index;
        var url = document.location.toString();
        if ((index = url.lastIndexOf("?") != -1)) {
            name = url.substr(index + 1).split("=")[1];
        }
        return name;
    }

    /**
     * 根据页面name进行判断页面控件中传入的值
     * @param name 页面返回的name
     */
    function setPage(name) {
        var checkBox;
        var label;
        var btn;

        function setOptions(optionData, index) {
            label = document.createElement("label");
            checkBox = document.createElement('input');
            btn = document.createElement("button");
            checkBox.setAttribute("type", "checkbox");
            btn.setAttribute("class", "topcoat-button-bar__button");
            label.setAttribute("id", index + "");
            label.setAttribute("name", "label");
            label.setAttribute("class", "topcoat-button-bar__item");
            btn.innerHTML = translate(optionData);
            label.appendChild(checkBox);
            label.appendChild(btn);
            div.appendChild(label);
        }

        if (name !== "-1") {
            var i = 0;
            var title = document.getElementById("titleDiv");
            var imgId = document.getElementById("imgId");
            var div = document.getElementById("options");

            if (name == NAME_CALL) {
                title.innerHTML = translate(callPage.title);
                imgId.innerHTML = NAME_CALL + "";
                for (i = 0; i < callPage.selects.length; i++) {
                    setOptions(callPage.selects[i], i);
                }
            }
            else if (name == NAME_MESSAGE) {
                title.innerHTML = translate(messagePage.title);
                imgId.innerHTML = NAME_MESSAGE + "";
                for (i = 0; i < messagePage.selects.length; i++) {
                    setOptions(messagePage.selects[i], i);
                }
            } else if (name == NAME_CONTACT) {
                title.innerHTML = translate(contactPage.title);
                imgId.innerHTML = NAME_CONTACT + "";
                for (i = 0; i < contactPage.selects.length; i++) {
                    setOptions(contactPage.selects[i], i);
                }
            } else if (name == NAME_NETWORK) {
                title.innerHTML = translate(intenetPage.title);
                imgId.innerHTML = NAME_NETWORK + "";
                for (i = 0; i < intenetPage.selects.length; i++) {
                    setOptions(intenetPage.selects[i], i);
                }
            } else if (name == NAME_WIFI) {
                title.innerHTML = translate(wifi_btPage.title);
                imgId.innerHTML = NAME_WIFI + "";
                for (i = 0; i < wifi_btPage.selects.length; i++) {
                    setOptions(wifi_btPage.selects[i], i);
                }
            } else if (name == NAME_CAMERA) {
                title.innerHTML = translate(cameraPage.title);
                imgId.innerHTML = NAME_CAMERA + "";
                for (i = 0; i < cameraPage.selects.length; i++) {
                    setOptions(cameraPage.selects[i], i);
                }
            } else if (name == NAME_APPS) {
                title.innerHTML = translate('module_apps');
                imgId.innerHTML = NAME_APPS + "";
                navigator.mozApps.mgmt.getAll().onsuccess = function success(event) {
                    var apps = event.target.result;
                    apps.forEach(function (app) {
                        if (!app.removable) {
                            label = document.createElement("label");
                            checkBox = document.createElement('input');
                            btn = document.createElement("button");
                            checkBox.setAttribute("type", "radio");
                            checkBox.setAttribute("name", "topcoat");
                            btn.setAttribute("class", "topcoat-button-bar__button");
                            label.setAttribute("id", i++ + "");
                            label.setAttribute("name", "label");
                            label.setAttribute("class", "topcoat-button-bar__item");
                            var lan = navigator.mozL10n.language.code;
                            if (app.manifest.locales) {
                                if (app.manifest.locales[lan] && app.manifest.locales[lan].name) {
                                    btn.innerHTML = app.manifest.locales[lan].name;
                                } else {
                                    btn.innerHTML = app.manifest.name;
                                }
                            } else {
                                btn.innerHTML = app.manifest.name;
                            }
                            checkBox.onclick = function () {
                                if (clicked.indexOf(this.parentNode.id) == -1) {
                                    textTitle.value = this.parentNode.childNodes[1].innerHTML;
                                    clicked = [];
                                    clicked.push(this.parentNode.id);
                                }
                                else {
                                    if ((textTitle.value).indexOf(this.parentNode.childNodes[1].innerHTML) != -1) {
                                        this.checked = false;
                                        textTitle.value = textTitle.value.replace(this.parentNode.childNodes[1].innerHTML, "");
                                    }
                                    var index = clicked.indexOf(this.parentNode.id);
                                    clicked.splice(index, 1);
                                }
                            };
                            label.appendChild(checkBox);
                            label.appendChild(btn);
                            div.appendChild(label);
                        }
                    });
                }
            } else if (name == NAME_POWER) {
                title.innerHTML = translate(powerPage.title);
                imgId.innerHTML = NAME_POWER + "";
                for (i = 0; i < powerPage.selects.length; i++) {
                    setOptions(powerPage.selects[i], i);
                }
            } else if (name == NAME_OTHERS) {
                title.innerHTML = translate(otherPage.title);
                imgId.innerHTML = NAME_OTHERS + "";
                for (i = 0; i < otherPage.selects.length; i++) {
                    setOptions(otherPage.selects[i], i);
                }
            }
        }
    }

    navigator.mozL10n.once(function () {
        document.getElementById('titleText').setAttribute("placeholder", translate('prompt_please_enter_a_title_less_than_100_characters'));
        var name = getName();
        setPage(name);
        saveLog(name);
        addClickEvent();
    });

    function getInfo() {
        var mumualLog = {};
        mumualLog.module = document.getElementById("titleDiv").innerHTML;
        mumualLog.title = textTitle.value.trim();
        mumualLog.batteryLevel = Math.round(navigator.battery.level * 100);
        mumualLog.networkType = "wifi";
        mumualLog.networkValue = navigator.mozMobileConnections[0].data.signalStrength;
        mumualLog.cpu = 60;
        mumualLog.description = "";
        mumualLog.createTime = new Date().getTime();
        mumualLog.tokenId = null;
        mumualLog.imgId = document.getElementById("imgId").innerHTML;
        mumualLog.fileUpdated = "";
        mumualLog.index = JRDLog.index();
        mumualLog.saveType = null;
        return mumualLog;
    }

    function saveLog(log_module) {
        var saveBtn = document.getElementById("save");

        function extracted() {
            var saveType = {};
            switch (parseInt(log_module)) {
                case NAME_CALL:
                    saveType = AppSetting.LogPhone.get();
                    break;
                case NAME_MESSAGE:
                    saveType = AppSetting.LogMessage.get();
                    break;
                case NAME_CONTACT:
                    saveType = AppSetting.LogContact.get();
                    break;
                case NAME_NETWORK:
                    saveType = AppSetting.LogNetwork.get();
                    break;
                case NAME_WIFI:
                    saveType = AppSetting.LogWifi.get();
                    break;
                case NAME_CAMERA:
                    saveType = AppSetting.LogCamera.get();
                    break;
                case NAME_APPS:
                    saveType = AppSetting.LogApps.get();
                    break;
                case NAME_POWER:
                    saveType = AppSetting.LogPower.get();
                    break;
                case NAME_OTHERS:
                    saveType = AppSetting.LogOhers.get();
                    break;
                default :
                    saveType = {qxdm: 'true', logcat: 'true'};
                    break;
            }
            return saveType;
        }

        saveBtn.onclick = function () {
            var toast = document.getElementById("toast");
            var info = getInfo();
            if (info.title == "") {
                alert(translate('prompt_the_title_can_not_be_empty'));
                return;
            }
            toast.innerHTML = "inserting into the local database.&nbsp;.&nbsp;." + "<br/>";
            saveBtn.disabled = "disabled";
            toast.style.visibility = 'visible';
            info.saveType = extracted();
            savingRecode = true;
            var oo = DataBase.RecordBLL.add(info);
            oo.onsuccess = function onSuccess(recordId) {
                toast.innerHTML += "insert successful" + "<br/>" + "compressing files<span class='ani_dot'>.&nbsp;.&nbsp;.</span>" + "<br/>";
                var rq = JRDLog.save(recordId, info.saveType);
                rq.onsuccess = function onSuccess() {
                    toast.innerHTML += "compression successful" + "<br/>";
                    savingRecode = false;
                    AppSetting.HaveNewData.set(true);
                    toast.style.visibility = 'hidden';
                    optionFrame.setAttribute('hidden', null);
                    recordFrame.setAttribute('hidden', null);
                    mainWin.style.display = 'block';
                    optionFrame.src = "";
                };
                rq.onerror = function onError() {
                    alert(translate('prompt_save_coarse_problem'));
                    toast.style.visibility = 'hidden';
                };
            };
            oo.onerror = function onError() {
                alert(translate('prompt_save_coarse_problem'));
                toast.style.visibility = 'hidden';
            }
        }
    }

    var clicked = [];

    function addClickEvent() {
        var labels = document.getElementsByName("label");
        if (labels) {
            var str;
            for (var i = 0; i < labels.length; i++) {
                labels[i].childNodes[0].onclick = function () {
                    if (clicked.indexOf(this.parentNode.id) == -1) {
                        if (textTitle.value.length > 0) {
                            textTitle.value += ";";
                        }
                        textTitle.value += this.parentNode.childNodes[1].innerHTML;
                        if (textTitle.value.length > 100) {
                            textTitle.value = textTitle.value.replace(this.parentNode.childNodes[1].innerHTML, "");
                            str = textTitle.value;
                            if (str.substr(str.length - 1, 1) == ";") {
                                textTitle.value = str.substring(0, str.length - 1);
                            }
                            this.checked = false;
                            alert(translate('prompt_please_enter_a_title_less_than_100_characters'));
                        } else {
                            clicked.push(this.parentNode.id);
                        }
                    } else {
                        if ((textTitle.value).indexOf(this.parentNode.childNodes[1].innerHTML) != -1) {
                            textTitle.value = textTitle.value.replace(this.parentNode.childNodes[1].innerHTML, "");
                            str = textTitle.value;
                            if (str.substr(str.length - 1, 1) == ";") {
                                textTitle.value = str.substring(0, str.length - 1);
                            }
                            if (str.substr(0, 1) == ";") {
                                console.log(str);
                                textTitle.value = textTitle.value.substr(1, str.length);
                            }
                            if (str.indexOf(";;") != -1) {
                                textTitle.value = str.replace(/;;/g, ";");
                            }
                        }
                        var index = clicked.indexOf(this.parentNode.id);
                        clicked.splice(index, 1);
                    }
                }
            }
        }
    }
});