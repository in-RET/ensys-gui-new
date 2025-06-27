# EnSys
Package to Map oemof.solph-Classes to abstract classes for further use.

## Usage
This package comes with an CLI-Interface to start and simulate energymodels. 

## Configuration
To configurate an energymodel uses therefore the following classes. Beginning with the components and adding them afterward to an energysystem and energymodel.

Model configuration:

- [EnModel](ensys/components/model.md)
- [EnEnergysystem](ensys/components/energysystem.md)

System components:

- [EnBus](ensys/components/bus.md)
- [EnSink](ensys/components/sink.md)
- [EnSource](ensys/components/source.md)
- [EnGenericStorage](ensys/components/genericstorage.md)
- [EnConverter](ensys/components/converter.md)

Special Components:

- [EnInvestment](ensys/components/investment.md)
- [EnNonConvex](ensys/components/nonconvex.md)
- [EnFlow](ensys/components/flow.md)
  
  
## External Start
To start the application it is necessary to define the following classes and dump them into a file:

- [EnModel](ensys/components/model.md)
- [EnEnergysystem](ensys/components/energysystem.md)

``` bash
python main.py [-olp] [-wdir WORKINGDIRECTORY] configfile
```

### Parameters:
olp - It's a flag to select the single output of the lp-File
wdir - Path to the Workingdirectory; if not given it's the current directory

configfile - Necessary - the path to the configuration which is built before (binary or JSON)

