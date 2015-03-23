angular.module('nerdyfm', ['ionic', 'nerdyfm.controller', 'ngCordova'])

.run(function($ionicPlatform, $cordovaStatusbar) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

        //Set the statusbar color for iOS
        try {
            $cordovaStatusbar.overlaysWebView(true).style(1);
        } catch (e) {
            // console.log(e);
        }
    });
});
