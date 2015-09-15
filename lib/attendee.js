// ----------------------------------------------------------------------------
// @author: stuke
// @date: Sept 14, 2015
// @description: Attendee class. Must be specified in calendar component.
//				 specifies participants, non-participants, and chair of a group-
//				 scheduled calendar entity.
// ----------------------------------------------------------------------------

const params = IcsUtils.filterPropParams("attendee");

IcsAttendee = function(options) {
	IcsUtils.checkOptions(options, params);

	for (paramKey in params) {
        this[paramKey] = options[paramKey] || params[paramKey].default;
    }
};

IcsAttendee.prototype = {
	constructor: IcsAttendee,

	valueOf: function() {
		var self = this;
		for (key in self) {
			return self[key];
		}
	},

	////////////
	// getters
	////////////
	getProperty: function(property) {
		return this[property];
	},

	////////////
	// setters
	////////////
	setProperty: function(property, value) {
		try {
			IcsUtils.checkOptions({property: value}, params);
			this[property] = value;
			return true;
		} catch (e) {
			return false;
		}
	},
}
