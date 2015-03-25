angular.module('nerdyfm.controller', [])

.controller('PlayCtrl', function($scope, $http, $interval, $cordovaDevice) {

    $scope.audio = document.getElementById("audiostream"); //Get our audio element
    $scope.androidAudio = undefined;
    $scope.class = "play"; //Set dumb variable for play button
    $scope.track = { title: 'Click play!' }; //Let the user know what to do
    $scope.listener = false; //Dumby boolean for checking event listener status

    //Used to tell the button which CSS class to display on the frontend
    $scope.getClass = function() {
        return $scope.class;
    };

    //Changes the class of the play button
    $scope.setClass = function() {
        $scope.class = $scope.class === "play" ? "pause" : "play";
    };

    //Function for the button. Should be self-explanatory
    $scope.onClick = function() {
    	//Check to see if the event listener is set. If it isn't, add one!
    	if(!$scope.listener) {
    		document.addEventListener("remote-event", function(event) {
				$scope.onClick();
			});

			$scope.listener = true;
    	}

    	if($cordovaDevice.getPlatform() === 'iOS' && $scope.audio.paused) {

    		//Change the track object. Kind of crappy but it works
            $scope.track = {
                artist: '',
                title: 'Loading...',
                album: '',
                imageurl: ''
            };

    		//Set the source
    		$scope.audio.src = 'http://streams4.museter.com:8344/;stream.nsv';
            $scope.audio.load(); //Reload the stream. Gets the user up-to-date with the stream
            $scope.audio.play(); //Finally, play it

            //Get the current streaming song. This function will change the track object
            $scope.getListing();
            $scope.startInterval();

    	} else if($cordovaDevice.getPlatform() === 'Android' && !$scope.androidAudio) {

    		//Change the track object. Kind of crappy but it works
            $scope.track = {
                artist: '',
                title: 'Loading...',
                album: '',
                imageurl: ''
            };

        	$scope.androidAudio = new Media('http://streams4.museter.com:8344/;stream.nsv');
        	$scope.androidAudio.play();
            $scope.getListing();
            $scope.startInterval();

    	} else {
    		if($cordovaDevice.getPlatform() === 'iOS') {
    			$scope.audio.pause(); //Pause the song
            	$scope.audio.src = '';//Remove the source (stops the streaming)
    		} else {
    			$scope.androidAudio.stop();
    			$scope.androidAudio.release();
        		$scope.androidAudio = undefined;
    		}

            $interval.cancel($scope.stop); //Cancel the interval
            $scope.stop = undefined; //Set interval object to undefined

            //Reset the track object
            $scope.track = {
                artist: '',
                title: 'Click play!',
                album: '',
                imageurl: ''
            };
        }

        //Set the play buttons class
        $scope.setClass();
    };

    //Set a 15 second interval to check if the current song has changed
	//If an interval is already set then we're already playing.
    $scope.startInterval = function() {
        if (angular.isDefined($scope.stop)) {
        	return;
        } else {
        	$scope.stop = $interval(function() {
		        $scope.getListing();
		    }, 15000);
        }
    };

    //This function generates a random number and checks the current streaming song
    //Random number is necessary, otherwise we'd run into cached requests
    $scope.getListing = function() {
        var random = Math.floor((Math.random() * 10000) + 1);
        $http.get('http://streams4.museter.com:2199/external/rpc.php?m=streaminfo.get&username=nerdyfm&charset=&mountpoint=&rid=nerdyfm&_=' + random).success(function(data) {
            //If the song is different then change it
            if ($scope.track !== data.data[0].track) {
            	$scope.track = data.data[0].track;

            	var params = [$scope.track.artist, $scope.track.title, $scope.track.album, $scope.track.imageurl];

            	try {
            		//Cordova plugin that changes the metadata for iOS lock screen
            		window.NowPlaying.updateMetas($scope.track.artist, $scope.track.title, $scope.track.album);
            	} catch (e) {
            		console.log(e);
            	}
            }
        });
    };
});
