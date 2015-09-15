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
			summary: "Favorite Cereal Discussion, Part 28",
			start: new Date(2015, 9, 1, 11),
			end: new Date(2015, 9, 1, 12),
			organizer: {name: "Lucky Leprachaun", email: "lucky@sugarmills.com"},
			attendees: [
				{name: "Tony Tiger", email: "tony@sugarmills.com", status: "NEEDS_ACTION"}
			]
		}
	]
};
var cal = IcsGenerator(calOptions);

//generate event separately
var newEvent = IcsGenerator.event({
	summary: "Favorite Cereal Discussion, Part 29",
	start: new Date(2015, 9, 1, 16),
	end: new Date(2015, 9, 1, 17),
	organizer: {name: "Lucky Leprachaun", email: "lucky@sugarmills.com"}
});
//add invitees to event, or supply in constructor
newEvent.addAttendees([
	{name: "Tony Tiger", email: "tony@sugarmills.com", status: "NEEDS_ACTION"},
	{name: "Toucan Sam", email: "toucan@sugarmills.com", status: "ACCEPTED"}
]);

//append event to calendar
cal.addEvent(newEvent);

//get output
cal.toIcsString();


```

apache license applies.
