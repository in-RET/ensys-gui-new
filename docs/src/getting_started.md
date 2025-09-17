---
hide:
  - navigation
  - toc
---

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
    PGADMIN_DEFAULT_EMAIL=<pdadmin-login-mail>
    PGADMIN_DEFAULT_PASSWORD=<pgadmin-login-password>
    
    # e-mail settings
    EMAIL_SENDER=<mail-address>
    EMAIL_HOST_IP=<mail-host>
    EMAIL_HOST_USER=<mail-username>
    EMAIL_HOST_PASSWORD=<mail-password>
    
    # api settings
    OS_VERSION=<os-version (armlinux64 or amd64)>
    LOCAL_WORKDIR=<path-to-the-local-workdir (for example the root dir)>
    LOCAL_DATADIR=<path-to-the-storage-dir>
    HOST_DATADIR=<absolute-path-to-the-storage-dir>
    GUROBI_LICENSE_FILE_PATH=<absolute-path-to-the-gurobi-license-file>
   
    SECRET_TOKEN=<secret-token-string>
    
    # oep
    OEP_TOKEN=<oep-token-string>
    OEP_TOPIC=sandbox
    
    # port settings
    WEB_PORT=9003
    PROXY_PORT=9004
    PGADMIN_PORT=9005
    API_PORT=9006
    REDIS_PORT=9007
    FLOWER_PORT=9008

    ```
2. Start the docker-compose project
    ``` bash
    docker compose build -f docker-compose.dev.yaml up --build #for Development
    docker compose build -f docker-compose.prod.yaml up --build #for production
    ```

3. Now you can access the various tools via a browser

    !!! note
        Links are only for local deployment

      - [Frontend](http://localhost:9003)
      - [Backend](http://localhost:9006)
        - Documentation:
          - [Swagger UI](http://localhost:9006/docs)
          - [ReDocs](http://localhost:9006/redoc)
        - [pgAdmin](http://localhost:9005)
        - [flower](http://localhost:9008)
