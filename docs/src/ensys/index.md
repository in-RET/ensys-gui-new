# EnSys
Package to Map oemof.solph-Classes to abstract classes for further use.

## Usage
This package comes with an CLI-Interface to start and simulate energymodels. 

## Configuration
To configurate an energymodel uses therefore the following classes. Beginning with the components and adding them afterward to an energysystem and energymodel.

Model configuration:

- [EnModel](components/model.md)
- [EnEnergysystem](components/energysystem.md)

System components:

- [EnBus](components/bus.md)
- [EnSink](components/sink.md)
- [EnSource](components/source.md)
- [EnGenericStorage](components/genericstorage.md)
- [EnConverter](components/converter.md)

Special Components:

- [EnInvestment](components/investment.md)
- [EnNonConvex](components/nonconvex.md)
- [EnFlow](components/flow.md)
  
  
## External Start
To start the application it is necessary to define the following classes and dump them into a file:

- [EnModel](components/model.md)
- [EnEnergysystem](components/energysystem.md)

``` bash
python main.py [-olp] [-wdir WORKINGDIRECTORY] configfile
```

### Parameters:
olp - It's a flag to select the single output of the lp-File
wdir - Path to the Workingdirectory; if not given it's the current directory

configfile - Necessary - the path to the configuration which is built before (binary or JSON)

