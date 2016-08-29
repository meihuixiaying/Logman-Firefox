/**
 * Created by songlin.ji on 2015/1/9.
 */

'use strict';

(function (win) {

    var stage;
    var response;
    var connection = navigator.mozMobileConnections;
    var setting = navigator.mozSettings;
    var jrd = navigator.jrdExtension;

    var STAGE_CONSTRUCTION = ["model", "imei", "operator", "phone", "plat", "branch", "perso", "operatorLongName", "operatorShortName"];

    function assign() {
        if (Object.keys(stage).length == STAGE_CONSTRUCTION.length && response.onsuccess) {
            response.onsuccess(stage);
        }
    }

    function assignModel() {
        var modelRequest = setting.createLock().get('deviceinfo.model');
        modelRequest.onsuccess = function onSuccess(event) {
            var model = modelRequest.result['deviceinfo.model'];
            stage[STAGE_CONSTRUCTION[0]] = model ? model : null;
            assign();
        };

        modelRequest.onerror = function onError(event) {
            stage[STAGE_CONSTRUCTION[0]] = null;
            assign();
        };
    }

    function assignIMEI() {
        var req = connection[0].sendMMI('*#06#');
        req.onsuccess = function onSuccess(event) {
            var imei = req.result.statusMessage;
            stage[STAGE_CONSTRUCTION[1]] = imei ? imei : null;
            assign();
        };

        req.onerror = function onError(event) {
            stage[STAGE_CONSTRUCTION[1]] = null;
            assign();
        };
    }

    function assignPhone() {
        var iccId = connection[0].iccId;
        if (!iccId) {
            deal();
            return;
        }

        var iccObj = navigator.mozIccManager.getIccById(iccId);
        if (!iccObj) {
            deal();
            return;
        }
        var iccInfo = iccObj.iccInfo;
        if (!iccInfo) {
            deal();
            return;
        }

        deal(iccInfo.msisdn || iccInfo.mdn);

        function deal(phone) {
            stage[STAGE_CONSTRUCTION[3]] = phone ? phone : null;
            assign();
        }
    }

    function assignOperator() {
        var networkInfo = connection[0].data.network;
        if (networkInfo) {
            var operator = networkInfo.mcc + networkInfo.mnc;
            stage[STAGE_CONSTRUCTION[2]] = operator ? operator : null;
            var longName = networkInfo.longName;
            stage[STAGE_CONSTRUCTION[7]] = longName ? longName : null;
            var shortName = networkInfo.shortName;
            stage[STAGE_CONSTRUCTION[8]] = shortName ? shortName : null;
        } else {
            stage[STAGE_CONSTRUCTION[2]] = null;
            stage[STAGE_CONSTRUCTION[7]] = null;
            stage[STAGE_CONSTRUCTION[8]] = null;
        }
        assign();
    }

    function assignSoftVersion() {
        var softRequest = setting.createLock().get("deviceinfo.software");
        softRequest.onsuccess = function onSuccess(event) {
            var softVersion = softRequest.result["deviceinfo.software"];
            stage[STAGE_CONSTRUCTION[4]] = softVersion ? softVersion : null;
            assign();
        };

        softRequest.onerror = function onError(event) {
            stage[STAGE_CONSTRUCTION[4]] = null;
            assign();
        };
    }

    function assignBuildAndPerson() {
        var  custPack =null;
        if(jrd.fileReadLE){
            custPack = jrd.fileReadLE('Custpack: ');
        }else{
            custPack = jrd.fileRead("/custpack/custpack.ver");
        }
        if (custPack && custPack.length >= 13) {
            stage[STAGE_CONSTRUCTION[5]] = custPack.substr(8, 3);

            stage[STAGE_CONSTRUCTION[6]] = custPack.substr(4, 4);

        } else {
            stage[STAGE_CONSTRUCTION[5]] = null;
            stage[STAGE_CONSTRUCTION[6]] = null;
        }
        assign();
    }


    win.getStage = function () {
        stage = {};
        response = {};
        try {
            assignPhone();
            assignOperator();
            assignSoftVersion();
            assignModel();
            assignIMEI();
            assignBuildAndPerson();
        } catch (e) {
            response.onerror(e);
        }
        return response;
    };
})(window);


















