# EnsysNonConvex Container

Configuration container for access the specific arguments from the webinterface.
All parameters are changeable and depend on the specific component.

## Sample Object with default Parameters

```python
"To be done!"
```

## Parameters:
A list of alle parameters to configure the object with a short description.

### Startup Costs
Costs associated with a start of the flow (representing a unit).

Default:
```python
maximum:float = float("+inf"),
```

### Shutdown Costs
Costs associated with the shutdown of the flow (representing a unit).
```python
minimum: float = 0.0
```

### Activity costs
Costs associated with the active operation of the flow, independently from the actual output.

Default:
```python
activity_costs: float = None
```

### Minimum Uptime
Minimum time that a flow must be greater then its minimum flow after startup. Be aware that minimum up and downtimes can contradict each other and may lead to infeasible problems.

Default:
```python
minimum_uptime: int = 1
```

### Minimum Downtime
Minimum time a flow is forced to zero after shutting down. Be aware that minimum up and downtimes can contradict each other and may to infeasible problems.

Default:
```python
minimum_downtime: int = 1
```

### Maximum Startups
Maximum number of start-ups.

Default:
```python
maximum_startups: int = 0
```

### Maximum Shutdowns
Maximum number of shutdowns.

Default:
```python
maximum_shutdowns: int = 0
```

### Inital Status
Integer value indicating the status of the flow in the first time step (0 = off, 1 = on). 
For minimum up and downtimes, the initial status is set for the respective values in the edge regions e.g. if a minimum uptime of four timesteps is defined, the initial status is fixed for the four first and last timesteps of the optimization period. 
If both, up and downtimes are defined, the initial status is set for the maximum of both e.g. for six timesteps if a minimum downtime of six timesteps is defined in addition to a four timestep minimum uptime.

Default:
```python
initial_status: bool = False
```

Is set to '1' or '0' in the __init__-Function.

### Positive Gradient
A dictionary containing the following two keys:

- 'ub': numeric (iterable, scalar or None), the normed upper bound on the positive difference (flow[t-1] < flow[t]) of two consecutive flow values.
- 'costs': numeric (scalar or None), the gradient cost per unit.

Default:
```python
positive_gradient: dict = None
```

### Negative Gradient
A dictionary containing the following two keys:

- 'ub': numeric (iterable, scalar or None), the normed upper bound on the negative difference (flow[t-1] > flow[t]) of two consecutive flow values.
- 'costs': numeric (scalar or None), the gradient cost per unit.

Default:
```python
negative_gradient: dict = None
```









