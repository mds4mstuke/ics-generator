# ics-generator

#### generate .ics files compliant to selected portions of iCalendar specifications.
This package is mostly geared towards disseminating updates about events and synchronizing calendars for various clients. Feel free to fork and customize to your needs.

For a complete list of RFC-specified properties, see [RFC 5545](https://tools.ietf.org/html/rfc5545#section-8.3.2).

### Usage
Include package
```javascript
meteor add stuke:ics-generator
```

Instantiate and manipulate iCal components. Use setters or construct with prepopulated options. See source code for complete list of supported properties.
```javascript
//generate entire object at once
var calOptions = {
    prodId: "//Sugar Mills//Cereal Production",
    method: "REQUEST",
    events: [
        {
			uid: "6xB7a4M75fogA3kzd@sugarmills.com",
            summary: "Favorite Cereal Discussion, Part 28",
            dtStart: new Date(2015, 9, 1, 11),
            dtEnd: new Date(2015, 9, 1, 12),
            organizer: {cn: "Lucky Leprachaun", mailTo: "lucky@sugarmills.com"},
            attendees: [
                {cn: "Tony Tiger", mailTo: "tony@sugarmills.com", partStat: "NEEDS-ACTION"}
            ]
        }
    ]
};
var cal = new IcsGenerator(calOptions);

//generate event separately
var newEvent = cal.createEvent({
	uid: "32eBCNdmBaCerDi7N@sugarmills.com",
    summary: "Favorite Cereal Discussion, Part 29",
    dtStart: new Date(2015, 9, 1, 16),
    dtEnd: new Date(2015, 9, 1, 17),
    organizer: {cn: "Lucky Leprachaun", mailTo: "lucky@sugarmills.com"}
});
//add invitees to event, or supply in constructor
newEvent.setProperty("attendees", [
    {cn: "Tony Tiger", mailTo: "tony@sugarmills.com", partStat: "NEEDS-ACTION"},
    {cn: "Toucan Sam", mailTo: "toucan@sugarmills.com", partStat: "ACCEPTED"}
]);

//append event to calendar
cal.addEvent(newEvent);

//get output
var out = cal.toIcsString();
/*
BEGIN:VCALENDAR
PRODID://Sugar Mills//Cereal Production
METHOD:REQUEST
BEGIN:VEVENT
ORGANIZER;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=L
 ucky Leprachaun:MAILTO:lucky@sugarmills.com
DTSTART:20150901T180000Z
UID:6xB7a4M75fogA3kzd@sugarmills.com
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=To
 ny Tiger:MAILTO:tony@sugarmills.com
SUMMARY:"Favorite Cereal Discussion, Part 28"
DTEND:20150901T190000Z
DTSTAMP:20150815T232211Z
END:VEVENT
BEGIN:VEVENT
ORGANIZER;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=L
 ucky Leprachaun:MAILTO:lucky@sugarmills.com
DTSTART:20150901T230000Z
UID:32eBCNdmBaCerDi7N@sugarmills.com
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=To
 ny Tiger:MAILTO:tony@sugarmills.com
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=Toucan
  Sam:MAILTO:toucan@sugarmills.com
SUMMARY:"Favorite Cereal Discussion, Part 29"
DTEND:20150902T000000Z
DTSTAMP:20150815T232211Z
END:VEVENT
END:VCALENDAR
*/
```


apache license applies.
