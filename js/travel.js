/**
 * Created by songlin.ji on 2015/1/14.
 */
'use strict';

(function () {
    const TAG = "TRAVEL: ";
    const PROTOCOL = "http";
    const HOST = "172.24.212.40:8080";
    //const HOST = "172.31.1.182:8080";
    const PROJECT = "BugTravel";
    const BASE_URL = PROTOCOL + "://" + HOST + "/" + PROJECT;
    const FORMAT_STAGE_URL = BASE_URL + "/FormatStage?";
    const UPLOAD_RECORD_URL = BASE_URL + "/UploadRecord?";
    const UPLOAD_ATTACH_URL = BASE_URL + "/UploadFile?";
    const SUBMIT_SUGGESTION = BASE_URL + "/Suggestion?";

    function responseSuccess(response, value) {
        if (response.onsuccess && response.onsuccess instanceof  Function) {
            response.onsuccess(value);
        }
    }

    function responseError(response, value) {
        if (response.onerror && response.onerror instanceof  Function) {
            response.onerror(value);
        }
    }

    function responseTimeOut(response, value) {
        if (response.ontimeout && response.ontimeout instanceof  Function) {
            response.ontimeout(value);
        }
    }

    function responseProgress(response, total, loaded) {
        if (response.onprogress && response.onprogress instanceof  Function) {
            response.onprogress(total, loaded);
        }
    }


    var formatStage = function request(stage) {
        var response = {};

        var httpRequest = new XMLHttpRequest({mozSystem: true});
        httpRequest.onload = function onLoad(event) {
            console.log(TAG + "formatStage load" + httpRequest.responseText);
            responseSuccess(response, JSON.parse(httpRequest.responseText));
        };

        httpRequest.onerror = function onError(event) {
            console.log(TAG + "formatStage error");
            responseError(response, event);
        };

        httpRequest.ontimeout = function onTimeout(event) {
            console.log(TAG + "formatStage timeout");
            responseTimeOut(response, event);
        };

        var url = FORMAT_STAGE_URL + "timeStamp=" + new Date().getTime() + urlGetParam(stage);

        httpRequest.open("POST", url, true);

        httpRequest.timeout = 10000;

        httpRequest.send(null);

        return response;
    };


    var uploadRecord = function request(record) {
        var httpRequest = new XMLHttpRequest({mozSystem: true});

        var response = {};

        httpRequest.onload = function onLoad(event) {
            console.log(TAG + "uploadRecord load" + httpRequest.responseText);
            responseSuccess(response, JSON.parse(httpRequest.responseText));
        };

        httpRequest.onerror = function onError(event) {
            console.log(TAG + "uploadRecord error");
            responseError(response, event);
        };

        httpRequest.ontimeout = function onTimeout(event) {
            console.log(TAG + "uploadRecord timeout");
            responseTimeOut(response, event);
        };

        var url = UPLOAD_RECORD_URL + "timeStamp=" + new Date().getTime();

        httpRequest.open("POST", url, true);

        httpRequest.setRequestHeader("CONTENT-TYPE", "application/x-www-form-urlencoded");

        httpRequest.timeout = 10000;

        httpRequest.send(urlPostParam(record));

        return response;
    };

    var suggestion = function suggestion(suggest) {
        var httpRequest = new XMLHttpRequest({mozSystem: true});

        httpRequest.ontimeout = function onTimeout(event) {
            console.log(TAG + "suggestion timeout");
        };

        httpRequest.onload = function onLoad(event) {
            console.log(TAG + "suggestion load");
        };

        httpRequest.onerror = function onError(event) {
            console.log(TAG + "suggestion error");
        };

        var url = SUBMIT_SUGGESTION + "timeStamp=" + new Date().getTime();

        httpRequest.open("POST", url, true);

        httpRequest.setRequestHeader("CONTENT-TYPE", "application/x-www-form-urlencoded");

        httpRequest.timeout = 10000;

        httpRequest.send(urlPostParam(suggest));

        return httpRequest;
    };

    var uploadFile = function request(id, files) {
        var response = {};

        var httpRequest = new XMLHttpRequest({mozSystem: true});

        httpRequest.upload.onprogress = function progress(event) {
            console.log(TAG + "uploadFile progressing total:" + event.total + " loaded:" + event.loaded);
            responseProgress(response, event.total, event.loaded);
        };

        httpRequest.onload = function onLoad(event) {
            console.log(TAG + "uploadFile success");
            responseSuccess(response, JSON.parse(httpRequest.responseText));
        };

        httpRequest.onerror = function onError(event) {
            console.log(TAG + "uploadFile error");
            responseError(response, event);
        };

        httpRequest.ontimeout = function onTimeout(event) {
            console.log(TAG + "uploadFile timeout");
            responseTimeOut(response, event);
        };

        var formData = new FormData();

        for (var i = 0; i < files.length; i++) {
            formData.append("file" + i, files[i], getFileName(files[i]));
        }

        formData.append('id', id);

        httpRequest.open("POST", UPLOAD_ATTACH_URL + "timeStamp=" + new Date().getTime(), true);

        httpRequest.send(formData);

        return response;
    };

    function getFileName(file) {
        return file.name.substr(file.name.lastIndexOf('/') + 1);
    }

    function urlGetParam(value) {
        var result = "";
        for (var key in value) {
            if (value[key]) {
                result += "&" + key + "=" + value[key];
            }
        }
        return result;
    }

    function urlPostParam(value) {
        var result = "";

        for (var key in value) {
            if (value[key]) {
                result += key + "=" + encodeURIComponent(value[key]) + "&";
            }
        }

        return result.substr(0, result.length - 1);
    }

    this.travel = {
        formatStage: formatStage,
        uploadRecord: uploadRecord,
        suggestion: suggestion,
        uploadFile: uploadFile
    };
}).apply(this);