# ConfigContainer

## Code
```python linenums='1' title="config.py"
from pydantic import BaseModel


class EnsysConfigContainer(BaseModel):
    def __init__(self):
        super().__init__()

    def to_oemof(self):
        pass
```

## Parentclass

The Parent of the ConfigContainer is the "BaseModel" from the Package "pydantic".
This decision was made because pydantic has a lot of built-in features to generate json-Object for the Webinterface.

## Functions

### to_oemof(self)
A object function for later use in child-classes, i.e. [EnsysFlow](../components/flow.md), to implement a call to directly return an oemof.solph-Object.