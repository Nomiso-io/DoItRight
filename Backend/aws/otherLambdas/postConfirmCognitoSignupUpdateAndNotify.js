var aws = require("aws-sdk");
aws.config.update({ region: 'us-east-1' });
var documentClient = new aws.DynamoDB.DocumentClient();
var ses = new aws.SES({ region: "us-east-1" });

exports.handler = (event,context,callback) => {
  console.log(event.request);

  //add to database
  const item = {
    id: event.request.userAttributes.sub,
    emailId: event.request.userAttributes.email,
    emailVerified: event.request.userAttributes.email_verified,
//    roles: event.request.groupConfiguration.groupsToOverride ? event.request.groupConfiguration.groupsToOverride : ['Member'],
    teams: [{
      "name" : 'Others',
      "isLead": false,
    }],
    manages:[],
    order: ['admin'],
    roles: ['Member']
  }
  
  const params = {
    TableName : "dev_CognitoUsers",
    Item : item
  }

  documentClient.put(params, function(err, data) {
    if (err) console.log(err);
  });

  //notify admin
  var mail_params = {
    Destination: {
      ToAddresses: ['admin@dev.doitright.io'],
    },
    Message: {
      Body: {
        Text: { Data: "New user " + event.request.userAttributes.email + " has registered on dev.doitright.io" },
      },

      Subject: { Data: "New user registered" },
    },
    Source: "no-reply@dev.doitright.io",
  };

  console.log("Sending mail", mail_params);
  ses.sendEmail(mail_params).promise().catch((err) => {
    console.log(err);
  });
  
  callback(null,event);
};

