from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.routes import exercises, lessons, users

app = FastAPI(title="KZ Duolingo API")


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    request: Request,
    exception: RequestValidationError,
) -> JSONResponse:
    del request
    first_error = exception.errors()[0]
    message = first_error.get("msg", "Некорректные данные")
    if message.startswith("Value error, "):
        message = message.removeprefix("Value error, ")
    return JSONResponse(status_code=400, content={"message": message})


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(lessons.router)
app.include_router(exercises.router)
app.include_router(users.router)
