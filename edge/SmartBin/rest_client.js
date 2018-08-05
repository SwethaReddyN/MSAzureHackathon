/***
 * send web service requests
 */
 
'use strict';

var Request = require("request");
var FileSystem = require("fs");
var FormData = require("form-data");


var setupBinBaseUrl = "https://smartwastebincreation.azurewebsites.net/api/insertrecord?";
var processImageUrl = "http://127.0.0.1:8888/image";
var violationInfoBaseUrl = "https://smartbintransaction.azurewebsites.net/api/bintransaction?";

var RestClient = {
	
	setupBinBaseUrl: setupBinBaseUrl,
	processImageUrl: processImageUrl,
	violationInfoBaseUrl: violationInfoBaseUrl,
	
	//create a new bin request
	setupBin: function(binId, lat, lng, binType) {
		
		var setupBinUrl = setupBinBaseUrl + "binId=" + binId + "&bLatitude=" + 
		lat + "&bLongitude=" + lng + "&bincat=" + binType;
		Request(setupBinUrl, function(
					error, response, body) {
			
			console.log(body);
		});
	},
	
	//send image for processing
	sendImageForProcessing: function(completeFileName, callbackFunction) {
		
		var postData = {
			
			imageData: FileSystem.createReadStream(completeFileName)
		}
		
		Request.post({url:processImageUrl, formData: postData}, function(
				error, response, body) {
			if(error) {
				console.log(error);
				return callbackFunction(null);
			}
			
			return callbackFunction(body);
		});
	},
	
	//send violation info details
	sendViolationInfo: function(binId, violation, bintime, imageUrl) {
		
		var violations = "";
		Array.prototype.forEach.call(violation, contaminant => {
			violations = violations + "," + contaminant;
		});
		violations = violations.replace(",", "");
		var violationInfoUrl = violationInfoBaseUrl + "binId=" + binId + 
			"&violation=" + violations + "&bintime=" + bintime + 
			"&binurl=" + imageUrl;
		Request(violationInfoUrl, function(
					error, response, body) {
			
			console.log(body);
		});
	} 
}

module.exports = RestClient;
