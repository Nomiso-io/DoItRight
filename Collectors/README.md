# About DoItRight Collectors and their Scheduler

The Collectors and Scheduler are simple javascript files written using typescript and run using nodejs.
The code also includes installers for the Collectors and Scheduler which initializes the resources needed to run them and sets them up to run as linux service.

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

## Features

- Full **[TypeScript](https://www.typescriptlang.org/)** codebase with **strict** type annotation - _get as many compile time errors as possible._
- _TODO: Put in a brief description of its parts and what each part does. Write about the technologies used with links to them._

## Setup

1. **Install [Node.js](https://nodejs.org).**

2. **Install typescript as a globally available package:**

```bash
npm install �g typescript
```

3. **Setup AWS credentials: **_(You will need this for the AWSCodeCommit and AWSPipeline collectors)_

  * Create a new IAM Policy in AWS using the `aws-setup/aws-policy.json` file. Note that the file contains placeholders for your `<account_no>`, `<region>`, `<service_name>`, and `<your_deployment_bucket>`.
  You can replace all those `Resource` ARNs with `*`, if you intentionally don't want to follow the Principle of Least Privilege, but want to avoid permission issues.
  (If you prefer minimal permissions, just like me, you may want to follow [Issue 1439: Narrowing the Serverless IAM Deployment Policy](https://github.com/serverless/serverless/issues/1439). )

  * Create a new IAM User for Programmatic Access only, assign the previously created policy to it, and get the Access Key ID and the Secret Access Key of the user.

  * Save the credentials to the `~/.aws/credentials` file:

  ```bash
  serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
  ```

  _Unfortunately on Windows you will need an Administrator user to run the Serverless CLI._

  You can read more about setting up AWS Credentials on the [AWS - Credentials page](https://serverless.com/framework/docs/providers/aws/guide/credentials/) of the Serverless Guide.

4. **Clone this repository.**

5. **Install the dependencies:**

```bash
npm install
```
6. **Install Elasticsearch on an EC2 AWS Linux Instance:**
  Make sure your elasticsearch is accesssible via the internet by opening its port on the ec2 instance.

  Get the URL of the ec2 instance and the elasticsearch port and update the conf/settings.env file with these values.

7. Update the AWS region for DynamoDB in the conf/settings.env file.


## What you can find in the code

### Code Structure

Explain the code structure here.

- **src**: 
- **build**: 
- **bin**: 
- **conf**: 
- **log**: 
- **node_modules**: 

### Collectors

Code structure of each collectors.

## Developer tasks

Frequently used `npm script`s:

| Script name   | Description                                                                                                         |
|---------------|---------------------------------------------------------------------------------------------------------------------|
| `analyse`     | Runs all code analysis tools, including linters and unit tests.                                                     |
| `deploy`      | Runs all analysis tools, creates the deployment package, installs it on AWS and finally runs the integration tests. |
| `start`       | Runs the service locally, so you can call your API endpoints on http://localhost.                                   |

Additional useful `npm script`s:

| Script name        | Description                                                                                                                     |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `build`            | Runs all pre-deploy analysis and creates the deployment package, but does not install it onto AWS.                              |
| `clean`            | Removes all tool-generated files and folders (build output, coverage report etc.). Automatically runs as part of other scripts. |
| `deploy:init`      | Creates the domain in Route53. Required to manually execute once.                                                               |
| `lint`             | Runs the static code analyzers. Automatically runs before deployment.                                                           |
| `test`             | Runs the unit tests. Automatically runs before deployment.                                                                      |
| `test:integration` | Runs the integration tests. Automatically runs after deployment.                                                                |

### Test the service locally

**To invoke the Lambda function locally, run:** _This command requires Administrator privileges on Windows!_

```
serverless invoke local --function getCity
```

**To run the service locally, run:** _This command requires Administrator privileges on Windows!_

```bash
npm start
```

This command will not terminate, but will keep running a webserver that you can use to locally test your service. Verify that the service runs perfectly by opening the `http://localhost:3000` URL in your browser. The console window will log your requests.

You can modify your code after running this command, Serverless will automatically recognize the changes and recompile your code.

### Deploy to AWS EC2

**To create a custom domain for your service in AWS, run this command once:** _This command requires Administrator privileges on Windows!_

```bash
npm run deploy:init
```

According to AWS, after this command it may take up to 40 minutes to initialize the domain with a CloudFront distribution. In practice it usually takes about 10 minutes.

**To deploy the service to AWS, run:** _This command requires Administrator privileges on Windows!_

```bash
serverless deploy
```

or you can use the NPM script alias, which is recommended, because it runs the analysers (linter + tests) before deployment, and integration tests after deployment:

```bash
npm run deploy
```

Verify that the deployment is completed successfully by opening the URL displayed in your console window in your browser. To see all resources created in AWS navigate to CloudFormation in the AWS Console and look for the stack named with the name of your service you specified in Step 6.

**To download the Swagger description** of your service, open the following URL in your browser:

```
https://<your_custom_domain_name>/api/swagger.json
```

Note that this endpoint always downloads the Swagger documentation from the live, published API, even if the code is running locally!

If you don't want to deploy your code, just want to peek into the deployment package, you can run:

```bash
npm run build
```

This command is not only an alias to `serverless package`, but also runs all analyzers that the deploy process also runs.

### Run linter

**To check your codebase with TSLint, run:**

```bash
npm run lint
```

The linter automatically checks your code before deployment, so you don't need to run it manually.

### Run unit tests

**To check your code with unit tests, run:**

```
npm test
```

The unit tests are automatically running before deployment, so you don't need to run them manually.

### Run integration tests

**To verify that your deployment completed successfully, run:**

```
npm run test:integration
```

The integration tests are automatically running after deployment, so you don't need to run them manually.

### View the documentation

To view the generated Swagger documentation, deploy your API or start it locally, and then call the `/swagger.json` endpoint.


## Problems?


## Read more


## Acknowledments


## Author

Gargi Basak for [PiNimbus LLC](https://pinimbus.com).
