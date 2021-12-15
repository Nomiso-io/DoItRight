# About DoItRight Collectors and their Scheduler

The Collectors and Scheduler are simple javascript files written using typescript and run using nodejs.
The code also includes installers for the Collectors and Scheduler which initializes the resources needed to run them and sets them up to run as linux service.

## Features

- Full **[TypeScript](https://www.typescriptlang.org/)** codebase with **strict** type annotation - _get as many compile time errors as possible._
- _TODO: Put in a brief description of its parts and what each part does. Write about the technologies used with links to them._

## Setup

1. **Install [Node.js](https://nodejs.org).**

2. **Install typescript as a globally available package:**

```bash
npm install -g typescript
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

## Problems?

## References

## Got feedback?

Your feedback is more than welcome, please send your suggestions, feature requests or bug reports as [Github issues](https://github.com/Nomiso-io/DoItRight/issues).

## Contributing guidelines

Contributions of all kinds are welcome, please feel free to send Pull Requests. As they are requirements of successful build all linters and tests MUST pass, and also please make sure you have a reasonable code coverage for new code.

Thanks for your help in making this project better!

## About the author

This project is maintaned by [NomiSo Inc.](https://nomiso.io/products)
