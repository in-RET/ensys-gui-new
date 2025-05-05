from backend.app.energysystem.model import EnEnergysystem


def build_energy_system_from_scenario_es(energysystem: EnEnergysystem):
    scenario_id = energysystem.scenario_id
    components = energysystem.components

    for component in components:
        print(component)

