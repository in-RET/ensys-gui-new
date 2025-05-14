from oemof import solph
from pydantic import BaseModel, model_validator, Field


## Container for a configuration
class EnBaseModel(BaseModel):

    @model_validator(mode='after')
    def remove_empty(self):

        delList = []

        for attribute in self.__dict__:
            if self.__dict__[attribute] is None:
                delList.append(attribute)

        for item in delList:
            delattr(self, item)

        return self


    ## pydantic subclass to add special configurations.
    class Config:
        ## Allow arbitrary_types like pandas.DataFrames / pandas.Series which are not allowed by default.
        arbitrary_types_allowed = True

        ## Without this configuration it's impossible to pass extra **kwargs to pydantic.baseModel-Objects.
        extra = 'allow'

    ## Build a dict of arguments for the init of the oemof objects.
    #
    #   @return Dictionary with all variables of the given object.
    #   @param self The Object pointer
    #   @param energysystem Oemof-Energysystem
    def build_kwargs(self, energysystem: solph.EnergySystem) -> dict[str, dict]:
        kwargs = {}
        special_keys = ["inputs", "outputs", "conversion_factors"]

        args = vars(self)

        for key in args:
            value = args[key]
            if value is not None:
                if key in special_keys:
                    oemof_io = {}
                    io_keys = list(value.keys())

                    for io_key in io_keys:
                        bus = energysystem.groups[io_key]
                        if isinstance(value[io_key], float) or isinstance(value[io_key], list):
                            oemof_io[bus] = value[io_key]
                        else:
                            oemof_io[bus] = value[io_key].to_oemof(energysystem)

                    kwargs[key] = oemof_io

                elif key == "nonconvex":
                    if isinstance(value, bool):
                        kwargs[key] = value
                    else:
                        kwargs[key] = value.to_oemof(energysystem)

                elif key == "investment":
                    kwargs[key] = value.to_oemof(energysystem)

                else:
                    kwargs[key] = value

        return kwargs

