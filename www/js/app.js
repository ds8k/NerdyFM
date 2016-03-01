angular.module('nerdyfm', ['ionic', 'nerdyfm.controller', 'ngCordova'])

.run(function($ionicPlatform, $cordovaStatusbar, $cordovaDevice, $rootScope, $cordovaSplashscreen, $timeout, ConnectionStatus) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

        //Set the statusbar color for iOS
        try {
            if ($cordovaDevice.getPlatform() === "iOS") {
                StatusBar.overlaysWebView(true);
                $rootScope.operatingSystem = 'iOS';
                $rootScope.iPad = $cordovaDevice.getModel().indexOf('iPad') > -1 ? true : false;
                navigator.splashscreen.hide();
            } else {
                StatusBar.overlaysWebView(false);
                StatusBar.backgroundColorByHexString('#D32F2F');
                $rootScope.operatingSystem = 'Android';
                $timeout($cordovaSplashscreen.hide, 500);
            }
        } catch (e) {
            // console.log(e);
            $rootScope.operatingSystem = 'iOS';
        }

        try {
            window.analytics.startTrackerWithId('UA-61974799-1');
            window.analytics.trackView('Home');
        } catch (e) {
            // console.log(e);
        }
        
        try {
            window.MusicController.destroy();
        } catch (e) {
            // console.log(e)
        }
        
        try {
            var filter = new ConnectSDK.CapabilityFilter(["MediaPlayer.Play.Audio"]);

            ConnectSDK.discoveryManager.startDiscovery();
            ConnectSDK.discoveryManager.on("devicefound", function() {
                $rootScope.showChromecast = true;
            });
        } catch (e) {
            // console.log(e);
        }

        $rootScope.favorites = window.localStorage.favorites ? JSON.parse(window.localStorage.favorites) : [];

        ConnectionStatus.on('offline', function() {
            $timeout(function() {
                if (!ConnectionStatus.isOnline()) {
                    $rootScope.onError('offline');
                    $rootScope.setTrackClass();
                    $rootScope.setPlayClass();
                    ConnectionStatus.on('online', $rootScope.onClick, this, { single: true });
                }
            }, 2500)
        }, this);
    });
})

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
    })

    .state('app.home', {
        url: "/home",
        views: {
            'menuContent': {
                templateUrl: "templates/home.html",
                controller: 'PlayCtrl'
            }
        }
    })

    .state('app.recent', {
        url: "/recent",
        views: {
            'menuContent': {
                templateUrl: "templates/recent.html",
                controller: 'TrackCtrl'
            }
        }
    })

    .state('app.favorites', {
        url: "/favorites",
        views: {
            'menuContent': {
                templateUrl: "templates/favorites.html",
                controller: 'FavCtrl'
            }
        },
        cache: false
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
});
