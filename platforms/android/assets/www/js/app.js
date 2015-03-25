angular.module('nerdyfm', ['ionic', 'nerdyfm.controller', 'ngCordova'])

.run(function($ionicPlatform, $cordovaStatusbar, $cordovaDevice) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

        //Set the statusbar color for iOS
        try {
            if ($cordovaDevice.getPlatform() === "iOS") {
                StatusBar.overlaysWebView(true);
            } else {
                StatusBar.overlaysWebView(false);
                StatusBar.backgroundColorByHexString('#1976D2');
            }
        } catch (e) {
            // console.log(e);
        }
    });
});
