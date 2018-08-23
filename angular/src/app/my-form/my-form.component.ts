import { Component, Input, OnInit, ViewChild, ElementRef, Inject, 
    AfterViewInit, ChangeDetectorRef} from '@angular/core';
import {FormControl, FormGroup, Validators, FormBuilder} from "@angular/forms";
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'
import { } from 'googlemaps';
import { AllService } from '../all.service';
import * as moment from 'moment';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { keyframes } from '@angular/animations';

import {
    trigger,
    state,
    style,
    animate,
    transition
} from '@angular/animations';

declare var $ : any
declare var rateYo:any;

@Component({
    selector: 'app-my-form',

    templateUrl: './my-form.component.html',
    styleUrls: ['./my-form.component.css'],
    animations: [
        trigger('fromLeftRight', [
            state('show' , style({transform: 'translateX(0)' })),
            transition('* => show', [
                style({transform: 'translateX(-100%)'}),
                animate(500)
            ])
        ]),
        trigger('fromRightleft', [
            state('show' , style({transform: 'translateX(0)' })),
            transition('* => show', [
                style({transform: 'translateX(100%)'}),
                animate(500)
            ])
        ]),
        trigger('fading', [
            state('show' , style({ opacity: 1 })),
            state('hidden', style({ opacity: 1 })),
            transition('* => *', animate('1.5s', keyframes([
                style({opacity: 0, offset: 0}),
                style({opacity: 1, offset: 1.0})
            ])))
        ])        
    ]
})
export class MyFormComponent {
    myform: FormGroup;
    myGoogleMapForm: FormGroup;
    reviewForm: FormGroup;

    detailVisibility = "hidden";
    tableVisibility = "hidden";

    fadingReviewGoogle = "show";
    fadingReviewYelp = "hidden";

    // Main form
    submitted = false;
    locationFound = false;
    curLat = 34.018844;
    curLon = -118.292196;
    progressBar = false;

    category = [
        {name: 'default', display: 'Default'},
        {name: 'airport', display: 'Airport'},
        {name: 'amusement_park', display: 'Amusement Park'},
        {name: 'aquarium', display: 'Aquarium'},
        {name:'art_gallery', display: 'Art Gallery'},
        {name:'bakery', display: 'Bakery'},
        {name:'bar', display: 'Bar'},
        {name:'beauty_salon', display: 'Beauty Salon'},
        {name:'bowling_alley', display: 'Bowling Alley'},
        {name:'bus_station', display: 'Bus Station'},
        {name:'cafe', display: 'Cafe'},
        {name:'campground', display: 'Campground'},
        {name:'car_rental', display: 'Car Rental'},
        {name:'casino', display: 'Casino'},        
        {name:'lodging', display: 'Lodging'},
        {name:'movie_theater', display: 'Movie Theater'},
        {name:'museum', display: 'Museum'},
        {name:'night_club', display: 'Night Club'},        
        {name:'park', display: 'Park'},
        {name:'parking', display: 'Parking'},
        {name:'restaurant', display: 'Restaurant'},        
        {name:'shopping_mall', display: 'Shopping Mall'},
        {name:'stadium', display: 'Stadium'},
        {name:'subway_station', display: 'Subway Station'},
        {name:'taxi_stand', display: 'Taxi Stand'},
        {name:'train_station', display: 'Train Station'},
        {name:'transit_station', display: 'Transit Station'},
        {name:'travel_agency', display: 'Travel Agency'},
        {name:'zoo', display: 'Zoo'}
    ]

    @ViewChild("searchPlaces") public searchElementRef: ElementRef;
    resultBtnSelect = true;
    
    // ResultTable
    tableResultJsonData = [];
    renderResultTable = false;
    nextPageToken = "";
    prevPageToken = "";
    submitFormQueryParams="";
    curPage = 0;
    pagingUrlHistory = {};

    // ResultTab
    selectedTableRow = {};
    renderDetailTabs = false;
    
    completePlaceDetail:any;

    // Favourite ResultTab
    allFavouriteData = {};
    favouriteData = [];
    hasPreviousFavourite = false;
    hasNextFavourite = false;
    curFavouritePage = 0;
    orderListLocalStorage = [];
    
    // Info data objects
    infoTabData = [];
    weekdayTable = [];
    photoGridColumn1 = [];
    photoGridColumn2 = [];
    photoGridColumn3 = [];
    photoGridColumn4 = [];
    @ViewChild("rating") public rating: ElementRef;
    @ViewChild("map") public mapRef: ElementRef;
    
    // Google Maps
    @ViewChild("searchGoogleFrom") public searchGoogleFromElementRef: ElementRef;
    @ViewChild("mapDiv") public mapDivRef: ElementRef;
    @ViewChild("mapDivDirection") public mapDivDirectionRef: ElementRef;
    @ViewChild("pegmanDiv") public pegmanDivRef: ElementRef;
    
    destLat:any;
    destLon:any;
    directionsDisplay:any;
    directionsService:any;
    marker:any;
    isPegman = false;
    myGoogleMapPegmanToggle: any;
    panorama: any;

    travel_mode = [
        {name: 'DRIVING', display: 'Driving'},
        {name: 'BICYCLING', display: 'Bicycling'},
        {name: 'TRANSIT', display: 'Transit'},
        {name: 'WALKING', display: 'Walking'}
    ];      

    // Reviews Tab
    reviewType = [
        {name: 'google', display: 'Google Reviews'},
        {name: 'yelp', display: 'Yelp Review'}
    ]; 
    reviewOrder = [
        {name: 'default', display: 'Default Order'},
        {name: 'highRating', display: 'Highest Rating'},
        {name: 'lowRating', display: 'Lowest Rating'},
        {name: 'mostRecent', display: 'Most Recent'},
        {name: 'leastRecent', display: 'Least Recent'}
    ]; 
    defaultReviewGoogle = [];
    defaultReviewYelp = []
    requiredReviewOrder = [];
    selectedReview = 'google';

    // Twitter link
    twitter_link = "";

    // Error message
    tblErrorMsg = "";
    tblErrorMsgWarning = false;

    favErrorMsg = "";
    
    detailErrorMsg = "";

    detailErrorMsgInfo = "";
    detailErrorMsgWarningInfo = false;

    detailErrorMsgPhoto = "";
    detailErrorMsgWarningPhoto = false;

    detailErrorMsgReview = "";
    detailErrorMsgWarningReview = false;

    constructor(fb: FormBuilder, 
                private allService: AllService, 
                private ref: ChangeDetectorRef){
        this.myform = fb.group({
            "keyword": "",
            "category": new FormControl(this.category[0]),
            "distance": new FormControl(null),
            "location": new FormControl("here"),
            "autocomplete": new FormControl({value: '', disabled: true}, Validators.required)
        });

        this.myGoogleMapForm = fb.group({
            "from": new FormControl({value: 'Your location'}, Validators.required),
            "to": "",
            "travel_mode": new FormControl(this.travel_mode[0]),
        });

        this.reviewForm = fb.group({
            "reviewType": new FormControl(this.reviewType[0]),
            "reviewOrder": new FormControl(this.reviewOrder[0])
        })

        this.orderListLocalStorage = [];
        if(localStorage.hasOwnProperty('orderlist')){
            this.orderListLocalStorage = JSON.parse(localStorage.getItem('orderlist'));
        } else{
            localStorage.setItem('orderlist', JSON.stringify([]));
        }
        this.populateFavourites();

        this.detailVisibility = "hidden";
        this.tableVisibility = "hidden";
        this.fadingReviewGoogle = "show";
        this.fadingReviewYelp = "hidden";
    }

    ngOnInit(){
        console.log("calling ngOnInit");
        this.myform = new FormGroup({
            "keyword": new FormControl('', [
                Validators.required,
                (control: FormControl) => {
                    let isWhitespace = (control.value || '').trim().length === 0;
                    let isValid = !isWhitespace;
                    return isValid ? null : { 'whitespace': true }
                }
            ]),
            "category": new FormControl(this.category[0]),
            "distance": new FormControl(null),
            "location": new FormControl("here"),
            "autocomplete": new FormControl({value: '', disabled: true}, [
                Validators.required,
                (control: FormControl) => {
                    let isWhitespace = (control.value || '').trim().length === 0;
                    let isValid = !isWhitespace;
                    return isValid ? null : { 'whitespace': true }
                }
            ]),
        });
        
        this.myform["autocomplete"] = new google.maps.places.Autocomplete(
            (this.searchElementRef.nativeElement),
            {types: ['geocode']}
        );

        this.allService.getIpLocation().subscribe(
            res => {
                this.curLat = res['lat'];
                this.curLon = res['lon'];
                this.locationFound = true;
            },
            err => {
                this.tblErrorMsg = "Failed to get search result";
            }           
        );

        this.myGoogleMapForm = new FormGroup({
            "from": new FormControl("Your location", [
                Validators.required,
                (control: FormControl) => {
                    let isWhitespace = (control.value || '').trim().length === 0;
                    let isValid = !isWhitespace;
                    return isValid ? null : { 'whitespace': true }
                }
            ]),
            "to": new FormControl(null),
            "travel_mode": new FormControl(this.travel_mode[0])
        });

        
        this.reviewForm = new FormGroup({
            "reviewType": new FormControl(this.reviewType[0]),
            "reviewOrder": new FormControl(this.reviewOrder[0])
        })
        this.sortReview();
        this.selectedReviewDropdown();
    }

    populateFavourites(){
        this.allFavouriteData = {};
        this.favouriteData = [];
        this.hasNextFavourite = false;
        this.hasPreviousFavourite = false;

        if(this.orderListLocalStorage.length == 0){
            this.favErrorMsg = "No records";
            return;
        } else{
            this.favErrorMsg = "";
        }

        for (var i = 0; i < this.orderListLocalStorage.length; i++){
            let row = JSON.parse(localStorage.getItem(this.orderListLocalStorage[i]))
            let pageNum = Math.floor(i/20);
            if(pageNum == 0){
                this.favouriteData.push(row);
            }
            if(!this.allFavouriteData.hasOwnProperty(pageNum)){
                this.allFavouriteData[pageNum] = [];
            }
            this.allFavouriteData[pageNum].push(row);
        }        
        
        if(this.curFavouritePage != 0){
            if(!this.allFavouriteData.hasOwnProperty(this.curFavouritePage)){
                this.curFavouritePage = Object.keys(this.curFavouritePage).length - 1;
            }
            this.favouriteData = this.allFavouriteData[this.curFavouritePage];
            if(this.allFavouriteData.hasOwnProperty(this.curFavouritePage + 1)){
                this.hasNextFavourite = true;
            }
            if(this.allFavouriteData.hasOwnProperty(this.curFavouritePage - 1)){
                this.hasPreviousFavourite = true;
            }
        } else{
            this.hasNextFavourite = localStorage.length>20? true: false;
        }
    }

    isEmptyObject(obj) {
        return (obj && (Object.keys(obj).length === 0));
    }

    isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    
    switchRadioBtnLocation(btnValue: string):void{
        if(btnValue == "location"){
            this.myform.controls.autocomplete.enable();
        } else{            
            this.myform.controls.autocomplete.disable();
        }
    }

    resetAll(){
        this.myform.reset();
        this.myform.setValue({ 
            "keyword": '', 
            "category": this.category[0],
            "distance": 10,
            "location": "here",
            "autocomplete": "location"
        });
        this.myform.controls.autocomplete.disable();

        this.submitted = false;
        this.resultBtnSelect = true;
        this.progressBar = false;

        // ResultTable
        this.tableResultJsonData = [];
        this.renderResultTable = false;
        this.nextPageToken = "";
        this.prevPageToken = "";
        this.submitFormQueryParams="";
        this.curPage = 0;
        this.pagingUrlHistory = {};

        // ResultTab
        this.selectedTableRow = {};
        this.renderDetailTabs = false;
        this.detailVisibility = "hidden";
        this.tableVisibility = "hidden";
        this.fadingReviewGoogle = "show";
        this.fadingReviewYelp = "hidden";
        
        // Favourite ResultTab
        this.allFavouriteData = {};
        this.favouriteData = [];
        this.hasPreviousFavourite = false;
        this.hasNextFavourite = false;
        this.curFavouritePage = 0;

        // Info data objects
        this.infoTabData = [];
        this.weekdayTable = [];
        this.photoGridColumn1 = [];
        this.photoGridColumn2 = [];
        this.photoGridColumn3 = [];
        this.photoGridColumn4 = [];

        this.isPegman = false;
        
        // Reviews
        this.defaultReviewGoogle = [];
        this.defaultReviewYelp = []
        this.requiredReviewOrder = [];
        this.selectedReview = "google";

        // Twitter
        this.twitter_link = "";

        // Error message
        this.tblErrorMsg = "";
        this.tblErrorMsgWarning = false;

        this.favErrorMsg = "";

        this.detailErrorMsg = "";

        this.detailErrorMsgInfo = "";
        this.detailErrorMsgWarningInfo = false;

        this.detailErrorMsgPhoto = "";
        this.detailErrorMsgWarningPhoto = false;

        this.detailErrorMsgReview = "";
        this.detailErrorMsgWarningReview = false;
        
    }

    updateTabelResultData(res){
        let data = res["api0"]
        this.tableResultJsonData = data["results"];
        this.renderResultTable = true;

        if(this.tableResultJsonData.length == 0){
            this.tblErrorMsg = "No records";
            this.tblErrorMsgWarning = true;
            return
        }
        
        let count = 1;
        for (let key in this.tableResultJsonData) {
            let place_id = this.tableResultJsonData[key]["place_id"];
            if(localStorage.hasOwnProperty(place_id)){
                this.tableResultJsonData[key]["inFavourite"] = true;
            } else{
                this.tableResultJsonData[key]["inFavourite"] = false;
            }
            this.tableResultJsonData[key]["id"] = count;
            count += 1;
        }
        
        
        if(data.hasOwnProperty('next_page_token')){
            this.pagingUrlHistory[this.curPage] = data["next_page_token"];
            this.nextPageToken = data["next_page_token"];
        } else{
            this.nextPageToken = "";
        }
        let prev = this.curPage-2;
        if(this.pagingUrlHistory.hasOwnProperty(prev)){
            this.prevPageToken = this.pagingUrlHistory[prev]
        } else{
            if(prev == 0){
                this.prevPageToken = "defaultPage";
            } else{
                this.prevPageToken = "";
            }            
        }
        console.log(this.tableResultJsonData)
        this.ref.detectChanges();
    }

    submitForm(value: any):void{
        this.progressBar = true;
        this.ref.detectChanges();
        this.submitted = true;
        this.renderResultTable = true;

        console.log(this.searchElementRef.nativeElement);

        let params = "keyword=" + value.keyword + "&category=" + value.category.name + "&distance="+ value.distance
                    + "&location=" + value.location + "&locationText=" + value.autocomplete 
                    + "&lat=" + this.curLat + "&lon=" + this.curLon;
        
        this.curPage = this.curPage + 1;
        this.submitFormQueryParams = params;
        
        this.allService.getTableResults(params).subscribe(
            res => {
                this.updateTabelResultData(res);
                this.progressBar = false;
                this.ref.detectChanges();
            },
            err => {
                this.progressBar = false;
                this.tblErrorMsg = "Failed to get search result";
            }
        );        
    }

    nextPage(){
        let params = "pagetoken=" + this.nextPageToken;
        this.curPage = this.curPage + 1;
        this.allService.getNextBtnResults(params).subscribe(
            res => {
                this.updateTabelResultData(res)
            }
        );
    }

    prevPage(){
        this.curPage -= 1
        if(this.curPage == 1){
            this.allService.getTableResults(this.submitFormQueryParams).subscribe(
                res => {
                    this.updateTabelResultData(res)
                }
            );
        } else if(this.curPage == 2 || this.curPage == 3){
            let params = "pagetoken=" + this.prevPageToken;
            this.allService.getNextBtnResults(params).subscribe(
                res => {
                    this.updateTabelResultData(res)
                }
            );
        }
    }

    nextFavouritePage(){
        let nextPage = this.curFavouritePage + 1;
        if(this.allFavouriteData.hasOwnProperty(nextPage)){
            this.favouriteData = this.allFavouriteData[nextPage];
            if(!this.allFavouriteData.hasOwnProperty(nextPage+1)){
                this.hasNextFavourite = false;
            }
            this.hasPreviousFavourite = true;
        } else{
            this.hasNextFavourite = false;
            this.hasPreviousFavourite = true;
        }
        this.curFavouritePage += 1
    }

    prevFavouritePage(){
        let prevPage = this.curFavouritePage - 1;
        if(this.allFavouriteData.hasOwnProperty(prevPage)){
            this.favouriteData = this.allFavouriteData[prevPage];
            if(!this.allFavouriteData.hasOwnProperty(prevPage-1)){
                this.hasPreviousFavourite = false;
            }
            this.hasNextFavourite = true;
        } else{
            this.hasPreviousFavourite = false;
            this.hasNextFavourite = true;
        }
        this.curFavouritePage -= 1
    }

    tableRowClick(row){
        this.selectedTableRow = row;
    }
    
    showResultTable(){
        this.renderResultTable = true;
        this.renderDetailTabs = false;
        this.detailVisibility = "hidden";
        this.tableVisibility = "show";
        this.infoTabData = [];
    }

    showDetailTab(rowValue){
        this.renderResultTable = false;
        this.renderDetailTabs = true;
        this.detailVisibility = "show";
        this.tableVisibility = "hidden";

        if(!this.isEmpty(rowValue)){
            this.selectedTableRow = rowValue;
        }

        var request = {
            placeId: this.selectedTableRow["place_id"]
        };

        this.detailErrorMsg = "";

        this.detailErrorMsgInfo = "";
        this.detailErrorMsgWarningInfo = false;

        this.detailErrorMsgPhoto = "";
        this.detailErrorMsgWarningPhoto = false;

        this.detailErrorMsgReview = "";
        this.detailErrorMsgWarningReview = false;

        let service = new google.maps.places.PlacesService(this.mapRef.nativeElement);
        service.getDetails(request, this.callbackPlaceDetail.bind(this)) 
    }

    addRemoveToFavourite(row){
        if(this.isEmpty(row)){
            row = this.selectedTableRow;
        }

        if(localStorage.hasOwnProperty(row['place_id'])){
            localStorage.removeItem(row['place_id']);
            var index = this.orderListLocalStorage.indexOf(row['place_id']);
            if (index !== -1) this.orderListLocalStorage.splice(index, 1);
        } else{
            localStorage.setItem(row['place_id'], JSON.stringify(row));
            this.orderListLocalStorage.push(row['place_id']);            
        }
        localStorage.setItem('orderlist', JSON.stringify(this.orderListLocalStorage));

        this.populateFavourites();

        for (var i = 0; i < this.tableResultJsonData.length; i++){
            let place_id = this.tableResultJsonData[i]['place_id'];
            
            if(localStorage.hasOwnProperty(place_id)){
                this.tableResultJsonData[i]["inFavourite"] = true;
            } else{
                this.tableResultJsonData[i]["inFavourite"] = false;
            }
        }
    }

    resultFavouriteBtn(btnValue){
        if(btnValue == "resultTable"){
            this.resultBtnSelect = true;
        } else{            
            this.resultBtnSelect = false;
        }
        this.selectedTableRow = {};
    }
    
    callbackPlaceDetail(place, status){
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            this.updateInfoDetails(place);
            this.updatePhotoDetails(place);
            this.updateGoogleMaps(place);
            this.updateReviewsGoogle(place);
            this.updateReviewsYelp(place);
            this.ref.detectChanges();
        } else{
            this.detailErrorMsg = "Detail Page error";
        }
    }

    dynamicSort(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }

    selectedReviewDropdown(){
        this.reviewForm.get('reviewType').valueChanges.subscribe(val => {
            this.fadingReviewGoogle = this.fadingReviewGoogle == "show"? "hidden": "show";
            this.fadingReviewYelp = this.fadingReviewGoogle == "show"? "hidden": "show";            

            let select_category = val['name'];
            if(select_category == "yelp"){
                if(this.defaultReviewYelp.length != 0){
                    this.detailErrorMsgReview = "";
                    this.detailErrorMsgWarningReview = false;
                } else{
                    this.detailErrorMsgReview = "No reviews available";
                    this.detailErrorMsgWarningReview = true;
                }
                this.selectedReview = "yelp";
            } else{
                if(this.defaultReviewGoogle.length != 0){
                    this.detailErrorMsgReview = "";
                    this.detailErrorMsgWarningReview = false;
                } else{
                    this.detailErrorMsgReview = "No reviews available";
                    this.detailErrorMsgWarningReview = true;
                }
                this.selectedReview = "google";
            }
            this.changeReviewContents(this.reviewForm.get('reviewOrder').value);
        });
    }

    changeReviewContents(sort_category){
        if(sort_category == "default"){
            sort_category = "default_sort";
        } else if(sort_category == "highRating"){
            sort_category = "-rating_sort";
        } else if(sort_category == "lowRating"){
            sort_category = "rating_sort";
        } else if(sort_category == "mostRecent"){
            sort_category = "-time_sort";
        } else{
            sort_category = "time_sort";
        }
        
        let newReviewList = [];
        let reviews = this.defaultReviewGoogle;
        if (this.selectedReview == "yelp"){
            reviews = this.defaultReviewYelp;
        }             
        
        for(let i in reviews){
            let newMap = {};
            for(let key in reviews[i]){
                newMap[key] = reviews[i][key]
            }
            newReviewList.push(newMap)
            newReviewList[i]['renderRating']()
        }
        this.requiredReviewOrder = newReviewList;
        this.requiredReviewOrder.sort(this.dynamicSort(sort_category));
        this.ref.detectChanges();
    }

    sortReview(){
        this.reviewForm.get('reviewOrder').valueChanges.subscribe(val => {
            let sort_category = val['name'];
            this.changeReviewContents(sort_category)
        });
    }

    
    updateReviewsGoogle(place){
        this.detailErrorMsgReview = "";
        this.detailErrorMsgWarningReview = false;
        if(!place.hasOwnProperty('reviews') || place['reviews'].length==0){
            this.detailErrorMsgReview = "No reviews available";
            this.detailErrorMsgWarningReview = true;
            return;
        }

        let reviewData = place['reviews'];
        
        this.defaultReviewYelp = [];

        // Default order Google
        for(let i in reviewData){
            let data = reviewData[i]
            let epochTime = data['time'];
            let dateVal = new Date(0);
            dateVal.setUTCSeconds(epochTime);
            let datetimeStr = dateVal.toISOString().split(".")[0].replace("T", " ")
            let divId = 'googleRatingDiv_' + i.toString()


            this.defaultReviewGoogle.push({
                'profile_photo_url': data['profile_photo_url'],
                'author_url': data['author_url'],
                'author_name': data['author_name'],
                'divId': divId,
                'time': datetimeStr,
                'text': data['text'],
                'default_sort': i,
                'rating_sort': data['rating'],
                'time_sort': data['time'],
                "renderRating": ()=>{
                    let ceil_rating = Math.ceil(data['rating']);
                    let rating_percent = data['rating']/ceil_rating* 100;
                    $(function () { 
                        $("#" + divId).rateYo({
                            normalFill: "#A0A0A0",
                            rating: rating_percent.toString() + "%",
                            numStars: ceil_rating,
                            readOnly: true,
                            starWidth: "15px"
                        });        
                    });   
                }
            })
            this.defaultReviewGoogle[i]['renderRating']()
        }
        this.requiredReviewOrder = this.defaultReviewGoogle;
    }

    updateReviewsYelp(place){
        this.defaultReviewYelp = [];
        let params = this.getYelpParams(place)
        console.log(params, "yelp params");
        let yelp_review = this.allService.getYelpReviews(params).subscribe(
            res => {
                this.updateYelpReviewData(res)
            },
            err => {
                
            }
        ) 
    }

    updateYelpReviewData(res){
        this.detailErrorMsgReview = "";
        this.detailErrorMsgWarningReview = false;
        if(!res.hasOwnProperty('reviews') || res['reviews'].length==0){
            this.detailErrorMsgReview = "No reviews available";
            this.detailErrorMsgWarningReview = true;
            return;
        }

        console.log(res, "yelp reviews")
        let reviews = res['reviews'];
        for(let i in reviews){
            let data = reviews[i]
            let create_datetime = new Date(data['time_created'])
            let datetime_epoch = create_datetime.getTime();
            let divId = 'yelpRatingDiv_' + i.toString()

            this.defaultReviewYelp.push({
                'profile_photo_url': data['user']['image_url'],
                'author_url': data['url'],
                'author_name': data['user']['name'],
                'divId': divId,
                'time': data['time_created'],
                'text': data['text'],
                'default_sort': i,
                'rating_sort': data['rating'],
                'time_sort': datetime_epoch,
                "renderRating": ()=>{
                    let ceil_rating = Math.ceil(data['rating']);
                    let rating_percent = data['rating']/ceil_rating* 100;
                    $(function () { 
                        $("#" + divId).rateYo({
                            normalFill: "#A0A0A0",
                            rating: rating_percent.toString() + "%",
                            numStars: ceil_rating,
                            readOnly: true,
                            starWidth: "15px"
                        });        
                    });   
                }
            })
            this.defaultReviewYelp[i]['renderRating']()
        }
    }

    getYelpParams(place){
        let name = place['name'];
        let address_data = place['address_components'];
        let country = "";
        let state = "";
        let city = "";
        let address = [];
        for (let row in address_data){
            if(address_data[row]["types"][0].startsWith("administrative_area")){
                if(address_data[row]["types"][0] == "administrative_area_level_1"){
                    state = address_data[row]['short_name'] 
                }
            }
            else if(address_data[row]["types"][0].startsWith("local")){
                if(address_data[row]["types"][0] == "locality"){
                    city = address_data[row]['short_name'] 
                }
            }
            else if(address_data[row]["types"][0].startsWith("postal")){
                //pass
            }
            else if(address_data[row]["types"][0] == "country"){
                country = address_data[row]['short_name'] 
            }
            else{
                address.push(address_data[row]['short_name'])
            }
        }
        let address_str = address.join(", ");

        let params = "name=" + name + "&address="+ address_str + "&city=" 
                        + city + "&state=" + state + "&country=" + country;
        return params;
    }

    setReviewRatings(review){
        for(let i in review){
            let data = review[i];
            let ceil_rating = Math.ceil(data['rating']);
            let rating_percent = data['rating']/ceil_rating* 100;
            $(function () { 
                $("#" + data['divId']).rateYo({
                    normalFill: "#A0A0A0",
                    rating: rating_percent.toString() + "%",
                    numStars: ceil_rating,
                    readOnly: true,
                    starWidth: "15px"
                });        
            });
        }        
    }

    updatePhotoDetails(place){
        this.photoGridColumn1 = []
        this.photoGridColumn2 = []
        this.photoGridColumn3 = []
        this.photoGridColumn4 = []

        if(!place.hasOwnProperty('photos') || place['photos'].length==0){
            this.detailErrorMsgPhoto = "No photos available";
            this.detailErrorMsgWarningPhoto = true;
            return;
        }

        let photos = place['photos']
        this.photoGridColumn1 = []
        for(let i=0; i<photos.length; i++){
            let height =  photos[i]['height'];
            let width = photos[i]['width'];
           
            let href_val = photos[i].getUrl({'maxWidth': width, 'maxHeight': height});
            let row = {'height': height, 'url': href_val, 'width': width};
            
            if (i%4 == 0){
                this.photoGridColumn1.push(row);    
            }else if (i%4 == 1){
                this.photoGridColumn2.push(row);    
            }else if (i%4 == 2){
                this.photoGridColumn3.push(row);    
            }else{
                this.photoGridColumn4.push(row);
            }
        }        
    }


    updateInfoDetails(place){
        let hours = "";
        let boldIdx: number = -1;
        this.infoTabData = [];
        
        if(place.hasOwnProperty("opening_hours")){
            let open_details = place["opening_hours"];
            let currentDayIdx = parseInt(moment().utcOffset(place['utc_offset']).format('d'));
            let boldIdx = currentDayIdx == 0? 6: currentDayIdx-1;
            if(open_details['open_now']){
                hours += "Open now:" + open_details['weekday_text'][boldIdx].split(": ")[1] + " ";
            } else{
                hours += "Closed "
            }

            for(let i=boldIdx; i<open_details['weekday_text'].length; i++){
                let val = open_details['weekday_text'][i].split(": ");
                let week_row = {'day': val[0], 'time': val[1], 'currentDay':false};
                if(i==boldIdx){
                    week_row['currentDay'] = true;
                }
                this.weekdayTable.push(week_row);
            }
            for(let i=0; i<boldIdx; i++){
                let val = open_details['weekday_text'][i].split(": ");
                let week_row = {'day': val[0], 'time': val[1], 'currentDay':false};
                this.weekdayTable.push(week_row);
            }
        }

        console.log(place);

        if(place.hasOwnProperty("formatted_address")){
            this.infoTabData.push({'category': 'Address', 'value': place['formatted_address'], 'id': 1});
        }
        if(place.hasOwnProperty("international_phone_number")){
            this.infoTabData.push({'category': 'Phone Number', 'value': place['international_phone_number'], 'id': 2});
        }
        if(place.hasOwnProperty("price_level")){
            this.infoTabData.push({'category': 'Price Level', 'value': "$".repeat(place['price_level']), 'id': 3});
        }
        if(place.hasOwnProperty("rating")){
            this.infoTabData.push({'category': 'Rating', 'value': place['rating'], 'id': 4});
        }
        if(place.hasOwnProperty("url")){
            this.infoTabData.push({'category': 'Google Page', 'value': place['url'], 'id': 5});
        }
        if(place.hasOwnProperty("website")){
            this.infoTabData.push({'category': 'Website', 'value': place['website'], 'id': 6});
        }
        if(place.hasOwnProperty("opening_hours")){            
            this.infoTabData.push({'category': 'Hours', 'value': hours, 'id': 7});
        }

        let ceil_rating = Math.ceil(place['rating']);
        let rating_percent = place['rating']/ceil_rating* 100;
        
        $(function () { 
            $("#rating").rateYo({
                normalFill: "#A0A0A0",
                rating: rating_percent.toString() + "%",
                numStars: ceil_rating,
                readOnly: true,
                starWidth: "15px"
            });        
        });

        let text = "Check out "+ this.selectedTableRow['name']
            + " located at " + place['formatted_address'] + ". Website: ";
        let url = place['website'];
        let hashtag = "TravelAndEntertainmentSearch";

        this.twitter_link = "https://twitter.com/intent/tweet?text=" + encodeURI(text) 
                             + "&url=" + encodeURI(url)
                             + "&hashtags=" + encodeURI(hashtag);

        if(this.infoTabData.length == 0){
            this.detailErrorMsgInfo = "No information found";
            this.detailErrorMsgWarningInfo = true;
        }
    }

    twitterButtonClick(){
        if(this.infoTabData.length != 0){
            window.open(this.twitter_link, 'Twitter','width=600,height=400');
        }        
    }

    updateGoogleMaps(place){
        this.myGoogleMapForm["from"] = new google.maps.places.Autocomplete(
            (this.searchGoogleFromElementRef.nativeElement),
            {types: ['geocode']}
        );


        this.myGoogleMapPegmanToggle = "http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png";
        this.isPegman = false;
        this.myGoogleMapForm.controls.to.setValue(place['name'] + ',' + place['formatted_address']);
        this.destLat = place.geometry.location.lat();
        this.destLon = place.geometry.location.lng();
        let uluru = {lat: this.destLat, lng: this.destLon}

        var mapRender = new google.maps.Map(this.mapDivRef.nativeElement, {
            zoom: 15,
            center: uluru            
        });
        this.marker = new google.maps.Marker({
            position: uluru,
            map: mapRender
        });
        this.directionsDisplay = new google.maps.DirectionsRenderer;
        this.directionsService = new google.maps.DirectionsService;
        this.directionsDisplay.setMap(mapRender);
        this.directionsDisplay.setPanel(this.mapDivDirectionRef.nativeElement);
        
        // Pegman google map construction
        this.panorama = mapRender.getStreetView();
        this.panorama.setPosition(uluru);
        this.panorama.setPov(({
            heading: 265,
            pitch: 0
        }));
    }

    googleMapSubmit(value: any):void{
        this.marker.setMap(null);
        let fromlat = this.curLat;
        let fromlon = this.curLon;
        if(!(value.from == "Your location" || value.from.toLowerCase() == "my location")){
            let params = "location=" + value.from;
            this.allService.getGeoLocation(params).subscribe(
                res => {
                    fromlat = res['api0']['results'][0]['geometry']['location']['lat'];
                    fromlon = res['api0']['results'][0]['geometry']['location']['lng'];

                    let directionsDisplay = this.directionsDisplay;
                    this.directionsService.route({
                        origin: {lat: fromlat, lng: fromlon}, 
                        destination: {lat: this.destLat, lng: this.destLon},  
                        travelMode: google.maps.TravelMode[value.travel_mode.name],
                        provideRouteAlternatives: true
                    }, function(response, status) {
                        if (status == 'OK') {
                            directionsDisplay.setDirections(response);
                            
                        } else {
                            window.alert('Directions request failed due to ' + status);
                        }
                    });
                }
            );
        } else{
            let directionsDisplay = this.directionsDisplay;
            this.directionsService.route({
                origin: {lat: fromlat, lng: fromlon}, 
                destination: {lat: this.destLat, lng: this.destLon},  
                travelMode: google.maps.TravelMode[value.travel_mode.name],
                provideRouteAlternatives: true
            }, function(response, status) {
                if (status == 'OK') {
                    directionsDisplay.setDirections(response);
                    
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        }
                
    }

    togglePegmanMap(){
        if(!this.isPegman){
            this.myGoogleMapPegmanToggle = "http://cs-server.usc.edu:45678/hw/hw8/images/Map.png";
            this.isPegman = true;
            this.panorama.setVisible(true);
        } else{
            this.myGoogleMapPegmanToggle = "http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png";
            this.isPegman = false;            
            this.panorama.setVisible(false);
        }
    }
    
}
