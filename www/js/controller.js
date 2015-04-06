angular.module('nerdyfm.controller', [])

.controller('AppCtrl', function($scope, $http, $rootScope) {

    $rootScope.getRecent = function() {
        var random = Math.floor((Math.random() * 10000) + 1);
        $http.get('http://streams4.museter.com:2199/external/rpc.php?m=recenttracks.get&username=nerdyfm&charset=&mountpoint=&rid=nerdyfm&limit=9&_=' + random).success(function(data) {
            $scope.recentTracks = data.data[0];
        });
    };

    $rootScope.getRecent();
})

.controller('TrackCtrl', function($scope, $ionicModal, $rootScope) {
    $ionicModal.fromTemplateUrl('templates/track.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.open = function(record) {
        $scope.record = record;

        if ($scope.record.artist) {
            $scope.modal.show();
        }
    };

    $scope.close = function() {
        $scope.modal.hide();
    };

    $scope.favorite = function() {

        var newFavorite = {
            artist: $scope.record.artist,
            title: $scope.record.title,
            cover: $scope.record.image || $scope.record.imageurl,
            buy: $scope.record.url || $scope.record.buyurl
        };

        $rootScope.favorites.push(newFavorite);
        localStorage.favorites = JSON.stringify($rootScope.favorites);
        $scope.modal.hide();
    };
})

.controller('FavCtrl', function($scope, $state, $rootScope) {
    $scope.listCanSwipe = true;

    $scope.onDelete = function(record, index) {
        $rootScope.favorites.splice(index, 1);
        window.localStorage.favorites = JSON.stringify($rootScope.favorites);
    };

    $scope.openBuy = function(link) {
        window.open(link, '_system');
    };

    $scope.openSearch = function(record) {
        window.open('https://www.google.com/#q=' + record.artist + '+' + record.title, '_system');
    };
})

.controller('PlayCtrl', function($scope, $http, $interval, $cordovaDevice, $rootScope, $ionicPopup) {

    $rootScope.audio = document.getElementById("audiostream"); //Get our audio element
    $rootScope.androidAudio = undefined;
    $rootScope.class = "play"; //Set dumb variable for play button
    $rootScope.track = {}; //Let the user know what to do
    $rootScope.listener = false; //Dumby boolean for checking event listener status
    $rootScope.operatingSystem = "iOS"; //$cordovaDevice.getPlatform();
    $rootScope.trackClass = "playorload";
    $rootScope.song = "";

    //Changes the class of the play button
    $rootScope.setClass = function() {
        $rootScope.class = $rootScope.class === "play" ? "pause" : "play";
    };

    $rootScope.getTrackClass = function() {
        return $rootScope.trackClass;
    };

    $rootScope.setTrackClass = function() {
        if ($rootScope.track.imageurl === '') {
            $rootScope.trackClass = "playorload";
        } else {
            $rootScope.trackClass = "cc_streaminfo";
        }
    };

    //Function for the button. Should be self-explanatory
    $rootScope.onClick = function() {
        //Check to see if the event listener is set. If it isn't, add one!
        if (!$scope.listener) {
            document.addEventListener("remote-event", function(event) {
                $rootScope.onClick();
            });

            $rootScope.listener = true;
        }

        if ($rootScope.operatingSystem === 'iOS' && $rootScope.audio.paused) {

            //Change the track object. Kind of crappy but it works
            $rootScope.track = {
                artist: '',
                title: 'Loading...',
                album: '',
                imageurl: ''
            };

            //Set the source
            $rootScope.audio.src = 'http://streams4.museter.com:8344/;stream.nsv';
            $rootScope.audio.load(); //Reload the stream. Gets the user up-to-date with the stream
            $rootScope.audio.play(); //Finally, play it

            //Get the current streaming song. This function will change the track object
            $rootScope.getListing();
            $rootScope.startInterval();

        } else if ($rootScope.operatingSystem === 'Android' && !$rootScope.androidAudio) {

            //Change the track object. Kind of crappy but it works
            $rootScope.track = {
                artist: '',
                title: 'Loading...',
                album: '',
                imageurl: ''
            };

            $rootScope.androidAudio = new Media('http://streams4.museter.com:8344/;stream.nsv');
            $rootScope.androidAudio.play();
            $rootScope.getListing();
            $rootScope.startInterval();

        } else {
            if ($rootScope.operatingSystem === 'iOS') {
                $rootScope.audio.pause(); //Pause the song
                $rootScope.audio.src = ''; //Remove the source (stops the streaming)
            } else {
                $rootScope.androidAudio.stop();
                $rootScope.androidAudio.release();
                $rootScope.androidAudio = undefined;
            }

            $interval.cancel($rootScope.stop); //Cancel the interval
            $rootScope.stop = undefined; //Set interval object to undefined

            //Reset the track object
            $rootScope.track = {
                artist: '',
                title: 'Click play!',
                album: '',
                imageurl: ''
            };

            

            $rootScope.setTrackClass();
        }

        //Set the play buttons class
        $rootScope.song = "";
        $rootScope.setClass();
        $rootScope.setTrackClass();
    };

    //Set a 15 second interval to check if the current song has changed
    //If an interval is already set then we're already playing.
    $rootScope.startInterval = function() {
        if (angular.isDefined($rootScope.stop)) {
            return;
        } else {
            $rootScope.stop = $interval(function() {
                $rootScope.getListing();
            }, 15000);
        }
    };

    //This function generates a random number and checks the current streaming song
    //Random number is necessary, otherwise we'd run into cached requests
    $rootScope.getListing = function() {
        var random = Math.floor((Math.random() * 10000) + 1);
        $http.get('http://streams4.museter.com:2199/external/rpc.php?m=streaminfo.get&username=nerdyfm&charset=&mountpoint=&rid=nerdyfm&_=' + random).success(function(data) {

            //If the song is different then change it
            if ($rootScope.song !== data.data[0].song) {

                $rootScope.song = data.data[0].song;
                $rootScope.track = data.data[0].track;
                $rootScope.setTrackClass();
                $rootScope.getRecent();

                try {
                    //Cordova plugin that changes the metadata for iOS lock screen
                    window.NowPlaying.updateMetas($rootScope.track.artist, $rootScope.track.title, $rootScope.track.album, $rootScope.imageurl);
                } catch (e) {
                    // console.log(e);
                }
            }
        });
    };

    $rootScope.share = function(record) {
        record = record ? record : $rootScope.track;

        if (!record.artist) {
            $ionicPopup.alert({
                title: 'Nothing is playing!',
            });
        } else {
            window.plugins.socialsharing.share('Check out ' + record.artist + ' - ' + record.title +  ' on Nerdy.FM!', null, null, 'http://www.nerdy.fm');
        }
    };
});
