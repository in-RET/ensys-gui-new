# EnsysInvestment Container

Configuration container for access the specific arguments from the webinterface.
All parameters are changeable and depend on the specific component.

## Sample Object with default Parameters

```python
epc_pp_gas = economics.annuity(capex=2000, n=20, wacc=0.05)
logger.info("epc_pp_gas: " + str(epc_pp_gas))

pp_gas = EnsysTransformer(
    label="pp_gas",
    inputs={bgas.label: EnsysFlow()},
    outputs={bel.label: EnsysFlow(
        variable_costs=0.1,
        investment=EnsysInvestment(ep_costs=epc_pp_gas)
    )},
    conversion_factors={bel.label: 0.3}
)
```

## Parameters:
A list of alle parameters to configure the object with a short description.

### Maximum
Maximum of the addditional invested capacity

Default:
```python
maximum:float = float("+inf"),
```

### Minimum
Minimum of the additional invested capacity
```python
minimum: float = 0.0
```

### ep_costs
Equivalent perdiodical costs for the investment per flow capacity.

Default:
```python
ep_costs: float = 0.0
```

### Existing
Existing / installed capacity.
The invested capacity is added on top of this value. Not applicable if nonconvex is set to True.

Default:
```python
existing: float = 0.0
```

### Nonconvex
If True, a binary variable for the status of the investment is created. 
This enables additional fix investment costs (offset) independent of the invested flow capacity. Therefore, use the offset parameter.

Default:
```python
nonconvex: bool = False
```

### Offset
Additional fix investment costs. 
Only applicable if nonconvex is set to True.
Default:
```python
offset: float = 0.0
```

