# EnsysSink Container

Configuration container for access the specific arguments from the webinterface.
All parameters are changeable and depend on the specific component.

## Sample Object with default Parameters
Common object for a demand of energy.

```python
data = pd.DataFrame()

demand_el = EnsysSink(
	label = "demand",
	inputs = {
		bel.label: EnsysFlow(
			fix = data["demand_el"],
			nominal_value = 1
	)}
)
```

Common object for a sink for all excess energy.
```python
excess_bel = EnsysSink(
	label = "excess_bel",
	inputs = {bel.label: EnsysFlow(
		balanced = False
	)}
)
```


## Parameters:
A list of alle parameters to configure the object with a short description.

### Label
Specific Label of the Sink.

Default:
```python
label: str = "Default Sink"   
```

### Inputs
A dictionary of various Flows, mostly one single flow from a Bus.

The structure of the dictionary is given as
```python
	bus = EnsysBus(**kwargs)

	dict = {bus.label: EnsysFlow(**kwargs)}
```