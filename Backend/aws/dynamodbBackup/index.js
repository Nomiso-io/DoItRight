var aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB();

const NUMBER_DAYS_TO_KEEP_HOURLY_BACK = 1;

exports.handler = async(event, context, callback) => {
    console.log('Received event', event);
    var tablesToBackup = event.tablesToBackup.split(",");
    var promises = tablesToBackup.map(backupTable);
    var currentDate = new Date();
    var lastDate = new Date(currentDate.getTime() - (NUMBER_DAYS_TO_KEEP_HOURLY_BACK * 24 * 60 * 60 * 1000));
    var params = {
      TimeRangeUpperBound: lastDate,
    }

    Promise.all(promises)
      .then(result => { console.log(result)})
      .catch(reason => { console.log(reason); callback(reason); });

    const backups = await getAllBackups(params)
    //promises.push(backups.map(deleteBackup))
    for(const backup of backups) {
      if (backup.BackupName.substring(0, 6) === 'hourly') {
        var params = {
          BackupArn: backup.BackupArn,
        }
        console.log('delete params:', params);
        //const result = await dynamodb.deleteBackup(params);
        dynamodb.deleteBackup(params, (err, data) => {
          if(err) {
            console.log('err:', err);
          }
          console.log('Result:', data);
        })
        
      }
    }
    callback();
};

function deleteBackup(backupInfo) {
    if (backupInfo.BackupName.substring(0, 6) === 'hourly') {
      var params = {
        BackupArn: backupInfo.BackupArn,
      }
      console.log('delete params:', params);
      return dynamodb.deleteBackup(params).promise();
    }
}


function getAllBackups(params) {
  return new Promise((resolve, reject) => {
    dynamodb.listBackups(params, async(error, data)=>{
      if(error) {
        return reject(error);
      }
      var backups = data.BackupSummaries;
      if (data.LastEvaluatedBackupArn) {
        var newParams = params ? params : {};
        newParams.ExclusiveStartBackupArn = data.LastEvaluatedBackupArn;
        var result = await getAllBackups(newParams)
        backups = backups.concat(result);
        return resolve(backups);
      } else {
        return resolve(backups);
      }
    });
  });
}

function backupTable(tablename) {
  var timestamp = new Date().toISOString()
    .replace(/\..+/, '')
    .replace(/:/g, '')
    .replace(/-/g, '');

  var params = {
    TableName: tablename,
    BackupName: 'hourly-' + tablename + timestamp
  };
  return dynamodb.createBackup(params).promise();
}