// ----------------------------------------------------------------------------
// @author: stuke
// @date: Sept 14, 2015
// @description: common definition for RFC-compliant stringification.
// ----------------------------------------------------------------------------

//track all possible properties and parameters for formatting purposes.
const allProperties =
	["CALSCALE", "METHOD", "PRODID", "VERSION", "ATTACH", "CATEGORIES", "CLASS",
	"COMMENT", "DESCRIPTION", "GEO", "LOCATION", "PERCENT-COMPLETE", "PRIORITY",
	"RESOURCES", "STATUS", "SUMMARY", "COMPLETED", "DTEND", "DUE", "DTSTART",
	"DURATION", "FREEBUSY", "TRANSP", "TZID", "TZNAME", "TZOFFSETFROM", "TZOFFSETTO",
	"TZURL", "ATTENDEE", "CONTACT", "ORGANIZER", "RECURRENCE-ID", "RELATED-TO",
	"URL", "UID", "EXDATE", "EXRULE", "RDATE", "RRULE", "ACTION", "REPEAT",
	"TRIGGER", "CREATED", "DTSTAMP", "LAST-MODIFIED", "SEQUENCE", "REQUEST-STATUS"];
const allParameters =
	["ALTREP", "CN", "CUTYPE", "DELEGATED-FROM", "DELEGATED-TO", "DIR", "ENCODING",
	"FMTTYPE", "FBTYPE", "LANGUAGE", "MEMBER", "PARTSTAT", "RANGE", "RELATED",
	"RELTYPE", "ROLE", "RSVP", "SENT-BY", "TZID", "VALUE"];

IcsUtils = {
	filterPropParams: function(objectType) {
		return _.pick(this.supportedPropParams, this.supportedTypesByObject[objectType]);
	},

	checkOptions: function(options, params) {
		if (!!options) {
	        for (var key in options) {
	            var param = params[key];
	            var val = options[key];
	            if (!!param) {
	                //if we have a definition and restriction for this param
	                if (!!param.allowed && param.allowed.indexOf(val) < 0) {
	                    throw "IcsGenerator: invalid value specified for " + param + ", " + val + " specified but not in allowed set " + param.allowed
	                }
					if (!!param.type) {
						var wrongType = param.type == "date" ? !(val instanceof Date) : (typeof val != param.type);

						if (wrongType) {
	                    	throw "IcsGenerator: invalid type input for " + key + ". Expected " + param.type + ", but received " + typeof val
						}
	                }
	            }
	        }
	    } else {
	        options = {};
	    }
	},

	checkRequired: function(object, params) {
		for (var key in params) {
			var param = params[key];
			if (param.required && !object[key]) {
				throw "IcsGenerator: can't construct ics string due to missing parameter " + key;
			}
		}
	},


	// parses input object and sanitizes any illegal characters.
	// stringifies input as per RFC specs.

	//list of values must be COMMA delimited
	//multipart values must be SEMICOLON delimited
	//list of parameters must be SEMICOLON delimited
	//values containing colon, semicolon, comma must be wrapped in quotes
	//multi-valued item: best practice to create new content line for each value (including property name)
	parseAndWrap: function(obj) {
		var self = this;
		var output = "BEGIN:VCALENDAR\r\n";
		//start with calendar params (highest level)
		var params = self.filterPropParams("calendar")
		output += self.traverseObject(obj, params);
		output += "END:VCALENDAR";
		return output;
	},

	//contentline   = name *(";" param ) ":" value CRLF
	traverseObject: function(obj, params, nextLine) {
		var self = this;

		//check if we're missing any required fields...
		self.checkRequired(obj, params);

		//check if we have any disallowed values or types...
		self.checkOptions(obj, params);

		//obj will be structured as follows:
		//	1) keys are parameters and values
		//	2) keys are properties, some of which may be objects.
		//	   i) object contains parameters & value (in which case nextLine should be passed in, specifying the name of the property)
		//	   ii) object contains nested calendar object (VEVENT, VTODO, etc)

		var newOutput = "";
		if (!!nextLine) {
			//expect parameters & values
			var parameterKeys = [];
			var valKeys = [];
			for (var key in params) {
				if (params[key].icsType == "parameter") {
					parameterKeys.push(key);
				} else if (params[key].icsType == "value") {
					valKeys.push(key);
				}
			}

			var parameterObj = _.pick(obj, parameterKeys);
			var valObj = _.pick(obj, valKeys);

			for (var key in parameterObj) {
				//concat params
				nextLine += ";" + key.toUpperCase() + "=" + parameterObj[key];
			}
			nextLine += ":"; //separate params from values
			var numKey = 0;
			for (var key in valObj) {
				if (numKey != 0) {
					nextLine += ";" //support multipart values
				}
				//concat values
				var val = valObj[key];
				if (_.isArray(val)) { //support list of values
					val = _.map(val, function(eachVal) { return self.formatValue(eachVal); }).join(",")
				} else {
					val = self.formatValue(val);
				}
				nextLine += key.toUpperCase() + ":" + val;
				numKey++;
			}

			//wrap line and append to newOutput.
			newOutput += self.wrapStr(nextLine);

		} else {
			//expect properties
			//for each key/value pair in obj...
			for (var key in obj) {
				var val = obj[key];
				var param = params[key];

				if (typeof val == "object" && !(val instanceof Date)) {
					//if non-date object, we need to do an additional level of parsing
					var specialType = param.icsType;

					if (specialType == "VEVENT") {
						//event object
						var nestedParams = self.filterPropParams("event");

						_.each(val, function(event) {
							newOutput += "BEGIN:VEVENT\r\n";
							if (!event.dtStamp) { event.dtStamp = new Date(); }
							newOutput += self.traverseObject(event, nestedParams);
							newOutput += "END:VEVENT\r\n";
						});

					} else if (specialType == "ATTENDEE") {
						//attendee object
						var nestedParams = self.filterPropParams("attendee");
						if (key == "attendees") {
							_.each(val, function(attendee) {
								var nextLine = "ATTENDEE";
								newOutput += self.traverseObject(attendee, nestedParams, nextLine);
							});
						} else {
							var nextLine = "ORGANIZER";
							newOutput += self.traverseObject(val, nestedParams, nextLine);
						}

					} else {
						//we don't know how to parse this object
						throw "IcsGenerator: encountered unexpected object while constructing output string: " + key +
							"only objects of types: [VEVENT, ATTENDEE] are supported at this time."
					}
				} else {
					//parse this key/value pair.
					val = self.formatValue(val);
					var nextLine = key.toUpperCase() + ":" + val;
					newOutput += self.wrapStr(nextLine);
				}
			}
		}
		return newOutput;
	},

	formatValue: function(val) {
		var outputVal = "";
		if (val instanceof Date) {
			//date: format as YYYYMMDDTHHMMSSZ, e.g. 20150914T170000Z
			var year = val.getUTCFullYear().toString();
			var month = (val.getUTCMonth() + 1).toString();
			if (month.length == 1) { month = "0" + month; }
			var day = val.getUTCDate().toString();
			if (day.length == 1) { day = "0" + day; }
			var hours = val.getUTCHours().toString();
			if (hours.length == 1) { hours = "0" + hours; }
			var min = val.getUTCMinutes().toString();
			if (min.length == 1) { min = "0" + min; }
			var sec = val.getUTCSeconds().toString();
			if (sec.length == 1) { sec = "0" + sec; }
			outputVal += year + month + day + "T" + hours + min + sec + "Z";
		} else {
			var valType = typeof val;
			if (valType == "number") {
				//number:
				outputVal += val;
			} else if (valType == "boolean") {
				//boolean:
				outputVal += val;
				outputVal = outputVal.toUpperCase();
			} else {
				//string: if contains [":", ";", ","] then escape forbidden chars.
				outputVal += val;
				outputVal = outputVal.replace(/(\n|\r)/gm, " ");
				// outputVal.replace(/(:)/gm, "\:");
				// outputVal.replace(/(;)/gm, "\;");
				// outputVal.replace(/(,)/gm, "\,");
			}
		}
		return outputVal;
	},

	//each line must be comprised of 75 UTF-8 characters or less, and terminate in CRLF (\r\n)
	//wrapped lines are delimited by CRLF, then begin with a SPACE character
	wrapStr: function(str) {
		//determine number of wraps we need to perform. can split at any string.
		var strLen = str.length;
		var lineLim = 74;
		var numWraps = Math.floor(strLen / lineLim);
		var outputStr = ""

		if (numWraps == 0) {
			//we don't need to do any wrapping, just append newline chars
			return str + "\r\n"
		} else {
			var newString = str;
			for (var i=0; i<=numWraps; i++) {
				if (i > 0) {
					outputStr += " ";
				}
				outputStr += (newString.slice(i*lineLim, (i+1)*lineLim) + "\r\n");
			}
		}
		return outputStr;
	}
}

//track properties and parameters which we will explicitly support
IcsUtils.supportedPropParams = {
	////////////
	// calendar
	////////////
	"prodId": {
		"type": "string",
		"required": true,
		"icsType": "property"
	},
	"method": {
		"type": "string",
		"allowed": ["PUBLISH", "REQUEST", "REPLY", "ADD", "CANCEL", "REFRESH", "COUNTER", "DECLINECOUNTER"],
		"icsType": "property"
	},
	"events": {
		"type": "object",
		"default": [],
		"icsType": "VEVENT"
	},
	"version": {
		"type": "string",
		"icsType": "VERSION"
	},
	////////////
	// event
	////////////
	"summary": {
		"type": "string",
		"icsType": "property"
	},
	"dtStart": { //always UTC
		"type": "date",
		"icsType": "property"
	},
	"dtEnd": {
		"type": "date",
		"icsType": "property"
	},
	"dtStamp": {
		"type": "date",
		"required": true,
		"icsType": "property"
	},
	"organizer": {
		"type": "object",
		"icsType": "ATTENDEE"
		//conditionally required.
	},
	"uid": { //must be globally unique for this event. rfc-recommended: [datestamp][id]@[domain]
		"type": "string",
		"required": true,
		"icsType": "property"
	},
	"attendees": {
		"type": "object",
		"icsType": "ATTENDEE"
		//conditionally required.
	},
	"created": {
		"type": "date",
		"icsType": "property"
	},
	"description": {
		"type": "string",
		"icsType": "property"
	},
	"location": {
		"type": "string",
		"icsType": "property"
	},
	"sequence": {
		"type": "number",
		"icsType": "property"
	},
	"priority": {
		"type": "number",
		"allowed": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
		"icsType": "property"
	},
	"status": {
		"type": "string",
		"allowed": ["TENTATIVE", "CONFIRMED", "CANCELLED"], //note: VTODO and VJOURNAL have different allowed statuses.
		"icsType": "property"
	},
	"transp": {
		"type": "string",
		"allowed": ["TRANSPARENT", "OPAQUE"],
		"icsType": "property"
	},
	////////////
	// attendee
	////////////
	"cuType": { //calendar user type
		"type": "string",
		"default": "INDIVIDUAL",
		"allowed": ["INDIVIDUAL", "GROUP", "RESOURCE", "ROOM", 'UNKNOWN'],
		"icsType": "parameter"
	},
	"role": {
		"type": "string",
		"default": "REQ-PARTICIPANT",
		"allowed": ["CHAIR", "REQ-PARTICIPANT", "OPT-PARTICIPANT", "NON-PARTICIPANT"],
		"icsType": "parameter"
	},
	"partStat": { //participation status
		"type": "string",
		"default": "NEEDS-ACTION",
		"allowed": ["NEEDS-ACTION", "ACCEPTED", "DECLINED", "TENTATIVE", "DELEGATED"],
		"icsType": "parameter"
	},
	"rsvp": {
		"type": "boolean",
		"default": false,
		"allowed": [true, false],
		"icsType": "parameter"
	},
	"cn": { //common name
		"type": "string",
		"icsType": "parameter"
	},
	"mailTo": { //email, required.
		"required": true,
		"type": "string",
		"icsType": "value"
	}
}
IcsUtils.supportedTypesByObject = {
	"calendar": ["prodId", "method", "events", "version"],
	"event": ["summary", "dtStart", "dtEnd", "dtStamp", "organizer", "uid",
				"attendees", "created", "description", "location", "sequence",
				"priority", "status", "transp"],
	"attendee": ["cuType", "role", "partStat", "rsvp", "cn", "mailTo"]
}
