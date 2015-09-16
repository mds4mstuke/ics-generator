// ----------------------------------------------------------------------------
// @author: stuke
// @date: Sept 14, 2015
// @description: Event class.
// ----------------------------------------------------------------------------

const params = IcsUtils.filterPropParams("event");

IcsEvent = function(options) {
	IcsUtils.checkOptions(options, params);

	for (var paramKey in params) {
        if (paramKey == "attendees") {
            this.attendees = !!options.attendees ? _.map(options.attendees, function(event) { return new IcsAttendee(event); }) : params.attendees.default;
		} else if (paramKey == "organizer") {
			this.organizer = !!options.organizer ? new IcsAttendee(options.organizer) : params.organizer.default;
	    } else {
            this[paramKey] = options[paramKey] || params[paramKey].default;
        }
		if (!this[paramKey]) { delete this[paramKey]; }
    }
};

IcsEvent.prototype = {
	constructor: IcsEvent,

	valueOf: function() {
		var self = this;
		var out = {};
		var keys = Object.getOwnPropertyNames(self);
		_.each(keys, function(key) {
			if (key == "attendees") {
				out[key] = _.map(self.attendees, function(attendee) { return attendee.valueOf(); });
			} else if (key == "organizer") {
				out[key] = self.organizer.valueOf();
			} else {
				out[key] = self[key];
			}
		});
		return out;
	},

	////////////
	// getters
	////////////
	getProperty: function(property) {
        if (property == "attendees") {
            return _.map(this.attendees, function(attendee) { return attendee.valueOf(); });
		} else if (property == "organizer") {
			return this.organizer.valueOf();
        } else {
            return this[property];
        }
    },

	////////////
	// setters
	////////////
	setProperty: function(property, value) {
        try {
            IcsUtils.checkOptions({property: value}, params);
            if (property == "attendees") {
                this.attendees = _.map(value, function(attendee) { return new IcsAttendee(attendee); });
			} else if (property == "organizer") {
				this.organizer = new IcsAttendee(value);
            } else {
                this[property] = value;
            }
            return true;
        } catch (e) {
            return false;
        }
    },

	addAttendee: function(attendee) {
        return this.attendees.push(new IcsAttendee(attendee));
    }
}
