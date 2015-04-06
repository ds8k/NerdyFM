angular.module('nerdyfm', ['ionic', 'nerdyfm.controller', 'ngCordova'])

.run(function($ionicPlatform, $cordovaStatusbar, $cordovaDevice, $rootScope) {
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

        $rootScope.favorites = window.localStorage.favorites ? JSON.parse(window.localStorage.favorites) : [];
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
