/**
 * Created by jinlong.wang on 2015/3/4.
 */
window.addEventListener("load", function () {
        const TAG = "information";

        const AUDIO_NAME = 'audio.ogg';

        const ERROR_ID = -1;

        navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

        var translate = navigator.mozL10n.get;

        var in_recordID = document.getElementById("recordId");
        var in_serverID = document.getElementById("tokenId");
        var in_module = document.getElementById("log_module");
        var in_title = document.getElementById("log_title");
        var in_description = document.getElementById("log_description");

        var in_battery = document.getElementById("log_batteryLevel");
        var in_net_type = document.getElementById("log_networkType");
        var in_cpu = document.getElementById("log_cpu");
        var in_net_value = document.getElementById("log_networkValue");

        var li_storage = document.getElementById('li_storage');

        var in_position = document.getElementById("log_storage");

        var in_create_time = document.getElementById("log_createTime");

        var li_audio = document.getElementById('li_audio');

        var btn_description = document.getElementById("in_description");

        var backBtn = document.getElementById("back");

        var recordFrame = parent.document.getElementById("recordFrame");

        function back() {
            if (!btn_description.hidden) {
                if (window.confirm(translate('prompt_save_and_quit'))) {
                    bug.description = in_description.value;
                    var response = DataBase.RecordBLL.update(bug);
                    response.onsuccess = function onSuccess() {
                        btn_description.hidden = true;
                        recordFrame.src = '../pages/record.html';
                    };
                } else {
                    recordFrame.src = '../pages/record.html';
                }
            } else {
                recordFrame.src = '../pages/record.html';
            }
        }

        backBtn.onclick = function onClick() {
            back();
        };

        var bug;

        function getId() {
            var id = ERROR_ID;

            var URL = document.location.toString();
            var index;
            if ((index = URL.lastIndexOf("?")) !== -1) {
                id = URL.substring(index + 1).split("=")[1];
            }

            return id;
        }

        function getItem() {
            var id = parseInt(getId());
            if (id !== ERROR_ID) {
                function recordItem(item) {
                    bug = item;

                    setValue();

                    checkStatusAndAddEvent();
                }

                DataBase.RecordBLL.findByKey(id, recordItem);
            } else {
                alert(translate('prompt_page_is_invalid_please_reopen'));
            }
        }

        getItem();

        function setValue() {
            in_recordID.innerHTML = bug.ID;
            in_serverID.innerHTML = bug.tokenId ? bug.tokenId : "--";
            in_module.innerHTML = bug.module;
            in_title.innerHTML = bug.title.replace(/;/g, " ");
            in_description.value = bug.description;

            in_battery.innerHTML = bug.batteryLevel + "%";
            in_net_type.innerHTML = bug.networkType;
            in_cpu.innerHTML = bug.cpu + "%";
            in_net_value.innerHTML = bug.networkValue;
            in_create_time.innerHTML = new Date(bug.createTime).toLocaleDateString() + " " + new Date(bug.createTime).toLocaleTimeString();
        }

        var storage = null;

        function checkStatusAndAddEvent() {
            if (!bug.tokenId) {

                if (!storage) {
                    storage = navigator.getDeviceStorages('sdcard')[bug.index];
                }

                checkDescription();
            }

            if (bug.fileUpdated !== 'fileUpdated') {
                li_storage.hidden = false;
                in_position.innerHTML = bug.index == 1 ? translate('prompt_external_SDCard') : translate('prompt_internal_SDCard');

                checkAudio();

                checkAttachment();
            }
        }

        function checkDescription() {

            in_description.disabled = false;
            in_description.oninput = function input(event) {
                btn_description.hidden = in_description.value === bug.description;
            };

            btn_description.onclick = function click() {
                bug.description = in_description.value;
                var response = DataBase.RecordBLL.update(bug);
                response.onsuccess = function onSuccess() {
                    btn_description.hidden = true;
                };
            };
        }

        function checkAudio() {
            li_audio.hidden = false;

            var in_revocation = document.getElementById('in_revocation');

            var div_record = document.getElementById("div_record");

            var in_record = document.getElementById('in_record');

            var in_audio = document.getElementById('in_audio');


            var in_record_start = document.getElementById('in_record_start');

            var audioPath = "logman/record/" + bug.ID + "/" + AUDIO_NAME;


            function checkAudio() {

                var request = storage.get(audioPath);
                request.onsuccess = function success(event) {
                    console.log('get audio success');
                    var file = this.result;
                    in_audio.src = window.URL.createObjectURL(file);
                    switchAudioStatus(true);
                };

                request.onerror = function error(event) {
                    switchAudioStatus(false);
                }
            }


            in_revocation.onclick = function click() {

                in_audio.pause();

                var req = storage.delete(audioPath);
                req.onsuccess = function success(event) {
                    console.log(TAG + "delete audio file success");
                    switchAudioStatus(false);
                };
            };


            function switchAudioStatus(value) {
                if (value) {
                    in_revocation.hidden = false;
                    in_audio.hidden = false;
                    in_record.hidden = true;
                } else {
                    in_revocation.hidden = true;
                    in_audio.hidden = true;
                    in_record.hidden = false;
                }
            }

            checkAudio();


            if (navigator.getUserMedia) {
                console.log('getUserMedia supported.');
                var recordStatus = false;
                var constraints = {audio: true};

                function success(stream) {
                    console.log('getUserMedia success.');
                    var mediaRecorder = new MediaRecorder(stream);

                    in_record_start.onclick = function () {
                        console.log("recorder started");
                        if (recordStatus) {

                            in_record_start.removeAttribute('rotate');

                            mediaRecorder.stop();
                        } else {
                            in_record_start.setAttribute('rotate', null);
                            mediaRecorder.start();
                        }

                        recordStatus = !recordStatus;
                    };

                    mediaRecorder.ondataavailable = function (e) {
                        switchAudioStatus(true);

                        in_audio.src = window.URL.createObjectURL(e.data);

                        in_audio.play();

                        storage.addNamed(e.data, audioPath);
                    }
                }

                function error(err) {
                    console.log('The following error occured: ' + err);
                }

                navigator.getUserMedia(constraints, success, error);
            } else {
                console.log('getUserMedia not supported on your browser!');
            }
        }

        var imageFiles = [];

        function checkAttachment() {
            var li_attachment = document.getElementById('li_attachment');

            var in_add_att = document.getElementById("in_add_att");

            var in_attachment = document.getElementById('in_attachment');

            li_attachment.hidden = false;

            function getFiles() {
                var req = storage.enumerate('logman/record/' + bug.ID);
                req.onsuccess = function success(event) {
                    var file = event.target.result;
                    if (file) {

                        if (file.type.indexOf("image") !== -1) {
                            imageFiles.push(file);
                        }

                        this.continue();
                    } else {
                        structAttachment();
                    }
                }
            }


            function structAttachment() {
                for (var i = 0; i < imageFiles.length; i++) {
                    var fileName = imageFiles[i].name;

                    li_attachment.appendChild(structImage(imageFiles[i], fileName.substring(fileName.indexOf('logman'))));
                }

                checkAddStatus();
            }

            function checkAddStatus() {
                in_add_att.hidden = imageFiles.length >= 6;
            }


            in_add_att.onclick = function click() {
                in_attachment.click();
            };


            in_attachment.onchange = function change(event) {
                var file = event.target.files[0];
                var filePath = 'logman/record/' + bug.ID + '/' + file.name;
                var req = storage.addNamed(file, filePath);
                req.onsuccess = function success(event) {
                    storage.get(filePath).onsuccess = function success(event) {
                        var imgFile = event.target.result;
                        li_attachment.appendChild(structImage(imgFile, filePath));
                        imageFiles.push(imgFile);
                        checkAddStatus();
                    };
                }
            };

            function structImage(file, filePath) {
                console.log(filePath);
                var img = document.createElement('img');
                img.setAttribute('class', 'image_attach');
                img.src = window.URL.createObjectURL(file);
                img.onclick = function click() {
                    storage.delete(filePath);
                    li_attachment.removeChild(img);
                    imageFiles.splice(imageFiles.indexOf(file), 1);
                    checkAddStatus();
                };

                return img;
            }

            getFiles();
        }
    }
)
;


