=========================================================================
THIS DIRECTORY HAS SCRIPTS TO MANIPULATE DYNAMODB TABLES OF DOITRIGHT.
THE SCRIPTS
 - CREATES NEW TABLES
 - INSERTS DEFAULT DATA INTO THE TABLE
=========================================================================

Steps to create a new set of database tables for a new stage or subdomain
-------------------------------------------------------------------------

1. createTables.js is the main file to create the new set of tables

2. Before running this script you should ensure the following data are 
   correct:
   2.1 Open file configsTableFunctions.js and ensure the following values 
       are set to the correct values for cognito user pool belonging to the
       subdomain for which these tables are being created:
       - appClientIdValue (AppClient Id of the cognito user pool)
       - appClientURLValue (URL of the AppClient of the cognito user pool)
       - userpoolIdValue (Id of the cognito user pool)

3. Run the script as follows:
  3.1 Open command line
  3.2 Change to this directory
  3.3 Type 
          node createTables.js <subdomain_prefix>
      where <subdomain_prefix> is the subdomain of doitright for which you
      creating the tables. e.g. If you are creating the table for the 
      subdomain xyz.doitright.io, then <subdomain_prefix> will be xyz.
