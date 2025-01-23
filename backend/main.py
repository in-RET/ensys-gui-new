from typing import List, Annotated
from uuid import UUID

from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer

from users.model import EnsysUser

backend_app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

users_db: List[EnsysUser] = []

@backend_app.get("/")
async def root():
    return {"message": "Hello World"}

@backend_app.post("/users/", response_model=EnsysUser)
async def create_user(book: EnsysUser):
    users_db.append(book)
    return book

@backend_app.get("/users/", response_model=List[EnsysUser])
async def read_users(token: Annotated[str, Depends(oauth2_scheme)]):
    return {"token": token, "db": users_db}

@backend_app.get("/users/{user_id}", response_model=EnsysUser)
async def read_user(user_id: UUID):
    for book in users_db:
        if book.id == user_id:
            return book
    raise HTTPException(status_code=404, detail="EnsysUser not found")

@backend_app.put("/users/{user_id}", response_model=EnsysUser)
async def update_user(user_id: UUID, book: EnsysUser):
    for index, stored_book in enumerate(users_db):
        if stored_book.id == user_id:
            users_db[index] = book
            return book
    raise HTTPException(status_code=404, detail="EnsysUser not found")

@backend_app.delete("/users/{user_id}", response_model=EnsysUser)
async def delete_user(user_id: UUID):
    for index, book in enumerate(users_db):
        if book.id == user_id:
            return users_db.pop(index)
    raise HTTPException(status_code=404, detail="EnsysUser not found")
