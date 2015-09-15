// ----------------------------------------------------------------------------
// @author: stuke
// @date: Sept 14, 2015
// @description: Generate ICS files mostly compliant to RFC-5545 spec.
//               Implementing specific portions (no VTODO, VJOURNAL, VFREEBUSY, VALARM)
// ----------------------------------------------------------------------------

IcsGenerator;

const params = IcsUtils.filterPropParams("calendar");

IcsGenerator = function(options) {
    IcsUtils.checkOptions(options, params);

    for (paramKey in params) {
        if (paramKey == "events") {
            this.events = !!options.events ? _.map(options.events, function(event) { return new IcsEvent(event); }) : params.events.default;
        } else {
            this[paramKey] = options[paramKey] || params[paramKey].default;
        }
    }
};

IcsGenerator.prototype = {
    constructor: IcsGenerator,

    valueOf: function() {
        var self = this;
        for (key in self) {
            if (key == "events") {
                return _.map(self.events, function(event) { return event.valueOf(); });
            } else {
                return self[key];
            }
        }
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

    addEvent: function(event) {
        return this.events.push(new IcsEvent(event));
    },

    //////////////
	// generator
	//////////////
    toIcsString: function() {
        IcsUtils.parseAndWrap(this.valueOf());
    }
}





/*
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Summay\\, Inc.//SIFTNET//EN
METHOD:REQUEST
BEGIN:VEVENT
SUMMARY:Birthday Dinner for Jacob
DTSTART;TZID=UTC;VALUE=DATE-TIME:20150228T023000Z
DTEND;TZID=UTC;VALUE=DATE-TIME:20150228T033000Z
DTSTAMP;VALUE=DATE-TIME:20150227T011507Z
UID:c0rq25uo8tv3ofq50tu8gpe904@google.com
SEQUENCE:0
nDESCRIPTION:
nORGANIZER;CN=\"Ashutosh Priyadarshy\":MAILTO:ashutosh@hq.siftnet.com
END:VEVENT
END:VCALENDAR


BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
DTSTART:20150914T170000Z
DTEND:20150914T173000Z
DTSTAMP:20150914T234936Z
ORGANIZER;CN=Jacob Katzen:mailto:jacob@sunsama.com
UID:7em87ttv4lrgmsmut1nr5gk7io@google.com
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE
 ;CN=Travis Meyer;X-NUM-GUESTS=0:mailto:travis@sunsama.com
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=
 TRUE;CN=Michael Stuecheli;X-NUM-GUESTS=0:mailto:michael.stuecheli@gmail.com
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE
 ;CN=Ashutosh Priyadarshy;X-NUM-GUESTS=0:mailto:ashutosh@sunsama.com
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE
 ;CN=Duylam Nguyen-Ngo;X-NUM-GUESTS=0:mailto:dlamnguyen@gmail.com
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE
 ;CN=Jacob Katzen;X-NUM-GUESTS=0:mailto:jacob@sunsama.com
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE
 ;CN=Michael Stuecheli;X-NUM-GUESTS=0:mailto:mike@sunsama.com
CREATED:20150909T215719Z
DESCRIPTION:Let's discuss all the different ways channels are going to affe
 ct our app in terms of groups\, broadcast/openings interactions\, and invit
 ed members.\n\nWe also need to think about what needs to change design-wise
  as well.\nNeed to reschedule? Use this link: https://sunsama.com/eventsign
 in/WaFhwAfLkmHnycuwC\n\nSunsama | The world's time network\n\nView your eve
 nt at https://www.google.com/calendar/event?action=VIEW&eid=N2VtODd0dHY0bHJ
 nbXNtdXQxbnI1Z2s3aW8gbWljaGFlbC5zdHVlY2hlbGlAbQ&tok=MTcjamFjb2JAc3Vuc2FtYS5
 jb21jYWUzNDRlZTczNzUwOWM2NWQxNmI1ZDA2YmJmYWE4NzBiZmFkNmVj&ctz=America/Los_A
 ngeles&hl=en.
LAST-MODIFIED:20150914T234936Z
LOCATION:
SEQUENCE:4
STATUS:CONFIRMED
SUMMARY:Channels functionality and design high level discussion
TRANSP:OPAQUE
END:VEVENT
*/
