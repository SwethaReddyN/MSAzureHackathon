/***
 * Process results results from 'ImageProcessing' module. 
 */
 
'use strict';

var RestClient = require('./rest_client.js');
var DetectViolations = require('./detect_violation.js');

var itemsInImage = [];

var DetectObjects = {
	
	
	//process result and detect items present in the image
	processResults: function (input) {
		
		itemsInImage.length = 0;
		Array.prototype.forEach.call(input.results.predictions, classifier => {
			
			if((classifier.probability * 100) > 1) {
				
				itemsInImage.push(classifier.tagName);
			}
		});
		
		return itemsInImage;
	},
	
	//extract items info from image and verify if contaminants present
	isContaminantPresent: function(fileName, binType, callbackFunction) {
		
		RestClient.sendImageForProcessing(fileName, function(results) {
			
			if(results) {
				//get list of items present in the image
				var imageObjects = DetectObjects.processResults(
							JSON.parse(results));
				//extract contaminants info from the list
				DetectViolations.getContaminants(imageObjects, binType, function(contaminants) {
					return callbackFunction(contaminants);
				});
			} else 
				return callbackFunction(null);
		});
	}
}

module.exports = DetectObjects;
