Package.describe({
    name: 'stuke:ics-generator',
    version: '0.1.2',
    summary: 'Generate rfc-compliant ical documents (.ics)',
    git: 'https://github.com/mds4mstuke/ics-generator',
    documentation: 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.1.0.2');
    api.use(['underscore']);
    api.export(['IcsGenerator']);
    api.addFiles([
        'lib/_icsUtils.js',
        'ics-generator.js',
        'lib/event.js',
        'lib/attendee.js'
    ]);
});
