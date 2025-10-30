from fastapi import APIRouter

from . import (
    EnScenario,
    EnScenarioUpdate,
    create_scenario,
    read_scenarios,
    update_scenario,
    delete_scenario,
)
from ..models import GeneralDataModel, DataResponse, MessageResponse

scenario_router = APIRouter(
    prefix="/scenario",
    tags=["scenario"],
)


@scenario_router.post("/")
async def create_scenario_endpoint(scenario_data: EnScenario) -> DataResponse:
    """Create a scenario for a project (validates project ownership)."""

    scenario = create_scenario(
        scenario_data=scenario_data,
    )

    return DataResponse(
        data=GeneralDataModel(
            items=[scenario.model_dump(exclude={"energysystem"})],  # type: ignore[call-arg]
            totalCount=1,
        )
    )


@scenario_router.get("s/{project_id}", response_model=DataResponse)
async def read_scenarios_endpoint(project_id: int) -> DataResponse:
    scenarios = read_scenarios(project_id=project_id)

    response_data = [scenario.model_dump(exclude={"energysystem"}) for scenario in scenarios]  # type: ignore[call-arg]
    return DataResponse(
        data=GeneralDataModel(items=response_data, totalCount=len(response_data)),
        success=True,
    )


@scenario_router.get("/{scenario_id}", response_model=DataResponse)
async def read_scenario(scenario_id: int) -> DataResponse:
    scenario = read_scenario(scenario_id=scenario_id)

    response_data = scenario.model_dump(exclude={"energysystem"})  # type: ignore[call-arg]
    return DataResponse(
        data=GeneralDataModel(items=[response_data], totalCount=1), success=True
    )


@scenario_router.patch("/{scenario_id}")
async def update_scenario_endpoint(
    scenario_id: int,
    scenario_data: EnScenarioUpdate,
) -> DataResponse:
    response_data = db_scenario.model_dump(exclude={"energysystem"})  # type: ignore[call-arg]

    scenario_updated = update_scenario(
        scenario_id=scenario_id,
        scenario_data=scenario_data,
    )

    return DataResponse(
        data=GeneralDataModel(items=[scenario_updated.model_dump()], totalCount=1),
        success=True,
    )


@scenario_router.delete("/{scenario_id}", response_model=MessageResponse)
async def delete_scenario_endpoint(scenario_id: int) -> MessageResponse:
    delete_scenario(scenario_id=scenario_id)

    return MessageResponse(data="Scenario deleted.", success=True)


@scenario_router.post("/duplicate/{scenario_id}", response_model=MessageResponse)
async def duplicate_scenario(scenario_id: int):
    scenario = duplicate_scenario(scenario_id=scenario_id)

    return MessageResponse(data="Scenario duplicated.", success=True)
