// Setup web server and socket
var express = require('express'),
    http = require('http'),
    request = require('request'),
    twitter = require('ntwitter'),
    bodyParser = require("body-parser"),
    AWS = require('aws-sdk'),
    app = express(),
    AlchemyAPI = require('alchemy-api')
    queueUrl ="https://sqs.us-west-2.amazonaws.com/713208773927/TweetQueue",
    receipt ="AQEBMd5dMKkVzhjem3C95hGv7GDL2eIkCAp2qzpUJ7YMxRnxay94emaXhDNNzR6yEEZ2++0sV2krMzCR6PNn+nX1QHRlfhHhLh5wARspZwzvs2JRt5gBTreG5DHqCCABJ3KuG1gLa3oPku0Orxqeg5zc9FAJ0yA64csTWtzHNB9lVs+SCRRrVS+V7dEEVqX0IcTtYtcKFZBb90O1x7lGMi7NBUTjEzVXvFQWOkzjvox2IZGEN3Y58NPz6IN+hQ7HLAnY+l2vAlZv7WWxHrQQvwUwu2yJoXkNShwLxt2pYJnA9CqutBGIwfymRaxRZPgfmv2jcUo1SreU6OmTvq/RMl2K6r2QnGlo6AhxjfOfo44H/iOH3iw5ajpNfFOxwT1qAlJI+o+C+J8nn1qVSBlLpXUteQ==",
    AlchemyAPI = require('./alchemyapi'),
    alchemyapi = new AlchemyAPI('796dd926f322f9080f17ead866da416525781144');

var headers = {
    'Content-Type' : 'application/x-www-form-urlencoded'
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// handle requests for specific candidates and all candidates
app.post('/getTweets', function(req,res) {
    var candidate = req.body.candidate;
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
    var range = req.body.range + "km";
    // console.log("candidate: " + candidate + " lat: " + lat + " lng: " + lng);
    if (candidate == "All Candidates") {
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
                                distance: range,
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
                                distance: range,
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
                // console.log(body);
                res.json(body);
            }
        });
    }

});

// listen on port 3000 or env port
app.listen(process.env.PORT || 8081);
console.log("server started on 8081");

// Setup twitter stream api
var twit = new twitter({
    consumer_key: 'cu607zV20zgS5deVCjJphwFfc',
    consumer_secret: 'niSiKTDe5b30XMshQMmwmLz2SqVfDsksxNIyyVjySALU6YfkYv',
    access_token_key: '2475805220-VabahyH70uVb5ypd3oI48iLYw1oQSlPIzwB0Yi0',
    access_token_secret: '3bSwrTiH5ukl3L3lXMfY1zFjB1x6GOUR9DIeLW0zb8vPQ'
}),
stream = null;

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
twit.stream('statuses/filter', {
    track: ['and','Trump', 'Clinton', 'Sanders', 'Ted Cruz', 'Marco Rubio', 'Ben Carson', 'Kasich', 'Jeb Bush', 'Carly Fiorina', 'Mike Huckabee']
}, function(stream) {
    stream.on('data', function (data) {
        if (data.geo && data.lang == "en") {
//<<<<<<< HEAD
            console.log(data.place.full_name, data.text, data.geo.coordinates[0], data.geo.coordinates[1]);
            sentiment(data.text)
            // client.create({
            //     index: 'geoindex',
            //     id: data.id,
            //     type: 'candidateTweet',
            //     body: {
            //         text: data.text,
            //         location: {
            //             "lat": data.geo.coordinates[0],
            //             "lon": data.geo.coordinates[1]
            //         }
            //     }
            // }, function (error, response) {
            //     console.log("inserted record");
            // });
//=======

          //not sure how to pass sentiment from proess sentiment to indexing
          //IndexTweets(data, tweetSentiment)
          //PlaceinQ(data)
        }
    });
});

function PlaceinQ (data){
// Load your AWS credentials and try to instantiate the object.
AWS.config.accessKeyId = 'AKIAJF5I5J6HW652XSUA';
AWS.config.secretAccessKey = 'ZT9aqCu7ylegeJ6CCulLcQsNQl+1xeRiRVS7BxzA';
AWS.config.region = 'us-west-2';
// Instantiate SQS.
var sqs = new AWS.SQS();

// Creating a queue.

app.get('/create', function (req, res) {
    var params = {
        QueueName: "TweetQueue"
    };

    sqs.createQueue(params, function(err, data) {
        if(err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
});

// Sending a message.
app.get('/send', function (req, res) {
    var params = {
        MessageBody: 'Hello world!',
        QueueUrl: queueUrl,
        DelaySeconds: 0
    };

    sqs.sendMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
});

app.get('/receive', function (req, res) {
    var params = {
        QueueUrl: queueUrl,
        VisibilityTimeout: 600 // 10 min wait time for anyone else to process.
    };

    sqs.receiveMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
});

app.get('/delete', function (req, res) {
    var params = {
        QueueUrl: queueUrl,
        ReceiptHandle: receipt
    };

    sqs.deleteMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        }
        else {
            res.send(data);
//>>>>>>> 1c0e5ebbcaa3703795ad80fdf4c02ad5cb5412a0
        }
    });
});


}
//this needs to be fixed
function IndexTweets(data, tweetSentiment){
//need to index separately from streaming
client.create({
    index: 'geoindex',
    id: data.id,
    type: 'candidateTweet',
    body: {
        text: data.text,
        tweetSentiment: tweetSentiment,
        location: {
            "lat": data.geo.coordinates[0],
            "lon": data.geo.coordinates[1]
        }
    }
}, function (error, response) {
    console.log("inserted record");
});
};


function sentiment(demo_text) {
  //var demo_text = 'Today is a terrible day.';
	alchemyapi.sentiment('text', demo_text, {}, function(response) {
		console.log(demo_text +" " + response["docSentiment"]["type"] +" " + response["docSentiment"]["score"]);
    //text(req, res, output);
	});
}

// function processSentiment(sampleText){
//   //setting up alchemy API
//   var alchemy = new AlchemyAPI('796dd926f322f9080f17ead866da416525781144');
//   //var sampleText = "This class is the best thing that has ever happened!";
//   alchemy.sentiment('text', sampleText, function(err, response) {
//       if (err) throw err;
//
//       var sentimentTest = response.docSentiment.type;
//       console.log(sampleText, sentimentTest);
//       processSentiment =  sentimentTest
// })
// };

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
