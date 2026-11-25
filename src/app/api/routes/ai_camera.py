from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from app.services.ai_vision_service import recognize_image_crop_bytes

router = APIRouter(prefix="/ai-camera", tags=["AI Camera"])


@router.post("/recognize")
async def recognize_object(
    image: UploadFile = File(...),
    crop_x: float = Form(0.0),
    crop_y: float = Form(0.0),
    crop_width: float = Form(1.0),
    crop_height: float = Form(1.0),
) -> dict:
    """
    Принимает изображение (multipart/form-data) и нормализованные координаты
    кропа (0..1), распознаёт объект через BLIP + GPT-обогащение.
    """
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Изображение не передано")

    crop = {
        "x": crop_x,
        "y": crop_y,
        "width": crop_width,
        "height": crop_height,
    }

    try:
        return await recognize_image_crop_bytes(image_bytes, crop)
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Ошибка распознавания: {exc}"
        ) from exc
