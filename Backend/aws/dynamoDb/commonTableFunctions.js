const fs = require('fs');

exports.copyTableByBackupAndRestoreTo = (ddbHandle, tableName, copyTableName) => {
	let backupName = tableName + '_bk';
	
	var bkParams = {
		BackupName: backupName,
		TableName: tableName
	};
	ddbHandle.createBackup(bkParams, function(err, data) {
		if (err) {
			console.log("Error backing up " + tableName, err);
		} else {
			console.log("Backup created for " + tableName);
			let backupArn = data.BackupDetails.BackupArn;
			var restParams = {
				BackupArn: backupArn,
				TargetTableName: copyTableName
			};
			ddbHandle.restoreTableFromBackup(restParams, function(err, data) {
				if (err) {
					console.log("Error restoring to " + copyTableName, err);
				} else {
					console.log("Copying table " + tableName + " to " + copyTableName);
					console.log("Please wait as this will take some time. Check restore status in DynamoDB console.");
					console.log("Please delete the backups manually once restore completes.")
				}
			});
		}
	});
}

exports.deleteTable = (ddbHandle, tableName) => {
	var params = {
		TableName: tableName
	};
	ddbHandle.deleteTable(params, function(err, data) {
		if (err) {
			console.log("Error deleting table " + tableName, err);
		} else {
			console.log("Deleted table " + tableName);
		}
	});
}

exports.deleteAndRecreateTable = (ddbHandle, tableName, createTableCallback) => {
	var params = {
		TableName: tableName
	};
	ddbHandle.deleteTable(params, function(err, data) {
		if (err) {
			console.log("Error deleting table " + tableName, err);
		} else {
			ddbHandle.waitFor('tableNotExists', params, function(err, data) {
				if (err) {
					console.log("Timed out waiting for delete of table " + tableName, err);
				} else {
					console.log("Deleted table " + tableName);
					createTableCallback(ddbHandle, tableName);
				}
			});
		}
	});
}

exports.exportAllDataToFileAsJSON = (docClient, tableName, exportDir) => {
	let params = {
		TableName: tableName,
	}
	recursiveScanAndExport(docClient, params, `${exportDir}/${tableName}.json`);
}

function recursiveScanAndExport (docClient, params, fileNameWithPath) {
	docClient.scan(params, (err, data) => {
		if (err) {
		  console.error("Error reading table " + params.TableName, err);
		}
		if(data) {
			fs.appendFileSync(
				fileNameWithPath,
				JSON.stringify(data.Items, null, 2),
				err => {
					console.error("Error writing to file " + fileNameWithPath, err);
				}
			);
			if (data.LastEvaluatedKey) {
				const newParams = params;
				newParams.ExclusiveStartKey = data.LastEvaluatedKey;
				recursiveScanAndExport(docClient, newParams, fileNameWithPath);
			}
		} else {
			console.log("No data in database.")
		}
	});
}