const express = require("express");
const app = express();
const cors = require('cors');
const request = require('request');
const async = require('async');
const yelp = require('yelp-fusion');

app.use(express.json());
app.use(express.static('public'));
app.use(cors());

const KEY = "AIzaSyD_Nmtab4VTW4ShRv2xcjq37XusO7AOLyQ";

const YELP_KEY = "TraPMY0Yh3JnRhzeu9jGXC8pgZQj0Dtew3FIwMRU38b7gwTQUO4q01gbyACvAZNAWyJ3PaetclCAVEde-LF5AUWPRIgwCuKzM9g3iplVmKmygO7-mqOls_FfKszOWnYx"
const yelp_client = yelp.client(YELP_KEY);

//url = "https://maps.googleapis.com/maps/api/geocode/json?address=seattle&key=AIzaSyD_Nmtab4VTW4ShRv2xcjq37XusO7AOLyQ"

genericGetRequest = function(req, res, url){
    async.parallel([
        function(callback) {
            console.log(url);
            request(url, function(err, response, body) {
                if(err) { console.log(err); callback(true); return; }
                obj = JSON.parse(body);
                callback(false, obj);
            });
        },
    ],
    function(err, results) {
        if(err) { console.log(err); res.send(500,"Server Error"); return; }
        res.send({api0:results[0]});
    });
}


resultTableData = function(req, res) {
    let queryStrig = req.query;

    let keyword = queryStrig["keyword"];
    let category = queryStrig["category"];
    let distance = 10 * 1609.34;
    if(queryStrig["distance"] != 'null'){
        distance = parseFloat(queryStrig["distance"]) * 1609.34;
    }
    let location = queryStrig["location"];
    let locationText = queryStrig["locationText"];
    let lat = queryStrig["lat"];
    let lon = queryStrig["lon"];

    if(location == "location"){
        async.parallel([
            function(callback) {
                var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+ encodeURI(locationText) +"&key=" + KEY;
                console.log(url);
                request(url, function(err, response, body) {
                    if(err) { console.log(err); callback(true); return; }
                    obj = JSON.parse(body);
                    callback(false, obj);
                });
            },
        ],
        function(err, results) {
            if(err) { console.log(err); res.send(500,"Server Error"); return; }
            location_info = results[0];
            if (location_info !== undefined && location_info.hasOwnProperty('results')
                            && location_info["results"].length > 0){
                lat = location_info['results'][0]['geometry']['location']['lat'];
                lon = location_info['results'][0]['geometry']['location']['lng'];
            } else{
                return res.send({});
            }

            let place_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=";
            place_url = place_url + lat + "," + lon + "&radius=" + distance + "&type="
                    + encodeURI(category) + "&keyword=" + encodeURI(keyword) + "&key=" + KEY;;
            genericGetRequest(req, res, place_url);
        });
    } else{
        let place_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=";
            place_url = place_url + lat + "," + lon + "&radius=" + distance + "&type="
                    + encodeURI(category) + "&keyword=" + encodeURI(keyword) + "&key=" + KEY;;
        genericGetRequest(req, res, place_url);
    }
};

app.get("/resultTable", (req, res)=>{
    resultTableData(req, res);
});

app.get("/resultTableNext", (req, res)=>{
    let pagetoken = req.query["pagetoken"];
    let url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken="
    url += pagetoken + "&key=" + KEY;
    genericGetRequest(req, res, url);
});

app.get("/getGeoLocation", (req, res)=>{
    let url = "https://maps.googleapis.com/maps/api/geocode/json?address="
    url += encodeURI(req.query['location']) +"&key=" + KEY;
    genericGetRequest(req, res, url);
});

app.get("/getYelpReviews", (req, res)=>{
    let name = decodeURI(req.query['name']);
    let address = decodeURI(req.query['address']);
    let city = decodeURI(req.query['city']);
    let state = decodeURI(req.query['state']);
    let country = decodeURI(req.query['country']);

    yelp_client.businessMatch('best', {
        name: name,
        address1: address,
        city: city,
        state: state,
        country: country
    }).then(response => {
        if(response.jsonBody.hasOwnProperty('businesses') &&
                response.jsonBody.businesses.length > 0 &&
                response.jsonBody.businesses[0].hasOwnProperty('alias')){

            let name = response.jsonBody.businesses[0].alias;

            yelp_client.reviews(name).then(response => {
                res.send(response.jsonBody);
            }).catch(e => {
                console.log(e);
                res.send([]);
            });
        } else{
            res.send([])
        }
    }).catch(e => {
        console.log(e);
        res.send([]);
    });

});


var port = process.env.PORT || 8081;

app.listen(port, () => console.log("Listening to port ", port));
