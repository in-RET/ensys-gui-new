# EnSys by in.RET
For further information please refer to the [Documentation](https://in-ret.github.io/ensys-gui-new).

## Frontend

## API

## EnSys

Package to Map oemof.solph-Classes to abstract classes for further use.

### Usage
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

```bash
python main.py [-olp] [-wdir WORKINGDIRECTORY] configfile
```
##### Parameters:

olp - It's a flag to select the single output of the lp-File
wdir - Path to the Workingdirectory, if not given it's the current directory

configfile - Necessary - the path to the configuration which is build before (binary or json)

