<img src="./images/logo.sample.png" alt="Logo of the project" align="right">

# TUM IDP MAPTOOL [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/your/your-project/blob/master/LICENSE)
> Interdisciplinary Project at the Chair of Renewable and Sustainable Energy Systems at TUM (WS22-SS23)

A tool for displaying, editing and analyzing energy networks in real time
## Requirements
The main script runs in Python Flask (Version 3.8.16). Additional requirements are:
1. Pandapower: Add desc.
1. PostgreSQL: Add desc.
1. PostGIS: Add desc.
1. Connector-syn-grid: Add desc.
1. tum-en/urbs: Add desc.

## Installation

It is highly encouraged to set up a dedicated virtual environment for MapTool. We recommend using the Python distribution Anaconda.

### Anaconda/Miniconda (recommended)
1. Anaconda (Python 3)/Miniconda. Choose the 64-bit installer if possible. During the installation procedure, keep both checkboxes "modify PATH" and "register Python" selected! If only higher Python versions are available, you can switch to a specific Python Version by typing conda install python=<version>

## Getting Started
In a directory of your choice, clone this repository by executing:
```shell
git clone https://github.com/DBaur22/IDP_MapTool.git
```

Here you should say what actually happens when you execute the code above.

## Developing

### Prerequisites
What is needed to set up the dev environment. For instance, global dependencies or any other tools. include download links.


### Setting up Dev

Here's a brief intro about what a developer must do in order to start developing
the project further:

```shell
git clone https://github.com/your/your-project.git
cd your-project/
packagemanager install
```

And state what happens step-by-step. If there is any virtual environment, local server or database feeder needed, explain here.

### Building

If your project needs some additional steps for the developer to build the
project after some code changes, state them here. for example:

```shell
./configure
make
make install
```

Here again you should state what actually happens when the code above gets
executed.

### Deploying / Publishing
give instructions on how to build and release a new version
In case there's some step you have to take that publishes this project to a
server, this is the right time to state it.

```shell
packagemanager deploy your-project -s server.com -u username -p password
```

And again you'd need to tell what the previous code actually does.

## Versioning

We can maybe use [SemVer](http://semver.org/) for versioning. For the versions available, see the [link to tags on this repository](/tags).


## Configuration

Here you should write what are all of the configurations a user can enter when using the project.

## Tests

Describe and show how to run the tests with code examples.
Explain what these tests test and why.

```shell
Give an example
```

## Style guide

Explain your code style and show how to check it.

## Api Reference

If the api is external, link to api documentation. If not describe your api including authentication methods as well as explaining all the endpoints with their required parameters.


## Database

Explaining what database (and version) has been used. Provide download links.
Documents your database design and schemas, relations etc... 

## Licensing

State what the license is and how to find the text version of the license.