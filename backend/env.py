import os
from datetime import datetime
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlmodel import SQLModel

from app.project.model import EnProjectDB
from app.scenario.model import EnScenarioDB
from app.simulation.model import EnSimulationDB
from app.templates.model import EnTemplateDB, EnTemplateScenarioDB
from app.user.model import EnUserDB

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = SQLModel.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

black_placeholder_user = EnUserDB(
    id=1,
    username="placeholder_user",
    firstname="",
    lastname="",
    password="",
    mail="",
    date_joined=datetime.now(),
    last_login=None,
    is_active=True,
    is_staff=False,
)

black_placeholder_project = EnProjectDB(
    id=1,
    user_id=1,
    name="black_placeholder_project",
    description="",
    country="Anywhere",
    longitude=243.2,
    latitude=54.1,
    is_favorite=False,
)

black_placeholder_scenario = EnScenarioDB(
    id=1,
    name="black_placeholder_scenario",
    start_date=datetime.now(),
    time_steps=8760,
    interval=1.0,
    project_id=1,
    user_id=1,
    modeling_data="",
)

black_placeholder_template = EnTemplateDB(
    id=1,
    name="black_placeholder_template",
    description="",
    country="Nowhere",
    longitude=45.2,
    latitude=345.1,
)

black_placeholder_simulation = EnSimulationDB(
    id=1,
    sim_token="black_placeholder_simulation",
    start_date=datetime.now(),
    end_date=None,
    scenario_id=1,
)

black_placeholder_template_scenario = EnTemplateScenarioDB(
    id=1,
    name="black_placeholder_template_scenario",
    start_date=datetime.now(),
    time_steps=8760,
    interval=1.0,
    template_id=1,
    modeling_data="",
)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    context.configure(
        url=os.getenv("DATABASE_URL"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    config_args = config.get_section(config.config_ini_section, {})
    if not "sqlalchemy.url" in config_args:
        config_args["sqlalchemy.url"] = os.getenv("DATABASE_URL")

    connectable = engine_from_config(
        config_args,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
