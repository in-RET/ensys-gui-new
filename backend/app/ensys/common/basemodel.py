from oemof import solph
from pydantic import BaseModel, model_validator, ConfigDict


## Container for a configuration
class EnBaseModel(BaseModel):
    """
    Pydantic subclass for special configurations and utility methods.

    This class extends the functionality of the BaseModel provided by Pydantic. It incorporates
    additional configurations and utility methods, such as cleaning up empty attributes and
    building keyword arguments for an oemof energy system component.

    :ivar model_config: Configuration dictionary that allows arbitrary types and specifies
        how additional attributes are handled.
    :type model_config: ConfigDict
    """

    ## pydantic subclass to add special configurations.
    model_config = ConfigDict(
        extra='ignore', # 'allow'
        arbitrary_types_allowed=True
    )

    @model_validator(mode='before')
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
        items_to_remove = []
        # print(self)
        # print(f"{type(self)}")

        if type(self) == dict:
            for attribute in self:
                if self[attribute] is None:
                    items_to_remove.append(attribute)

            for item in items_to_remove:
                del self[item]

        return self

    def build_kwargs(self, energysystem: solph.EnergySystem) -> dict[str, dict]:
        """
        Builds a dictionary of keyword arguments for an oemof energy system component
        based on the attributes of the current object. The function processes the
        object's attributes, transforming and mapping them into a format compatible
        with oemof components. Special handling is performed for attributes such as
        inputs, outputs, and conversion factors to properly map these to the provided
        energy system. Attributes of certain types are converted with their respective
        methods if necessary.

        :param energysystem: The energy system instance to which the object belongs,
            used to resolve references and convert attributes to oemof-compatible formats.
        :type energysystem: solph.EnergySystem
        :return: A dictionary of formatted keyword arguments suitable for creating the
            corresponding oemof component.
        :rtype: dict[str, dict]
        """

        attributes = vars(self)
        kwargs = {}
        special_keys = ["inputs", "outputs", "conversion_factors"]

        for attr_key in attributes:
            # iterates for every attribute
            attr_value = attributes[attr_key]

            if attr_value is not None:
                if attr_key in special_keys:
                    oemof_io = {}
                    io_keys = list(attr_value.keys())

                    for io_key in io_keys:
                        bus = energysystem.groups[io_key]
                        if isinstance(attr_value[io_key], float) or isinstance(attr_value[io_key], list):
                            oemof_io[bus] = attr_value[io_key]
                        else:
                            oemof_io[bus] = attr_value[io_key].to_oemof(energysystem)

                    kwargs[attr_key] = oemof_io
                elif attr_key == "nonconvex" and not isinstance(attr_value, bool):
                    kwargs[attr_key] = attr_value.to_oemof(energysystem)
                elif attr_key in ["nominal_value", "nominal_storage_capacity"] and not isinstance(attr_value, float):
                    kwargs[attr_key] = attr_value.to_oemof(energysystem)
                else:
                    kwargs[attr_key] = attr_value

        return kwargs
