import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlmodel import SQLModel

from app.project import EnProjectDB
from app.scenario import EnScenarioDB
from app.simulation import EnSimulationDB
from app.templates import EnTemplateDB
from app.user import EnUserDB

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
    username="admin",
    email="",
    hashed_password="",
    is_active=True,
    is_superuser=True,
)

black_placeholder_project = EnProjectDB(
    id=1,
    name="black_placeholder_project",
    description="",
    owner_id=1,
    is_favorite=False,
)

black_placeholder_scenario = EnScenarioDB(
    id=1,
    name="black_placeholder_scenario",
    description="",
    project_id=1,
)

black_placeholder_template = EnTemplateDB(
    id=1,
    name="black_placeholder_template",
)

black_placeholder_simulation = EnSimulationDB(
    id=1,
    name="black_placeholder_simulation",
    description="",
    project_id=1,
    scenario_id=1,
    status=1,
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
