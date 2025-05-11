# EnsysFlow Container

Configuration container for access the specific arguments from the webinterface.
All parameters are changeable and depend on the specific component.

## Sample Object with Default Parameters

If min/max are set with all arguments.
```python
flow = EnsysFlow(
			label = "Sample Flow",
			nominal_value = 13000,
			min = 0.0,
			max = 1.0,
			positive_gradient = None,
			negative_gradient = None,
			summed_max = None,
			summed_min = None,
			variable_costs = 0.01,
			investment = None,
			nonconvex = None,
	   )
```

If the parameter 'fix' is used, minimal arguments.
```python
flow = EnsysFlow(
			nominal_value=1,
			fix=data["demand_el"]
	   )
```

## Parameters:
A list of alle parameters to configure the object with a short description.

### Label
Specific Label of the Flow. This Parameter is not specific for these element, usually it is not set! 
Default:
```python
label: str = "Default Bus"   
```

### Nominal Value

Default:

```python linenums="1"
nominal_value: float = None   
```

### Fix
Parameter to set a fix Datasource, i.e. a pandas series or a numeric value.
This value must be 'None' if the following parameters, 'min' or 'max' are set!

```python
fix = None   
```

### Min
Normed minimum value of the flow. 
The flow absolute minimum will be calculated by multiplying 'nominal_value' with 'min'

```python
min: float = 0.0   
```

### Max
Normed maximum value of the flow. 
The flow absolute maximum will be calculated by multiplying 'nominal_value' with 'max'

```python
max: float = 1.0   
```

### Positive Gradient
A dictionary containing the following two keys:

- ub: 
	The normed 'Upper Bound' on the positive value of two consecutive flow values.

- costs: Removed Key!

```python
positive_gradient: dict = None   
```

The parameter default value is set in die __init__-Function of the Object!

### Negative Gradient
A dictionary containing the following two keys:

- ub: 
	The normed 'Upper Bound' on the negative value of two consecutive flow values.
	
- costs: Removed Key!

```python
negative_gradient: dict = None   
```

The parameter default value is set in die __init__-Function of the Object!

### Summed Max
Specific maximum value summed over all timesteps. 
Will be multiplied with the 'nominal_value' to get the absolute limit.
```python
summed_max: float = None   
```

### Summed Min
Specific minimum value summed over all timesteps. 
Will be multiplied with the 'nominal_value' to get the absolute limit.
```python
summed_min: float = None   
```

### Variable Costs
The costs associated with one unit of the flow. 
If this is set the costs will be added to the objective expression of the optimization problem.

```python
variable_costs: float = None   
```

### Investment
Object indicating if a 'nominal_value' of the flow is determined by the optimization problem. 

Note: This will refer all attributes to an investment variable instead of to the 'nominal_value'. 
The 'nominal_value' should not be set (or set to None) if an investment object is used.

```python
investment: EnsysInvestment = None   
```

### Non Convex
If a nonconvex flow object is added here, the flow constraints will be altered significantly as the mathematical model for the flow will be different, i.e. constraint etc. from NonConvexFlow will be used instead of Flow.

Note: at the moment this does not work if the investment attribute is set.
If a NonConvex-Object is set, the Investment will be set to 'None' at the __init__-Function.

```python
nonconvex: EnsysNonconvex = None   
```




















