var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' }); 
var documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event,context,callback) => {
    const params = {
        TableName:"dev_CognitoUsers",
        Key : {
            id: event.request.userAttributes.sub
        }
    }
    documentClient.get(params, function(err, data) {
      if(err) callback(err,null)
      /* The below else if condition is legacy
      else if(data.Items){
        let isGroupChanged = false
        let teamData = data.Item.teams;
        for(var i=0; i<teamData.length; i++){
          if(!event.request.groupConfiguration.groupsToOverride.includes(teamData[i]["name"])){
            isGroupChanged = true
          }
        }
         console.log('else if',data,event)
        if(!isGroupChanged)
          callback(null,event)
      }*/
      else {
          console.log(event.request);
          console.log('data', data);
          const item = {
              id: event.request.userAttributes.sub,
              emailId: event.request.userAttributes.email,
              emailVerified: event.request.userAttributes.email_verified,
              roles: event.request.groupConfiguration.groupsToOverride ? event.request.groupConfiguration.groupsToOverride : ['Member'],
          }
          
          const teams = [{
                  "name" : 'Others',
                  "isLead": false,
              }]
          
          if(data.Item){
            item["teams"] = data.Item.teams || teams;
            item["manages"] = data.Item.manages || [];
            item["order"] = data.Item.order || ['admin'];
          }else{
            item["teams"] = teams;
            item["manages"] = [];
            item['order'] = ['admin'];
            item['roles'] = ['Member']
          }
          /*if(event.request.userAttributes['custom:teamName']) {
            const teamF = [{
            "name" : event.request.userAttributes['custom:teamName'],
            "isLead": false,
          }]
          item["teams"] = teamF;
          }*/
          const params = {
              TableName : "dev_CognitoUsers",
              Item : item
          }
          if(data.Item) {
            if(data.Item.teams.length > 0) {
              console.log(data.Item.teams);
              // event.request.groupConfiguration.groupsToOverride = data.item.roles; 
              event.response = {
                "claimsOverrideDetails": {
                "claimsToAddOrOverride": {
                "custom:teamName": data.Item.teams[0].name
                }
              },
              "groupOverrideDetails": {
                "groupsToOverride": data.Item.roles,
                "iamRolesToOverride": [],
                "preferredRole": null
            }
            }
          };
          }
          else {
            // event.request.userAttributes['custom:teamName'] = teams;
            //   event.response = {
            //     "claimsOverrideDetails": {
            //     "claimsToAddOrOverride": {
            //     "custom:teamName": teams
            //     }
            //   }
            // }
          }
        // console.log('else ',event);
        // callback(null,event)
        documentClient.put(params, function(err, data) {
          if (err) console.log(err);
          else {
            callback(null,event)
          }
        });
      }
    });
};
