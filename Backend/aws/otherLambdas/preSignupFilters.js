exports.handler = (event, context, callback) => {
    const createUserAdmin = 'PreSignUp_AdminCreateUser';
    console.log ("Trigger function =", event.triggerSource);
    console.log('events: ',event.request);
    console.log({event})
    // Send post authentication data to Cloudwatch logs
    if (event.request.userAttributes.email.endsWith('@doitright.io') ||
        event.request.userAttributes.email.endsWith('@pinimbus.com') || event.triggerSource === createUserAdmin) {
            console.log ("Authentication successful: ", event.request);
            callback(null, event);
    } else {
        console.log ("Authentication failed: ", event);
        callback("Invalid Email-Id - Please use your work email id.", event)
    }
};
