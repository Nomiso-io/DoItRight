# DoItRight
DoItRight is a revolutionary product that facilitates rapid adoption of DevSecOps in enterprises. Typically,  software engineering teams operate at different levels of maturity and follow different methodologies. While it is important to let teams operate autonomously, it is also important to have some guiding principles.

Enterprises that want to transform their Engineering into a high performing organisation need to have a mechanism to understand their current state of maturity before they begin a journey to take it higher. DoItRight  uses the widely  adopted CALMS framework and leverages industry benchmarks to bring in a structured approach to drive this journey.  Based on the inputs, DoItRight comes up with intelligent recommendations that the teams can follow to address gaps and take them forward. DevOps maturity in enterprises would be an iterative process and assessment of maturity at regular intervals enables  the teams to focus on continuous improvements.

DoItRight is currently built as a SaaS application using various services of the AWS cloud. This is the code repository for DoItRight. It is organized into three components:
- Backend
- Frontend
- Collectors

## Backend
The Backend includes all the APIs and their supporting database modules. It is written in Typescript running on Nodejs and is deployed as a Lambda function. All the related code and configuration can be found in the Backend folder.

## Frontend
The Frontend includes the complete UI app that runs in the browser. It is written in Typescript using ReactJS and Redux and is deployed as a static website. All the related code and configuration can be found in the Frontend folder.

## Collectors
The Collectors includes all the daemon processes and their supporting database modules. It is written in Typescript running on Nodejs and is deployed as a service on an EC2 Amazon Linux 2 instance. All the related code and configuration can be found in the Collectors folder.
