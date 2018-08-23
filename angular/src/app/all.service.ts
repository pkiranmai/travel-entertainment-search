import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import 'rxjs/add/operator/catch';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class AllService {
    domain = "http://webtechhw8-env2.us-east-2.elasticbeanstalk.com/";
    //domain = "http://localhost:8081";
    private ipAPIUrl = 'http://ip-api.com/json'; 
    constructor(private http: HttpClient) { }

    private doctors = [];

    getIpLocation(){
        return this.http.get<any>(this.ipAPIUrl)
            .catch(this.handleError)
            .map(res => {return res});
    }

    getTableResults(params){
        let url = this.domain + "/resultTable?" + params;
        return this.http.get<any>(url)
            .catch(this.handleError)
            .map(res => {
                console.log("result table map")
                return res});
    }

    getNextBtnResults(params){
        let url = this.domain + "/resultTableNext?" + params;
        return this.http.get<any>(url).map(res => {return res});
    }

    getGeoLocation(params){
        let url = this.domain + "/getGeoLocation?" + params;
        return this.http.get<any>(url).map(res => {return res});
    }

    handleError(error: Response) {
        console.error("MeetingService error: HTTP status " + error.status);    // status is 200
        return Observable.throw(error.json() || 'Server error: MeetingService');
    }

    getYelpReviews(params){
        let url = this.domain + "/getYelpReviews?" + params;
        return this.http.get<any>(url).map(res => {return res});
    }
    
}
