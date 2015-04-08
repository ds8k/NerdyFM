angular.module('nerdyfm.controller', [])

.controller('AppCtrl', function($rootScope, $scope, $http) {
    //Grabs the 9 most recently played tracks
    //If on an iPad, the limit is 8
    $rootScope.getRecent = function() {
        var random = Math.floor((Math.random() * 10000) + 1);
        var results = $rootScope.iPad ? 8 : 9;
        $http.get('http://streams4.museter.com:2199/external/rpc.php?m=recenttracks.get&username=nerdyfm&charset=&mountpoint=&rid=nerdyfm&limit=9&_=' + random).success(function(data) {
            if ($scope.recentTracks !== data.data[0]) {
                $scope.recentTracks = data.data[0];
            }
        });
    };

    $rootScope.getRecent();
})

//Controls the track popup
.controller('TrackCtrl', function($rootScope, $scope, $ionicModal) {
    $ionicModal.fromTemplateUrl('templates/track.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    //Reset the statusbar on Android when modal hides
    $scope.$on('modal.hidden', function(data) {
        if ($rootScope.operatingSystem === 'Android') {
            StatusBar.backgroundColorByHexString('#D32F2F');
        }
    });

    //Display the track modal
    //if on Android, also change the statusbar color
    $scope.open = function(record) {
        $scope.record = record;

        if ($scope.record.artist) {
            $scope.modal.show();

            if ($rootScope.operatingSystem === 'Android') {
                StatusBar.backgroundColorByHexString('#730800');
            }
        }
    };

    //Close the modal
    $scope.close = function() {
        $scope.modal.hide();
    };

    //Add the track to favorites
    $scope.favorite = function() {
        var newFavorite = {
            artist: $scope.record.artist,
            title: $scope.record.title,
            cover: $scope.record.image || $scope.record.imageurl,
            buy: $scope.record.url || $scope.record.buyurl,
            id: $rootScope.favorites.length
        };

        //Push to the favorites object
        $rootScope.favorites.push(newFavorite);

        //Put the new favorite into local storage
        window.localStorage.favorites = JSON.stringify($rootScope.favorites, function (key, val) {
             //Angular fix - remove the hashkey it adds
             if (key == '$$hashKey') {
                 return undefined;
             }
             return val;
        });

        //close the modal
        $scope.modal.hide();
    };
})

//The favorites controller
.controller('FavCtrl', function($rootScope, $scope, $state) {
    //Make the list swipable 
    $scope.listCanSwipe = true;

    //Remove song from favorites
    $scope.onDelete = function(record, index) {
        $rootScope.favorites.splice(index, 1);
        window.localStorage.favorites = JSON.stringify($rootScope.favorites, function (key, val) {
             //Angular fix - remove the hashkey it adds
             if (key == '$$hashKey') {
                 return undefined;
             }
             return val;
        });
    };

    //Opens the buy link from Museter
    $rootScope.openBuy = function(link) {
        window.open(link, '_system');
    };

    //Does a good search if the song didn't have a buy link
    $rootScope.openSearch = function(record) {
        var search = encodeURIComponent(record.artist + ' ' + record.title);
        window.open('https://www.google.com/#q=' + search, '_system');
    };
})

//Main player controller - THIS THING IS A NIGHTMARE
.controller('PlayCtrl', function($rootScope, $scope, $http, $interval, $cordovaDevice) {

    $rootScope.audio = document.getElementById("audiostream"); //Get our audio element
    $rootScope.androidAudio = undefined; //Junk Android variable
    $rootScope.playClass = "play"; //Set dumb variable for play button
    $rootScope.track = {}; //Let the user know what to do
    $rootScope.listener = false; //Dumby boolean for checking event listener status
    $rootScope.trackClass = "playorload"; //Default track class
    $rootScope.song = ""; //Dumb variable for determining current song

    //Changes the class of the play button
    $rootScope.setPlayClass = function() {
        $rootScope.playClass = $rootScope.playClass === 'play' ? 'pause' : 'play';
    };

    // $rootScope.getTrackClass = function() {
    //     return $rootScope.trackClass;
    // };

    $rootScope.setTrackClass = function() {
        $rootScope.trackClass = $rootScope.track.imageurl === '' ? 'playorload' : 'cc_streaminfo';

        // if ($rootScope.track.imageurl === '') {
        //     $rootScope.trackClass = "playorload";
        // } else {
        //     $rootScope.trackClass = "cc_streaminfo";
        // }
    };

    //Function for the button. Should be self-explanatory
    $rootScope.onClick = function() {
        //Check to see if the event listener is set. If it isn't, add one!
        if (!$rootScope.listener) {
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
        }

        //Set the play buttons class
        $rootScope.song = '';
        $rootScope.setPlayClass();
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
            }

            try {
                //Cordova plugin that changes the metadata for iOS lock screen
                window.NowPlaying.updateMetas($rootScope.track.artist, $rootScope.track.title, $rootScope.track.album);
            } catch (e) {
                // console.log(e);
            }
        });
    };

    //Share the current track
    $rootScope.share = function(record) {
        record = record ? record : $rootScope.track;

        try {
            //Call the share plugin
            window.plugins.socialsharing.share('Check out ' + record.artist + ' - ' + record.title +  ' on Nerdy.FM!', null, null, 'http://www.nerdy.fm');
        } catch (e) {
            // console.log(e);
        }
    };
});
