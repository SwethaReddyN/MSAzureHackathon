/***
 * Compare items list with contaminants master list and get contaminants 
 * present in the items list
 */
 
'use strict';

var ContaminantsInfo = require('./contaminants_info.js'); 
var violations = [];

var DetectViolations = {
	getContaminants: function(objectList, binType, callbackFunction) {
		
		violations.length = 0;
		//get contaminants master list
		var contaminants = ContaminantsInfo.getContaminantsList(binType);
		console.log("items in bin");
		console.log(objectList);
		//if an item is present in the master list, then it is a 
		//contaminant
		Array.prototype.forEach.call(objectList, object => {
			
			if(contaminants.includes(object.toLowerCase())) {
				violations.push(object);
			}
		});
		console.log("violations");
		console.log(violations);
		return callbackFunction(violations);
	} 
}

module.exports = DetectViolations;

//DetectViolations.getContaminants();
