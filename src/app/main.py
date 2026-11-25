from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import ai_camera, exercises, lessons, users

app = FastAPI(title="KZ Duolingo API")

# CORS для локальной разработки: Expo Web (19006), React Native Web и prod-домены
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
app.include_router(ai_camera.router)
