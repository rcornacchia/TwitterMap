var map;
var tweets = [];
var gMarkers = [];
var currentCandidate = "All Candidates";
var range = "1000";

// for local testing
// var tweetsURL = "http://localhost:8081/getTweets";
// var locationURL = "http://localhost:8081/getTweetsWithLocation"

// endpoints when hosted on aws elastic beanstalk
var tweetsURL = "http://noes.us-west-2.elasticbeanstalk.com/getTweets"
var locationURL = "http://noes.us-west-2.elasticbeanstalk.com/getTweetsWithLocation"
function mapTweets(data) {
    tweets = [];
    obj = data;
    for(var i=0; i<obj.hits.hits.length; i++){
        tweets.push([obj.hits.hits[i]._source.location, obj.hits.hits[i]._source.text]);
    }
    console.log(tweets.length);
    tweets.forEach(function(tweet) {
        // console.log(tweet[1]);
        var position_options = {
            lat: parseFloat(tweet[0].lat),
            lng: parseFloat(tweet[0].lon)
        };
        var infowindow = new google.maps.InfoWindow({
            content: tweet[1]
        });
        var marker = new google.maps.Marker({
            position: position_options,
            map: map
        });
        gMarkers.push(marker);
        google.maps.event.addListener(marker, 'click', (function () {
            infowindow.open(map, marker);
        }));
    });
}
function initMap() {
    $(function(){
       $(".dropdown-menu li a").click(function(){
         $(".btn:first-child").text($(this).text());
         $(".btn:first-child").val($(this).text());
      });
    });
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 38, lng: -97},
        zoom: 5
    });
    google.maps.event.addListener(map, "click", function(event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        console.log("Lat=" + lat + "; Lng=" + lng + "; Range= " + range);
        map.clearOverlays();
        $.post(locationURL, {candidate: currentCandidate, lat: lat, lng: lng, range: range}, function(data){
            mapTweets(data);
        });
    });
    // fetch all tweets
    $.post(tweetsURL, {candidate: currentCandidate}, function(data){
        mapTweets(data);
    });
    // delete marker function
    google.maps.Map.prototype.clearOverlays = function() {
        for (var i = 0; i < gMarkers.length; i++ ) {
            gMarkers[i].setMap(null);
        }
        gMarkers = [];
    }
}
$(document).ready(function(){
    $(document.body).on('click', '.dropdown li a', function (e) {
        // delete existing markers
        map.clearOverlays();
        currentCandidate = $(this).text();
        console.log(currentCandidate);
        $(this).parents('.dropdown').find('.dropdown-toggle').html(currentCandidate+'<span class="caret"></span>');

        $.post(tweetsURL, {candidate: currentCandidate}, function(data){
            mapTweets(data);
        });
    });
});
$(document).ready(function(){
    $("#btnSubmit").on('click', function(e){
        e.preventDefault();
        range = $("#range").val();
        $("#range").val('');
        $("#rangeText").text("Current Range: "+range+"km");
    });
});
$(document).ready(function(){
    $("#rangeReset").on('click', function(e){
        e.preventDefault();
        //clear map
        map.clearOverlays();
        //refetch tweets
        $.post(tweetsURL, {candidate: currentCandidate}, function(data){
            mapTweets(data);
        });
    });
});
