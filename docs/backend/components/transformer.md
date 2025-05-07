# EnsysTransformer Container

Configuration container for access the specific arguments from the webinterface.
All parameters are changeable and depend on the specific component.

## Sample Object with default Parameters
This is a simple Transformer from natural gas into electricity.

```python
bel = EnsysBus(
    label="electricity"
)

bgas = EnsysBus(
    label="natural_gas"
)

bcoal = EnsysBus(
	label="hard_coal"
)

bheat = EnsysBus(
	label="heat"
)

pp_gas = EnysTransformer(
    label='pp_gas',
    inputs={bgas.label: EnsysFlow(), bcoal.label: EnsysFlow()},
    outputs={bel.label: EnsysFlow(), bheat.label: EnsysFlow()},
    conversion_factors={bel: 0.3, bheat: 0.5,
                        bgas: 0.8, bcoal: 0.2})
```

## Parameters:
A list of alle parameters to configure the object with a short description.

### Label
Specific Label of the Transformer.

Default:
```python
label: str = "Default Transformer"   
```

### Inputs and Outputs
A dictionary of various Flows, mostly one single flow from a Bus.

The structure of the dictionary is given as
```python
	bus = EnsysBus(**kwargs)

	dict = {bus.label: EnsysFlow(**kwargs)}
```

### Conversion Factors
Dictionary containing conversion factors for conversion of each flow. 
Keys are the connected bus objects. 
The dictionary values can either be a scalar or an iterable with length of time horizon for simulation.
