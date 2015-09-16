Package.describe({
    name: 'stuke:ics-generator',
    version: '0.1.0',
    summary: 'generate mostly rfc-compliant ics documents',
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
