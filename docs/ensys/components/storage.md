# EnsysStorage Container

Configuration container for access the specific arguments from the webinterface.
All parameters are changeable and depend on the specific component.

## Sample Object with default Parameters

```python
storage = EnsysStorage(
    label="storage",
    #nominal_storage_capacity=10000,
    inputs={
        bel.label: EnsysFlow(
            variable_costs=0.0001
        )
    },
    outputs={
        bel.label: EnsysFlow()
    },
    loss_rate=0.01,
    initial_storage_level=None,
    inflow_conversion_factor=1,
    outflow_conversion_factor=0.8,
    invest_relation_input_capacity=1 / 6,
    invest_relation_output_capacity=1 / 6,
    investment=EnsysInvestment(ep_costs=epc_storage),
)
```

If you uncommment the 'nominal_storage_capacity' the Object is not effected by any optimisation of the investment-parameter.

## Parameters:
A list of alle parameters to configure the object with a short description.

### Inputs / Outputs
Flow in and Out the Storage

Default:
```python
 inputs: dict[EnsysFlow] = None
 outputs: dict[EnsysFlow] = None
```

### Nominal Storage Capacity
Absolute nominal capacity of the storage.

Default:
```python
nominal_storage_capacity=None
```

### invest_relation_input_capacity
Ratio between the investment variable of the input Flow and the investment variable of the storage.

Default:
```python
invest_relation_input_capacity=None
```

### invest_relation_output_capacity
Ratio between the investment variable of the output Flow and the investment variable of the storage.

Default:
```python
invest_relation_output_capacity=None
```

### invest_relation_input_output
Ratio between the investment variable of the output Flow and the investment variable of the input flow.
This ratio used to fix the flow investments to each other. 
Values < 1 set the input flow lower than the output and > 1 will set the input flow higher than the output flow.

Default:
```python
invest_relation_input_output=None
```

### initial_storage_level 
The relative storage content in the timestep before the first time step of optimization (between 0 and 1).

Default:
```python
initial_storage_level=None
```

### balanced
Couple storage level of first and last time step. (Total inflow and total outflow are balanced.)

Default:
```python
balanced=True
```

### loss_rate
The relative loss of the storage content per time unit.

Default:
```python
loss_rate: float = 0.0
```

### fixed_losses_relative 
Losses independent of state of charge between two consecutive timesteps relative to nominal storage capacity.

Default:
```python
fixed_losses_relative: float = None
```

### fixed_losses_absolute
Losses independent of state of charge and independent of nominal storage capacity between two consecutive timesteps.

Default:
```python
fixed_losses_absolute: float = None
```


### inflow_conversion_factor
The relative conversion factor, i.e. efficiency associated with the inflow of the storage.

Default:
```python
inflow_conversion_factor: float = 1
```

### outflow_conversion_factor
see: inflow_conversion_factor

Default:
```python
outflow_conversion_factor: float = 1
```

### min_storage_level
The normed minimum storage content as fraction of the nominal storage capacity (between 0 and 1). To set different values in every time step use a sequence.

Default:
```python
min_storage_level: float = None
```

### max_storage_level
see: min_storage_level

Default:
```python
max_storage_level: float = None
```

### investment 
Object indicating if a nominal_value of the flow is determined by the optimization problem. 

Note: This will refer all attributes to an investment variable instead of to the nominal_storage_capacity. 
The nominal_storage_capacity should not be set (or set to None) if an investment object is used.

Default:
```python
investment: EnsysInvestment = None
```





