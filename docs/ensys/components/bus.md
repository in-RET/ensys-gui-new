# EnsysBus Container

Configuration container for access the specific arguments from the webinterface.
All parameters are changeable and depend on the specific component.

## Sample Object with default Parameters
```python
bel = EnsysBus(
	      label = "electricity",
	      balanced = True
	  )
```

## Parameter:
A list of alle parameters to configure the object with a short description.

### Label
Specific Label of the Bus.

Default:
```python
label: str = "Default Bus"   
```

### Balanced
If the bus is balanced the input equals the output in the simulation, this is the default value for every Bus.

Default:

```python
balanced: bool = True   
```