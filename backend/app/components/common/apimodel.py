from fastapi import HTTPException
from pydantic import BaseModel, Field
from starlette import status

from ..ensys import *

class ApiFlow(BaseModel):
    label: str = Field(
        ...,
        title='Name',
        description='Name of the Flow'
    )

    data: dict = Field(
        title='Data',
        description='Data of the Flow'
    )

def get_io(component_inputs: list[ApiFlow]) -> dict:
    io_dict = {}

    for io in component_inputs:
        io_dict[io.label] = EnFlow(**io.data)

    return io_dict

class ApiBaseModel(BaseModel):
    label: str = Field(
        ...,
        title='Label',
        description='Label for the Object'
    )

    oemof_type: str = Field(
        ...,
        title='oemof.solph type',
        description='oemof.solph Type of the Object'
    )

    data: dict = Field(
        default={},
        title='Data',
        description='Data for the Object'
    )

    inputs: list[ApiFlow] = Field(
        default=[],
        title='Inputs',
        description='Inputs for the Object'
    )

    outputs: list[ApiFlow] = Field(
        default=[],
        title='Outputs',
        description='Outputs for the Object'
    )

    class Config:
        extra = 'allow'

## Container which contains the params for an ApiEnergysystem
#
#   @param component
class ApiEnergysystem(BaseModel):
    constraints: list[EnConstraints] = Field(
        default=[],
        title='Constraints',
        description='List of all constraints.'
    )
    components: list[ApiBaseModel] = Field(
        ...,
        title='Components',
        description='List of all components.'
    )

    # TODO: Fix the class to get the "InRetEnsysEnergysystem" back to work with
    def to_EnEnergysystem(self, energysystem: EnEnergysystem) -> EnEnergysystem:

        for component in self.components:
            if component.oemof_type == "bus":
                component_to_add = EnBus(
                    label=component.label,
                    **component.data
                )
            elif component.oemof_type == "sink":
                component_to_add = EnSink(
                    label=component.label,
                    inputs=get_io(component.inputs),
                    **component.data
                )
            elif component.oemof_type == "source":
                component_to_add = EnSource(
                    label=component.label,
                    outputs=get_io(component.outputs),
                    **component.data
                )
            elif component.oemof_type == "converter":
                component_to_add = EnConverter(
                    label=component.label,
                    inputs=get_io(component.inputs),
                    outputs=get_io(component.outputs),
                    **component.data
                )
            elif component.oemof_type == "genericStorage":
                component_to_add = EnGenericStorage(
                    label=component.label,
                    inputs=get_io(component.inputs),
                    outputs=get_io(component.outputs),
                    **component.data
                )
            else:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown Type given!")

            energysystem.add(component_to_add)
            print("Added", component.oemof_type, ":", component_to_add.model_dump_json())

        for constraint in self.constraints:
            print(constraint)

        return energysystem


