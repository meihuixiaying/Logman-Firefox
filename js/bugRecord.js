/**
 * Created by jinlong.wang on 2015/1/18.
 */
window.addEventListener("load", function () {
    var translate = navigator.mozL10n.get;

    var back = document.getElementById('back');
    if (back) {
        back.onclick = function click() {
            parent.document.getElementById("optionFrame").setAttribute('hidden', null);
            parent.document.getElementById('recordFrame').setAttribute('hidden', null);
            parent.document.getElementById('nextFrame').setAttribute('hidden', null);
            parent.document.getElementById("window").style.display = 'block';
        };
    }

    var in_fresh = document.getElementById("assist_fresh");

    var uploadBar = document.getElementById("uploadBar");

    var bug_content = document.getElementById("bug_content");

    var needUploadRecord = [];

    var uploadRecordBack = {
        success: function () {
            uploadFiles();
        },
        error: function () {
            checkBugs();
        }
    };

    var stageID;

    function uploadRecords() {
        if (needUploadRecord.length > 0) {

            var record = needUploadRecord.shift();

            record.stageID = stageID;

            var req = travel.uploadRecord(record);

            req.onsuccess = function success(value) {
                if (value.code === 0) {
                    record.tokenId = value.body.record;

                    var reqUpdata = DataBase.RecordBLL.updateByIndex(record.ID, record.tokenId, "tokenId");

                    reqUpdata.onsuccess = function success(recordID) {

                        needUploadFile.push(record);

                        uploadRecords();
                    };

                    reqUpdata.onerror = uploadRecords;
                } else {
                    uploadRecords();
                }
            };

            req.onerror = uploadRecordBack.error;

            req.ontimeout = uploadRecordBack.error;
        } else {
            uploadRecordBack.success();
        }
    }

    var needUploadFile = [];

    var uploadFileBack = {
        success: function () {
            checkBugs();
        },

        error: function () {
            checkBugs();
        }
    };

    function uploadFiles() {
        if (needUploadFile.length > 0) {
            var record = needUploadFile.shift();

            var mask = document.getElementById('mask' + record.ID);

            var progressSpan = document.getElementById('pro' + record.ID);

            progressSpan.hidden = false;

            var delIMG;

            if (delIMG = document.getElementById('del' + record.ID)) {
                delIMG.hidden = true;
            }

            function uploadFileSuccess() {
                record.fileUpdated = 'fileUpdated';
                var updateReq = DataBase.RecordBLL.update(record);

                updateReq.onsuccess = function () {

                    progressSpan.hidden = true;

                    if (delIMG) {
                        delIMG.hidden = false;
                    }

                    JRDLog.delete(record.ID, record.index);

                    var bugItem;
                    if (bugItem = document.getElementById(record.ID)) {
                        bugItem.removeAttribute('file');
                    }
                };
            }

            var req = JRDLog.find(record.ID, record.index);
            req.onsuccess = function success(files) {

                var uploadFileReq = travel.uploadFile(record.tokenId, files);

                uploadFileReq.onprogress = function progress(total, loaded) {
                    var progress = parseInt(loaded * 100 / total) + "%";
                    if (progressSpan) {
                        progressSpan.innerHTML = progress;
                    }

                    if (mask) {
                        mask.style.width = progress;
                    }
                };


                uploadFileReq.onsuccess = function success(event) {
                    if (event.code === 0) {
                        uploadFileSuccess();
                    }

                    uploadFiles();
                };

                uploadFileReq.onerror = function error() {
                    progressSpan.hidden = true;

                    if (delIMG) {
                        delIMG.hidden = false;
                    }

                    uploadFileBack.error();
                };

                uploadFileReq.ontimeout = uploadFileBack.error;
            };

            req.onerror = function error() {
                uploadFileSuccess();

                uploadFiles();
            };


        } else {
            uploadFileBack.success();
        }
    }

    uploadBar.onclick = function () {
        if (!wifiStatus.enable()) {
            alert(translate('prompt_please_turn_on_wifi_to_sync'));
            return null;
        }

        if (stageID = AppSetting.stageID.get()) {
            AppSetting.Uploading.set(true);

            uploadBar.hidden = true;

            in_fresh.hidden = false;

            bug_content.removeAttribute('uploading');

            uploadRecords();
        } else {
            alert(translate('prompt_please_register'));
        }
    };


    function checkBugs() {

        resetStatus();

        DataBase.RecordBLL.findAll(function (logs) {
            var bugs = logs.reverse();

            needUploadRecord = [];

            needUploadFile = [];

            bug_content.innerHTML = null;

            for (var i = 0; i < bugs.length; i++) {
                var bug = bugs[i];

                if (!bug.tokenId) {

                    needUploadRecord.push(bug);
                } else if (bug.fileUpdated !== "fileUpdated") {

                    needUploadFile.push(bug);
                }

                bug_content.appendChild(structRecordNode(bug));
            }

            checkUploadBarStatus();

            AppSetting.HaveNewData.set(false);
        });
    }

    function resetStatus() {
        AppSetting.Uploading.set(false);
        in_fresh.hidden = true;

        uploadBar.hidden = true;
        bug_content.removeAttribute('uploading');
    }

    function checkUploadBarStatus() {
        if (needUploadRecord.length > 0 || needUploadFile.length > 0) {
            uploadBar.hidden = false;
            bug_content.setAttribute('uploading', null);
        } else {
            uploadBar.hidden = true;
            bug_content.removeAttribute('uploading');
        }
    }

    function structRecordNode(bug) {
        var li = document.createElement("li");
        li.setAttribute("id", bug.ID);

        var item = document.createElement("div");
        item.setAttribute("class", 'item');

        var img = document.createElement("img");
        img.src = getItemImgSrc(bug.imgId);
        img.setAttribute("class", "bugTagLeft");


        var title = document.createElement('span');
        title.innerHTML = bug.title;
        title.setAttribute("class", "title");

        var deleteImg = document.createElement("img");
        deleteImg.setAttribute("id", 'del' + bug.ID);
        deleteImg.setAttribute("class", "bugTagRight");
        deleteImg.src = "../img/delete.png";

        deleteImg.addEventListener('click', function (event) {
            event.stopPropagation();
            deleteItem(bug, li);
        });

        item.appendChild(img);
        item.appendChild(title);
        item.appendChild(deleteImg);

        if (bug.fileUpdated !== 'fileUpdated') {
            var progressSpan = document.createElement("span");
            progressSpan.setAttribute("id", 'pro' + bug.ID);
            progressSpan.setAttribute('hidden', null);
            progressSpan.setAttribute("class", "progress");

            item.appendChild(progressSpan);

            var progressMask = document.createElement("span");
            progressMask.setAttribute("id", 'mask' + bug.ID);
            progressMask.setAttribute("class", "mask");
            li.appendChild(progressMask);
        } else {
            li.setAttribute('uploaded', null);
        }

        li.onclick = function click(event) {
            openItem(bug.ID);
        };

        li.appendChild(item);

        return li;
    }

    function deleteItem(bug, li) {
        if (AppSetting.Uploading.get() === 'true') {
            return;
        }

        if (window.confirm(translate('prompt_are_you_sure_to_delete_this_record'))) {
            var response = DataBase.RecordBLL.deleteByKey(bug.ID);

            response.onsuccess = function onSuccess() {
                JRDLog.delete(bug.ID, bug.index);

                var recordIndex;
                if ((recordIndex = needUploadRecord.indexOf(bug)) !== -1) {
                    needUploadRecord.splice(recordIndex, 1);
                }

                var fileIndex;
                if ((fileIndex = needUploadFile.indexOf(bug)) !== -1) {
                    needUploadFile.splice(fileIndex, 1);
                }

                checkUploadBarStatus();

                bug_content.removeChild(li);
            };

            response.onerror = function onError() {
                alert(translate('prompt_delete_failed'));
            }
        }
    }

    function openItem(id) {
        if (AppSetting.Uploading.get() === 'true') {
            return;
        }

        parent.document.getElementById("recordFrame").src = '../pages/information.html?id=' + id;
    }

    function getItemImgSrc(imgId) {
        var img;
        switch (parseInt(imgId)) {
            case NAME_CALL:
                img = "phone.png";
                break;
            case NAME_MESSAGE:
                img = "message.png";
                break;
            case NAME_CONTACT:
                img = "contacts.png";
                break;
            case NAME_NETWORK:
                img = "network.png";
                break;
            case NAME_WIFI:
                img = "wifi.png";
                break;
            case NAME_CAMERA:
                img = "camera.png";
                break;
            case NAME_APPS:
                img = "apps.png";
                break;
            case NAME_POWER:
                img = "power.png";
                break;
            case NAME_OTHERS:
                img = "more.png";
                break;
            default :
                img = "more.png";
                break;
        }

        return "../img/" + img;
    }

    checkBugs();

    navigator.mozL10n.once(function () {
        document.getElementById('uploadBar').value = translate('prompt_upload_record');
    });
});
