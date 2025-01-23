from pydantic import BaseModel
from typing import Optional
from uuid import UUID, uuid4


class EnsysUser(BaseModel):
    id: Optional[UUID] = uuid4()
    name: str
    surname: str
    mail: str
    is_active: bool
    is_superuser: Optional[bool] = False
    is_staff: Optional[bool] = False
