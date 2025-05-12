# EnSys by in.RET
For further information, please refer to the [Documentation](https://in-ret.github.io/ensys-gui-new).

## Requirements
- python3.11
- docker

## Getting started
1. Create an .env file like given below
    ``` bash
    # postgres settings
    POSTGRES_DB=ensys
    POSTGRES_USER=ensys_pg
    POSTGRES_PASSWORD=ensys_pg
    POSTGRES_HOST=db
    POSTGRES_PORT=5432
    DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB
    
    # pgadmin settings
    PGADMIN_DEFAULT_EMAIL=admin@hs-nordhausen.de
    PGADMIN_DEFAULT_PASSWORD=rootroot
    PGADMIN_PORT=9005
    
    # e-mail settings
    EMAIL_SENDER=<Your Email>
    EMAIL_HOST_IP=<Your Email host ip>
    EMAIL_HOST_USER=<user for the email account>
    EMAIL_HOST_PASSWORD=<password for the email account>
    
    # api settings
    LOCAL_WORKDIR=<absolute path to the working directory>
    # mostly a folder inside the local_workdir
    LOCAL_DATADIR=<absolute path to the storage directory> 
    GUROBI_LICENSE_FILE_PATH=<absolute path to your gurobi mvs license>
    
    SECRET_TOKEN=<a secret token for auth generation>
    
    # proxy settings
    WEB_PORT=9003
    PROXY_PORT=9004
    API_PORT=9006
    ```
2. Navigate to the wrapper-package-folder
    ```
    cd backend/wrapper
    ```
3. Create a python environment to build the ensys-wrapper-package
    ``` bash
    python -m build --wheel
    ```
4. Build the docker image for the optimizer, actually just gurobi is supported
    ``` bash
    docker build -t "ensys:0.2a7-gurobi" .
    ```
5. Navigate back to the project root
6. Start the docker-compose project
    ``` bash
    docker compose build -f docker-compose.dev.yaml up --build #for Development
    docker compose build -f docker-compose.prod.yaml up --build #for production
    ```

Now you can access the various tools via a browser:
- [Frontend](http://localhost:9003)
- [Backend](http://localhost:9006)
  - Documentation:
    - [Swagger UI](http://localhost:9006/docs)
    - [ReDocs](http://localhost:9006/redoc)
- [pgAdmin](http://localhost:9005)

## Overview of parts


### Frontend

### API

### EnSys-Wrapper
Package to Map oemof.solph-Classes to abstract classes for further use.

#### Usage
This package comes with an CLI-Interface to start and simulate energymodels. 

#### Configuration
To configurate an energymodel uses therefore the following classes. Beginning with the components and adding them afterward to an energysystem and energymodel.

Possible Classes:
- EnBus
- EnSink
- EnSource
- EnConverter
- EnGenericStorage
- EnEnergysystem
- EnModel

#### External Start
To start the application it is necessary to define the following classes (and dump them into a file):
- EnModel
- EnEnergysystem

    ``` bash
    python main.py [-olp] [-wdir WORKINGDIRECTORY] configfile
    ```
##### Parameters:
olp - It's a flag to select the single output of the lp-File
wdir - Path to the Workingdirectory; if not given it's the current directory

configfile - Necessary - the path to the configuration which is built before (binary or JSON)

