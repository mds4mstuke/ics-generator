// ----------------------------------------------------------------------------
// @author: stuke
// @date: Sept 14, 2015
// @description: Generate ICS files mostly compliant to RFC-5545 spec.
//               Implementing specific portions (no VTODO, VJOURNAL, VFREEBUSY, VALARM)
// ----------------------------------------------------------------------------

const params = IcsUtils.filterPropParams("calendar");

IcsGenerator = function(options) {
    IcsUtils.checkOptions(options, params);

    for (var paramKey in params) {
        if (paramKey == "events") {
            this.events = !!options.events ? _.map(options.events, function(event) { return new IcsEvent(event); }) : params.events.default;
        } else {
            this[paramKey] = options[paramKey] || params[paramKey].default;
        }
        if (!this[paramKey]) { delete this[paramKey]; }
    }
};

_.extend(IcsGenerator.prototype, {
    valueOf: function() {
        var self = this;
        var out = {};
        var keys = Object.getOwnPropertyNames(self);
        _.each(keys, function(key) {
            if (key == "events") {
                out[key] = _.map(self.events, function(event) { return event.valueOf(); });
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
        if (property == "events") {
            return _.map(this.events, function(event) { return event.valueOf(); });
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
            if (property == "events") {
                this.events = _.map(value, function(event) { return new IcsEvent(event); })
            } else {
                this[property] = value;
            }
            return true;
        } catch (e) {
            return false;
        }
    },

    createEvent: function(event) {
        return new IcsEvent(event);
    },

    createAttendee: function(attendee) {
        return new IcsAttendee(attendee);
    },

    addEvent: function(event) {
        return this.events.push(new IcsEvent(event));
    },

    //////////////
	// generator
	//////////////
    toIcsString: function() {
        return IcsUtils.parseAndWrap(this.valueOf());
    }
});
