# EnSys by in.RET
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/0e4d2f70045041c1aa1f383a0bf92647)](https://app.codacy.com/gh/in-RET/ensys-gui-new/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

[![Built with Material for MkDocs](https://img.shields.io/badge/Material_for_MkDocs-526CFE?style=for-the-badge&logo=MaterialForMkDocs&logoColor=white)](https://squidfunk.github.io/mkdocs-material/)

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
2. Start the docker-compose project
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
