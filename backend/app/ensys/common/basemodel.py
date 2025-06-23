from oemof import solph
from pydantic import BaseModel, model_validator


## Container for a configuration
class EnBaseModel(BaseModel):
    """
    Specialized Pydantic BaseModel for managing energy system components.

    This class extends the functionality of Pydantic's BaseModel by adding methods
    for removing empty attributes and building keyword arguments for oemof.solph
    components. It is designed for applications in energy systems modeling, particularly
    when working with the oemof.solph framework. The class provides utility methods
    to handle energy system components, including proper management of complex
    data structures and configurations.
    """

    @model_validator(mode='after')
    def remove_empty(self):
        """
        Removes attributes with `None` values from the object.

        This method iterates through all attributes of the object and identifies
        those with a value of `None`. It collects these attributes into a list
        and then removes them from the object. This helps in cleaning up empty
        or irrelevant data within the object's state.

        :raises AttributeError: If an attribute cannot be deleted for any reason.
        :return: The modified object with `None` value attributes removed.
        :rtype: object
        """

        delList = []

        for attribute in self.__dict__:
            if self.__dict__[attribute] is None:
                delList.append(attribute)

        for item in delList:
            delattr(self, item)

        return self

    ## pydantic subclass to add special configurations.
    class Config:
        """
        Configuration class for customizing behavior of Pydantic objects.

        This class is used to specify custom configuration options for Pydantic models,
        particularly for enabling support for arbitrary data types like pandas DataFrame
        and pandas Series, as well as allowing additional keyword arguments (**kwargs)
        to be passed to Pydantic's BaseModel instances.

        :ivar arbitrary_types_allowed: Enables support for arbitrary data types that
            are not natively supported by Pydantic by default, such as pandas DataFrames
            or pandas Series.
        :type arbitrary_types_allowed: bool
        :ivar extra: Specifies the extra attributes or fields behavior in Pydantic models.
            Setting this to 'allow' permits passing extra **kwargs that are not explicitly
            defined in Pydantic BaseModel.
        :type extra: str
        """
        arbitrary_types_allowed = True
        extra = 'allow'

    def build_kwargs(self, energysystem: solph.EnergySystem) -> dict[str, dict]:
        """
        Builds keyword arguments for creating oemof.solph components from the provided
        EnergySystem and the attributes of the instance. Special handling is implemented
        for specific attributes like "inputs", "outputs", "conversion_factors", "nonconvex",
        "nominal_value", and "nominal_storage_capacity" to properly handle their conversion
        or dependency on the provided EnergySystem.

        :param energysystem: An instance of the oemof.solph.EnergySystem class used to
            resolve dependencies and references for creating keyword arguments.
        :return: A dictionary containing keyword arguments for initializing oemof.solph
            components, with special attributes processed and mapped accordingly.
        :rtype: dict[str, dict]
        """
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
                elif key == "nonconvex" and not isinstance(value, bool):
                    kwargs[key] = value.to_oemof(energysystem)
                elif key in ["nominal_value", "nominal_storage_capacity"] and not isinstance(value, float):
                    kwargs[key] = value.to_oemof(energysystem)
                else:
                    kwargs[key] = value

        return kwargs
