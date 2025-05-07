# EnsysSource Container

Configuration container for access the specific arguments from the webinterface.
All parameters are changeable and depend on the specific component.

## Sample Object with default Parameters
Common object for an import of energy from somewhere, i.e. other facilities.

```python
data = pd.DataFrame()

import_el = EnsysSource(
	label = "import",
	inputs = {
		bel.label: EnsysFlow(
			fix = data["import_el"],
			nominal_value = 1
	)}
)
```

## Parameters:
A list of alle parameters to configure the object with a short description.

### Label
Specific Label of the Source.

Default:
```python
label: str = "Default Source"   
```

### Inputs
A dictionary of various Flows, mostly one single flow to a Bus.

The structure of the dictionary is given as
```python
	bus = EnsysBus(**kwargs)

	dict = {bus.label: EnsysFlow(**kwargs)}
```