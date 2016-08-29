/**
 * Created by songlin.ji on 2015/1/26.
 */

(function (win) {
    var wifi = navigator.mozWifiManager;

    var conn = navigator.connection;

    function getWifiEnable() {
        return wifi && wifi.enabled && wifi.connection.status == 'connected';
    }

    function getWifiSignal() {
        var result = 0;

        if (getWifiEnable() && 'connectionInformation' in wifi) {
            result = wifi.connectionInformation.signalStrength;
        }

        return result;
    }

    win.wifiStatus = {
        enable: getWifiEnable,

        signal: getWifiSignal,

        set change(event) {
            conn.ontypechange = event;
        }
    };

})(window);
