'use strict';
window.addEventListener('DOMContentLoaded', function () {
        var translate = navigator.mozL10n.get;

        AppSetting.Uploading.set(false);

        AppSetting.HaveNewData.set(false);

        function $(id) {
            return document.getElementById(id);
        }

        var optionURL = 'pages/optionPage.html?name=';
        var main = $('window');
        var recordFrame = $('recordFrame');
        var optionFrame = $('optionFrame');
        var nextFrame = $('nextFrame');
        recordFrame.setAttribute('hidden', null);
        nextFrame.setAttribute('hidden', null);
        optionFrame.setAttribute('hidden', null);
        var call;
        if (call = $('call')) {
            call.addEventListener('click', function () {
                main.style.display = 'none';
                optionFrame.src = optionURL + NAME_CALL;
                optionFrame.removeAttribute('hidden');
            });
        }

        var message;
        if (message = $('message')) {
            message.addEventListener('click', function () {
                main.style.display = 'none';
                optionFrame.src = optionURL + NAME_MESSAGE;
                optionFrame.removeAttribute('hidden');
            });
        }

        var contact;
        if (contact = $('contact')) {
            contact.addEventListener('click', function () {
                main.style.display = 'none';
                optionFrame.src = optionURL + NAME_CONTACT;
                optionFrame.removeAttribute('hidden');
            })
        }
        var network;
        if (network = $('network')) {
            network.addEventListener('click', function () {
                main.style.display = 'none';
                optionFrame.src = optionURL + NAME_NETWORK;
                optionFrame.removeAttribute('hidden');
            });
        }
        var wifi;
        if (wifi = $('wifi')) {
            wifi.addEventListener('click', function () {
                main.style.display = 'none';
                optionFrame.src = optionURL + NAME_WIFI;
                optionFrame.removeAttribute('hidden');
            });
        }
        var camera;
        if (camera = $('camera')) {
            camera.addEventListener('click', function () {
                main.style.display = 'none';
                optionFrame.src = optionURL + NAME_CAMERA;
                optionFrame.removeAttribute('hidden');
            });
        }
        var apps;
        if (apps = $('apps')) {
            apps.addEventListener('click', function () {
                main.style.display = 'none';
                optionFrame.src = optionURL + NAME_APPS;
                optionFrame.removeAttribute('hidden');
            })
        }
        var power;
        if (power = $('power')) {
            power.addEventListener('click', function () {
                main.style.display = 'none';
                optionFrame.src = optionURL + NAME_POWER;
                optionFrame.removeAttribute('hidden');
            })
        }
        var others;
        if (others = $('others')) {
            others.addEventListener('click', function () {
                main.style.display = 'none';
                optionFrame.src = optionURL + NAME_OTHERS;
                optionFrame.removeAttribute('hidden');
            });
        }
        var config;
        if (config = $('config')) {
            config.addEventListener('click', function () {
                    main.style.display = 'none';
                    nextFrame.removeAttribute('hidden');
                }
            );
        }
        var suggestions;
        if (suggestions = $('suggestions')) {
            suggestions.addEventListener('click', function () {
                main.style.display = 'none';
                optionFrame.src = 'pages/suggestions.html';
                optionFrame.removeAttribute('hidden');
            });
        }
        var record;
        if (record = $('record')) {
            record.addEventListener('click', function () {
                main.style.display = 'none';
                recordFrame.removeAttribute("hidden");
                if (AppSetting.HaveNewData.get() === 'true') {
                    if (AppSetting.Uploading.get() === "true") {
                        alert(translate('prompt_data_is_being_transferred_the_transfer_is_complete_will_refresh_the_list'));
                    } else {
                        AppSetting.HaveNewData.set(false);
                        window.open(document.all.recordFrame.src, 'recordFrame', '');
                    }
                }
            })
        }
    }
);
