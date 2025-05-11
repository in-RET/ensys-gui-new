# EnsysEnergysystem Container

## Sample Object with default Parameters
```python
    es = EnsysEnergysystem(
        label="ensys Energysystem",
        busses=[bel, bgas],
        sinks=[excess_bel, demand_el],
        sources=[import_el, rgas],
        storages=[storage],
        transformers=[pp_gas],
        timeindex=date_time_index
    )
```

## Parameters

### Label
The label for this Energysystem, usually set for better recognition.

```python
label: str = "Default Energysystem"
```

### Busses
A List of EnsysConfigContainers for a Bus-Object, known as 'EnsysBus'.

```python
busses: list[EnsysBus] = None
```

### Sinks
A List of EnsysConfigContainers for a Sink-Object, known as 'EnsysSink'.

```python
sinks: list[EnsysSink] = None
```

### Sources
A List of EnsysConfigContainers for a Source-Object, known as 'EnsysSource'.

```python
sources: list[EnsysSource] = None
```

### Transformers
A List of EnsysConfigContainers for a Transformer-Object, known as 'EnsysTransformer'.

```python
transformers: list[EnsysTransformer] = None
```

### Storages
A List of EnsysConfigContainers for a Storage-Object, known as 'EnsysStorage'.

```python
storages: list[EnsysStorage] = None
```

### Timeindex
A pandas-datetimeindex object to set the timespan for the given data.
This parameter must be set!

### Timeincrement
Parameter to set to a given timeindex the increment step.

