cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.ionic.keyboard/www/keyboard.js",
        "id": "com.ionic.keyboard.keyboard",
        "clobbers": [
            "cordova.plugins.Keyboard"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.statusbar/www/statusbar.js",
        "id": "org.apache.cordova.statusbar.statusbar",
        "clobbers": [
            "window.StatusBar"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.inappbrowser/www/inappbrowser.js",
        "id": "org.apache.cordova.inappbrowser.inappbrowser",
        "clobbers": [
            "cordova.InAppBrowser.open",
            "window.open"
        ]
    },
    {
        "file": "plugins/com.silverorange.now-playing/www/nowplaying.js",
        "id": "com.silverorange.now-playing.now-playing",
        "clobbers": [
            "window.NowPlaying"
        ]
    },
    {
        "file": "plugins/com.rd11.remote-controls/www/RemoteControls.js",
        "id": "com.rd11.remote-controls.RemoteControls",
        "clobbers": [
            "window.remoteControls"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.ionic.keyboard": "1.0.4",
    "org.apache.cordova.console": "0.2.13",
    "org.apache.cordova.device": "0.3.0",
    "org.apache.cordova.statusbar": "0.1.10",
    "org.apache.cordova.inappbrowser": "0.6.1-dev",
    "com.silverorange.now-playing": "1.0.0",
    "nl.kingsquare.cordova.background-audio": "1.0.0",
    "com.rd11.remote-controls": "1.0.0"
}
// BOTTOM OF METADATA
});