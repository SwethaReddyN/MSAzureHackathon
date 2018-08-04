/***
 * module to set and get bin information and manipulate violation info
 */
 
'use strict';

var MacAddress = require('getmac');
var Moment = require('moment');
var RestClient = require('./rest_client.js');
var uuidv4 = require('uuid/v4');

const geo_location = require('google-geolocation') ({
	key: 'AIzaSyAGd5CjdalwfzVTQYmIcSymiZIxz2UfPwg'
});

var mac_address = "";
var binType = "recycle";

var BinInfo = {
	
	MacAddress: MacAddress,
	geo_location: geo_location,
	mac_address: mac_address,
	binType: binType,
	
	//get mac address of the edge device
	getMacAddress: function(callback) {
	
		MacAddress.getMac(function(err, macAddress) {
			if(err)
				throw err;
			return callback(macAddress);
		});
	},
	
	//set bin type - recycle, organic
	setBinType: function(type) {
		
		console.log("set bin type to " + type);
		binType = type;
	},
	
	//get bin type
	getBinType: function() {
		return binType;
	},
	
	//get edge mac address
	getBinId: function() {
		return mac_address;
	},
	
	//Google Geolocation API request
	sendRequest: function(params, callback) {
		geo_location (params, (err, data) => {
			if(err) {
				console.log(err);
				return null;
			}
			return callback(data);
		});
	},
		
	//build params for Google Geolocation API
	buildParams: function(mac_address) {
		const params = {
			wifiAccessPoints: [
				{
					macAddress: mac_address
				}
			]
		};
		return params;
	},
	
	//get location of the edge device (bin)
	getLocation: function(macAddress, callback) {
		
		const params = BinInfo.buildParams(macAddress);
		BinInfo.sendRequest(params, function(data) {
			return callback(data);
		});
	},
	
	//setup edge device
	setupBin: function() {
		
		BinInfo.getMacAddress(function(macAddress) {
			
			mac_address = macAddress;
			BinInfo.getLocation(macAddress, function(data) {
				RestClient.setupBin(macAddress, data.location.lat, 
				data.location.lng, BinInfo.getBinType());
			});
		});
	},
	
	//get image file name for new event
	createNewImageFileName: function() {
		
		var fileName = "pic_" + uuidv4() + ".jpg";
		return fileName;
	},
	
	//get event timestamp
	getCurrentTimeStamp: function() {
		return Moment().format('MM/DD/YYYY @ hh:mm:SSS A');
	},
	
	//update violation and event details
	updateViolationInfo: function(binId, imageUrl, blobName) {
		var violations = currentEvents[blobName]["violations"];
		var timestamp = currentEvents[blobName]["timestamp"];
		RestClient.sendViolationInfo(binId, violations, timestamp, imageUrl);
	},
	
	cleanupEventDetails: function(eventId) {
		delete currentEvents[eventId];
	}
}

module.exports = BinInfo;
