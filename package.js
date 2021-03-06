Package.describe({
    summary: "This package maintains the `registered_emails` array field inside the user object up to date with any 3rd-party account service email used by the user to login into the application."
});

Package.on_use(function(api, where) {
    api.use([
        'accounts-base',
        'underscore'
    ], ['server']);

    api.add_files([
        'lib/accounts-emails-field.js',
        'lib/accounts-emails-field-on-login.js'
    ], ['server']);

    api.imply([
        'accounts-base',
    ], ['server']);
});

Package.on_test(function(api) {
    api.use('accounts-emails-field');
    api.use([
        'tinytest',
        'test-helpers',
        'underscore'
    ], ['server']);
    api.add_files([
        'lib/accounts-emails-field.js',
        'tests/accounts-emails-field_tests.js'
    ], ['server']);
});