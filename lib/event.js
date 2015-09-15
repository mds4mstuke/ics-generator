// ----------------------------------------------------------------------------
// @author: stuke
// @date: Sept 14, 2015
// @description: Event class.
// ----------------------------------------------------------------------------

const params = IcsUtils.filterPropParams("event");

IcsEvent = function(options) {
	IcsUtils.checkOptions(options, params);

	for (paramKey in params) {
        if (paramKey == "attendees") {
            this.attendees = !!options.attendees ? _.map(options.attendees, function(event) { return new IcsAttendee(event); }) : params.attendees.default;
		} else if (paramKey == "organizer") {
			this.organizer = !!options.organizer ? new IcsAttendee(organizer) : params.organizer.default;
	    } else {
            this[paramKey] = options[paramKey] || params[paramKey].default;
        }
    }
};

IcsAttendee.prototype = {
	constructor: IcsAttendee,

	valueOf: function() {
		var self = this;
		for (key in self) {
			if (key == "attendees") {
				return _.map(self.attendees, function(attendee) { return attendee.valueOf(); });
			} else if (key == "organizer") {
				return self.organizer.valueOf();
			} else {
				return self[key];
			}
		}
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
