/**
 * Created by songlin.ji on 2015/1/26.
 */
window.addEventListener('load', function () {
    'use strict';
    var back = document.getElementById('back');
    if (back) {
        back.onclick = function click() {
            parent.document.getElementById("optionFrame").src = "";
            parent.document.getElementById("window").style.display = 'block';
            parent.document.getElementById("recordFrame").setAttribute("hidden", null);
            parent.document.getElementById("optionFrame").setAttribute('hidden', null);
            parent.document.getElementById("nextFrame").setAttribute('hidden', null);
        };
    }

    var submit = document.getElementById('submit');

    submit.onclick = function () {
        var text = context.value;
        if (text && text.trim()) {
            var stageID = AppSetting.stageID.get();
            if (stageID) {
                uploadSuggestion({id: stageID, suggestion: text});
            } else {
                uploadSuggestion({suggestion: text});
            }
        } else {
            alert(translate('suggest_content_null'));
        }
    };

    var context = document.getElementById('context');

    var translate = navigator.mozL10n.get;


    var assist = document.getElementById('assist');

    function uploadSuggestion(value) {
        start();

        var req = travel.suggestion(value);

        req.onload = function success(event) {
            stop();
            parent.document.getElementById("optionFrame").src = "";
            parent.document.getElementById("window").style.display = 'block';
            parent.document.getElementById("recordFrame").setAttribute("hidden", null);
            parent.document.getElementById("optionFrame").setAttribute('hidden', null);
            parent.document.getElementById("nextFrame").setAttribute('hidden', null);
        };

        req.onerror = function error(event) {
            stop();
            alert(translate('network_request_error'));
        };

        req.ontimeout = function timeout(event) {
            stop();
            alert(translate('network_request_timeout'));
        };
    }

    function start() {
        submit.disabled = true;
        assist.removeAttribute('hidden');
    }

    function stop() {
        assist.setAttribute('hidden', null);
        submit.disabled = false;
    }

    navigator.mozL10n.once(function () {
        submit.value = translate('suggest_submit');
        context.setAttribute("placeholder", translate('suggest_content'));
    });
});
