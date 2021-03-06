
// List of services that do not permit the use of the account to login into another
// website unless the registered email was verified.
// Hence, for the services listed here, we can considered the email address as
// verified even if not specific field stating the verification status is provided!

var whitelistedServices = ['facebook', 'linkedin'];

// Facebook
// It doesn't permit the use of the account unless the email
// ownership is confirmed!
// tested and verified on 2014/06/08
// (see issue #29 at https://github.com/splendido/meteor-accounts-emails-field/issues/29)

// GitHub
// If you register WITHOUT verifying the email you get
// "email": null
// on login, if then set the NON-verified email address as public you get it on login!
// SO, GitHub provided email address cannot be considered as verified!!!
// tested and verified on 2014/06/08

// Linkedin
// It doesn't permit to activate your account unless the email
// ownership is confirmed! ...even if, if you come back later you can access it...
// In any case 3r-party login is not permitted!! 
// tested and verified on 2014/06/08
// (see issue #1 at https://github.com/splendido/meteor-accounts-emails-field/issues/1 )

// Twitter
// You never get an email field!!!
// The access is granted even without verifying the provided email address!



getEmailFromService = function(service_name, service){
    // Picks up the email address from the service
    // NOTE: different services use different names for the email filed!!!
    //       so far, `email` and `emailAddress` were found but it may be the
    //       new names should be added to support all 3rd-party packages!
    var email = service.email || service.emailAddress;
    if (!email)
        // e.g. GitHub provides a null value in the field "email" in case the email
        //      address is not verified!
        return {address: null, verified: false};

    var verified = false;
    // Tries to determine whether the 3rd-party email was verified
    // NOTE: so far only for the service `google` it was found a field
    //       called `verified_email`. But it may be that new names 
    //       should be atted to better support all 3rd-party packages!
    if (_.indexOf(whitelistedServices, service_name) > -1)
        verified = true;
    else if (service.verified_email)
        verified = true;

    return {address: email, verified: verified};
};


updateEmails = function(info) {
    // Picks up the user object
    var user = info.user;
    // creates an object with addresses as keys and verification status as values
    var emails = {};

    // Picks up all email addresses inside 'emails' field
    _.each(user.emails || [], function(email) {
       emails[email.address] = emails[email.address] || email.verified;
    });

    // Updates or adds all emails found inside services
    _.map(user.services, function(service, service_name) {
        if (service_name === 'resume' || service_name === 'email' || service_name === 'password')
            return;
        var serviceEmail = getEmailFromService(service_name, service);
        if (serviceEmail.address)
            emails[serviceEmail.address] = emails[serviceEmail.address] || serviceEmail.verified;
    });

    // transforms emails back to [{address: addr1, verified: bool}, {address: addr2, verified: bool}, ...]
    var registered_emails = _.map(emails, function(verified, address){
        return {address: address, verified: verified};
    });

    // In case we have at least 1 email
    if (registered_emails.length){
        // Updates the registered_emails field
        Meteor.users.update({_id: user._id}, {$set: {registered_emails: registered_emails}});
        // Updates also current user object to be possibly used later
        // after the function returns...
        user.registered_emails = registered_emails;
    }
    else{
        // Removes the registered_emails field
        Meteor.users.update({_id: user._id}, {$unset: {registered_emails: ""}});
        // Updates also current user object to be possibly used later
        // after the function returns...
        delete user.registered_emails;
    }
};

// Sets up an index on registered_emails
Meteor.users._ensureIndex('registered_emails.address');
