// Setup web server and socket
var express = require('express'),
    http = require('http'),
    request = require('request'),
    // twitter = require('ntwitter'),
    // elasticSearch = require('elasticSearch'),
    bodyParser = require("body-parser");
var app = express();

var headers = {
    // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
    'Content-Type' : 'application/x-www-form-urlencoded'
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
// create client for elastic search
// var client = new elasticSearch.Client({
//     host: 'search-candidates-cjppiuv3s4xsksv4prai7gcohm.us-west-2.es.amazonaws.com',
//     log: 'trace'
// });
function myCallback(response) {
    console.log('test');
    // var str = '';
    //
    // //another chunk of data has been recieved, so append it to `str`
    // response.on('data', function (chunk) {
    //   str += chunk;
    // });
    //
    // //the whole response has been recieved, so we just print it out here
    // response.on('end', function () {
    //   console.log(str);
    // });
    // data = str;
    // console.log(data);
    // var obj = JSON.parse(data);
    // for(var i=0; i<obj.hits.hits.length; i++){
    //     tweets.push([obj.hits.hits[i]._source.location, obj.hits.hits[i]._source.text]);
    // }
    // tweets.forEach(function(tweet) {
    //     var position_options = {
    //         lat: parseFloat(tweet[0].lat),
    //         lng: parseFloat(tweet[0].lon)
    //     };
    //     var infowindow = new google.maps.InfoWindow({
    //         content: tweet[1]
    //     });
    //
    //     var marker = new google.maps.Marker({
    //         position: position_options,
    //         map: map
    //     });
    //     google.maps.event.addListener(marker, 'click', (function () {
    //         infowindow.open(map, marker);
    //     }));
    // });
}
// var options = {
//   host: 'http://search-candidates-cjppiuv3s4xsksv4prai7gcohm.us-west-2.es.amazonaws.com/geoindex/_search?size=20000',
//   path: '/'
// };
//
// function queryAll() {
//     url = "http://search-candidates-cjppiuv3s4xsksv4prai7gcohm.us-west-2.es.amazonaws.com/geoindex/_search?size=20000";
//     var xmlHttp = new XMLHttpRequest();
//     xmlHttp.onreadystatechange = function() {
//         if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
//             data = xmlHttp.responseText;
//     };
//     xmlHttp.open("GET", url, true); // true for asynchronous
//     xmlHttp.send(null);
//     return data;
// }
// handle requests for specific candidates and all candidates
app.post('/getTweets', function(req,res) {
    // res.send("Hello");
    var candidate = req.body.candidate;
    // console.log(candidate);
    if (candidate == "All Candidates") {
        request.post({
            url: 'http://search-candidates-cjppiuv3s4xsksv4prai7gcohm.us-west-2.es.amazonaws.com/geoindex/_search',
            json: {
                size : "5000",
                query : {
                    match_all : {}
                }
            },
            headers: headers
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.json(body);
            }
        });
    } else {
        request.post({
            url: 'http://search-candidates-cjppiuv3s4xsksv4prai7gcohm.us-west-2.es.amazonaws.com/geoindex/_search',
            json: {
                size : "5000",
                query : {
                    match : {
                        text : candidate
                    }
                }
            },
            headers: headers
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
            //   console.log(body);
                res.json(body);
            }
        });
    }
});

// handle requests for candidates + location
app.post('/getTweetsWithLocation', function(req,res) {
    var candidate = req.body.candidate;
    var lat = req.body.lat;
    var lng = req.body.lng;
    console.log("candidate: " + candidate + " lat: " + lat + " lng: " + lng);
    if (candidate == "All Candidates") {
    //     client.search({
    //         index: 'geoindex',
    //         size: 10000,
    //         body: {
    //             query: {
    //                 filtered: {
    //                     query : {
    //                         match_all : {}
    //                     },
    //                     filter: {
    //                         geo_distance: {
    //                             distance: '1000km',
    //                             location: {
    //                                 lat: lat,
    //                                 lon: lng
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }, function (error, response) {
    //         res.json(response);
    //     });
        request.post({
            url: 'http://search-candidates-cjppiuv3s4xsksv4prai7gcohm.us-west-2.es.amazonaws.com/geoindex/_search',
            json: {
                size : "5000",
                query: {
                    filtered: {
                        query : {
                            match_all : {}
                        },
                        filter: {
                            geo_distance: {
                                distance: '1000km',
                                location: {
                                    lat: lat,
                                    lon: lng
                                }
                            }
                        }
                    }
                }
            },
            headers: headers
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.json(body);
            }
        });
    } else {
        request.post({
            url: 'http://search-candidates-cjppiuv3s4xsksv4prai7gcohm.us-west-2.es.amazonaws.com/geoindex/_search',
            json: {
                size : "5000",
                query: {
                    filtered: {
                        query : {
                            match : {
                                text : candidate
                            }
                        },
                        filter: {
                            geo_distance: {
                                distance: '1000km',
                                location: {
                                    lat: lat,
                                    lon: lng
                                }
                            }
                        }
                    }
                }
            },
            headers: headers
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
                res.json(body);
            }
        });
    }
    // } else {
    //     client.search({
    //         index: 'geoindex',
    //         size: 10000,
    //         body: {
    //             query: {
    //               filtered: {
    //                     query : {
    //                         match : {
    //                             text: candidate
    //                         }
    //                     },
    //                   filter: {
    //                       geo_distance: {
    //                           distance: '1000km',
    //                           location: {
    //                               lat: lat,
    //                               lon: lng
    //                           }
    //                       }
    //                   }
    //                 }
    //               }
    //         }
    //     }, function (error, response) {
    //         res.json(response);
    //     });
    // }
});

// listen on port 3000 or env port
app.listen(process.env.PORT || 8081);
console.log("server started on 8081");

// Setup twitter stream api
// var twit = new twitter({
//     consumer_key: 'cu607zV20zgS5deVCjJphwFfc',
//     consumer_secret: 'niSiKTDe5b30XMshQMmwmLz2SqVfDsksxNIyyVjySALU6YfkYv',
//     access_token_key: '2475805220-VabahyH70uVb5ypd3oI48iLYw1oQSlPIzwB0Yi0',
//     access_token_secret: '3bSwrTiH5ukl3L3lXMfY1zFjB1x6GOUR9DIeLW0zb8vPQ'
// }),
// stream = null;

// // create index
// client.indices.create({
//     index: 'geoindex',
//     body: {
//         mappings: {
//             candidateTweet: {
//                 properties: {
//                     location: {
//                         type: 'geo_point'
//                     }
//                 }
//             }
//         }
//     }
// });


//Create web sockets connection.
// twit.stream('statuses/filter', {
//     track: ['Trump', 'Clinton', 'Sanders', 'Ted Cruz', 'Marco Rubio', 'Ben Carson', 'Kasich', 'Jeb Bush', 'Carly Fiorina', 'Mike Huckabee']
// }, function(stream) {
//     stream.on('data', function (data) {
//         if (data.geo) {
//             console.log(data.place.full_name, data.text, data.geo.coordinates[0], data.geo.coordinates[1]);
//             client.create({
//                 index: 'geoindex',
//                 id: data.id,
//                 type: 'candidateTweet',
//                 body: {
//                     text: data.text,
//                     location: {
//                         "lat": data.geo.coordinates[0],
//                         "lon": data.geo.coordinates[1]
//                     }
//                 }
//             }, function (error, response) {
//                 console.log("inserted record");
//             });
//         }
//     });
// });

// // code used to migrate indices
// client.search({
//     index: 'candidates2',
//     size: 10000,
//     body: {
//         query: {
//           filtered: {
//                 query : {
//                     match_all: {}
//                 },
//             }
//         }
//     }
// }, function (error, response) {
//     data = response;
//     tweets = [];
//     obj = data;
//     var lat, lng, text;
//     for(var i=0; i<obj.hits.hits.length; i++){
//         tweets.push([obj.hits.hits[i]._source.location, obj.hits.hits[i]._source.text]);
//     }
//     tweets.forEach(function(tweet) {
//         lat = parseFloat(tweet[0].lat);
//         lng = parseFloat(tweet[0].lon);
//         text = tweet[1];
//         console.log(text + " lat: " + lat + " lat: " + lng);
//         client.create({
//             index: 'geoindex',
//             type: 'candidateTweet',
//             body: {
//                 text: text,
//                 location: {
//                     "lat": lat,
//                     "lon": lng
//                 }
//             }
//         }, function (error, response) {
//         });
//     });
// });



//TODO add get request
//get candidate_name, and query the elasticsearch db with candidate_name
//upon response return json to client

// TODO add get request
// get tweets within geolocation
