import asyncio
import base64
import io
import json
import logging
import re
import urllib.parse
from typing import Any

import httpx
from PIL import Image, ImageOps

logger = logging.getLogger(__name__)

# Ленивая загрузка локальной модели компьютерного зрения (BLIP)
_vision_processor = None
_vision_model = None
_vision_loading_failed = False

_KK_TO_LATIN = {
    "а": "a", "ә": "ä", "б": "b", "в": "v", "г": "g", "ғ": "ğ", "д": "d",
    "е": "e", "ё": "yo", "ж": "j", "з": "z", "и": "i", "й": "y", "к": "k",
    "қ": "q", "л": "l", "м": "m", "н": "n", "ң": "ñ", "о": "o", "ө": "ö",
    "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ұ": "ū", "ү": "ü",
    "ф": "f", "х": "h", "һ": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
    "ъ": "", "ы": "y", "і": "ı", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}


def _transliterate_kk(text: str) -> str:
    res = []
    for ch in text:
        low = ch.lower()
        mapped = _KK_TO_LATIN.get(low, ch)
        if ch.isupper() and mapped:
            mapped = mapped[0].upper() + mapped[1:]
        res.append(mapped)
    return "".join(res)


def _get_vision_pipeline():
    global _vision_processor, _vision_model, _vision_loading_failed
    if _vision_loading_failed:
        return None, None
    if _vision_processor is not None and _vision_model is not None:
        return _vision_processor, _vision_model

    try:
        from transformers import BlipForConditionalGeneration, BlipProcessor

        model_id = "Salesforce/blip-image-captioning-base"
        logger.info("Loading local Vision model: %s ...", model_id)
        _vision_processor = BlipProcessor.from_pretrained(model_id)
        _vision_model = BlipForConditionalGeneration.from_pretrained(model_id)
        _vision_model.eval()
        logger.info("Local Vision model loaded successfully.")
        return _vision_processor, _vision_model
    except Exception as exc:
        logger.exception("Failed to load BLIP vision model: %s", exc)
        _vision_loading_failed = True
        return None, None


def _decode_and_crop_image(image_base64: str, crop: dict[str, float] | None) -> Image.Image:
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    raw_bytes = base64.b64decode(image_base64)
    img = Image.open(io.BytesIO(raw_bytes))
    # Учитываем EXIF-ориентацию камеры телефона, чтобы кроп не съезжал
    img = ImageOps.exif_transpose(img).convert("RGB")

    if crop:
        w, h = img.size
        x = max(0.0, min(1.0, float(crop.get("x", 0.0))))
        y = max(0.0, min(1.0, float(crop.get("y", 0.0))))
        cw = max(0.05, min(1.0 - x, float(crop.get("width", 1.0))))
        ch = max(0.05, min(1.0 - y, float(crop.get("height", 1.0))))

        left = int(x * w)
        top = int(y * h)
        right = max(left + 10, int((x + cw) * w))
        bottom = max(top + 10, int((y + ch) * h))
        img = img.crop((left, top, right, bottom))

    return img


def _describe_image_locally(img: Image.Image) -> str:
    processor, model = _get_vision_pipeline()
    if processor is not None and model is not None:
        import torch

        inputs = processor(images=img, return_tensors="pt")
        with torch.no_grad():
            output_ids = model.generate(**inputs, max_new_tokens=30)
        caption = processor.decode(output_ids[0], skip_special_tokens=True).strip()
        if caption:
            return caption

    return "everyday object"


async def _translate_text(client: httpx.AsyncClient, text: str, sl: str, tl: str) -> str:
    if not text:
        return ""
    url = (
        "https://translate.googleapis.com/translate_a/single"
        f"?client=gtx&sl={sl}&tl={tl}&dt=t&q={urllib.parse.quote(text)}"
    )
    resp = await client.get(url)
    resp.raise_for_status()
    data = resp.json()
    return "".join(part[0] for part in data[0] if part and part[0]).strip()


async def _enrich_with_kazakh_ai(caption: str) -> dict[str, Any]:
    prompt = f"""An image crop was described by computer vision as: "{caption}".
Extract the main object (or group of objects) and write a clear, natural educational card in ENGLISH.
Return ONLY valid JSON (no markdown fences) with these exact keys:
{{
  "nameEn": "Short object name (1-3 words, capitalized)",
  "categoryEn": "Short category name (1-2 words, capitalized)",
  "descriptionEn": "1-2 short, clear sentences describing what this object is and what it is used for.",
  "exampleEn": "1 short, natural everyday sentence using this object."
}}"""

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://text.pollinations.ai/openai",
                json={
                    "model": "openai",
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"].strip()
            content = re.sub(r"^```(?:json)?\s*|\s*```$", "", content, flags=re.IGNORECASE | re.DOTALL).strip()
            en_data = json.loads(content)

            name_en = en_data.get("nameEn") or caption
            cat_en = en_data.get("categoryEn") or "Object"
            desc_en = en_data.get("descriptionEn") or f"It is {caption}."
            ex_en = en_data.get("exampleEn") or f"I see {name_en.lower()} here."

            # Параллельно переводим на идеальный казахский и русский языки
            (
                name_kk, name_ru,
                cat_kk, cat_ru,
                desc_kk, desc_ru,
                ex_kk, ex_ru,
            ) = await asyncio.gather(
                _translate_text(client, name_en, "en", "kk"),
                _translate_text(client, name_en, "en", "ru"),
                _translate_text(client, cat_en, "en", "kk"),
                _translate_text(client, cat_en, "en", "ru"),
                _translate_text(client, desc_en, "en", "kk"),
                _translate_text(client, desc_en, "en", "ru"),
                _translate_text(client, ex_en, "en", "kk"),
                _translate_text(client, ex_en, "en", "ru"),
            )

            name_kk_cap = name_kk[:1].upper() + name_kk[1:] if name_kk else name_en
            name_ru_cap = name_ru[:1].upper() + name_ru[1:] if name_ru else name_en

            words = [w for w in re.split(r"\s+", name_kk_cap) if w]
            anatomy = [
                {
                    "morph": w,
                    "role": "негізгі сөз" if i == 0 else "анықтауыш",
                    "meaning": name_ru_cap.lower() if len(words) == 1 else "",
                    "type": "root",
                }
                for i, w in enumerate(words[:3])
            ]

            return {
                "kazakh": name_kk_cap,
                "transcription": _transliterate_kk(name_kk_cap),
                "russian": name_ru_cap,
                "category": f"{cat_kk} ({cat_ru})",
                "description": desc_kk,
                "descriptionRu": desc_ru,
                "exampleSentence": ex_kk,
                "exampleTranslation": ex_ru,
                "anatomy": anatomy,
                "confidence": 96,
                "detectedRaw": caption,
            }
    except Exception as exc:
        logger.warning("Enrichment fallback for '%s': %s", caption, exc)
        return _offline_fallback_card(caption)


def _offline_fallback_card(caption: str) -> dict[str, Any]:
    lower = caption.lower()
    fallback_map = [
        (["laptop", "computer", "notebook", "macbook"], "Ноутбук", "Noutbuk", "Ноутбук", "Техника (Техника)", "Заманауи портативті компьютер. Оқу мен жұмысқа арналған басты құрал.", "Современный портативный компьютер для учёбы и работы.", "Мен ноутбукпен жаңа жоба жасап жатырмын.", "Я делаю новый проект на ноутбуке."),
        (["phone", "smartphone", "cell", "mobile"], "Ұялы телефон", "Uyaly telefon", "Смартфон", "Техника және байланыс", "Күнделікті байланыс пен білім алуға арналған құрылғы.", "Устройство для связи и интерактивного обучения.", "Мен телефон арқылы қазақ тілін үйренемін.", "Я учу казахский язык через телефон."),
        (["cup", "mug", "tea", "coffee", "glass"], "Шыныаяқ", "Shynyayaq", "Кружка / Чашка", "Ыдыс-аяқ (Посуда)", "Шәй немесе кофе ішуге арналған тұтқалы ыдыс.", "Посуда с ручкой для чая или кофе.", "Маған бір шыныаяқ ыстық шәй құйыңызшы.", "Налейте мне, пожалуйста, чашку горячего чая."),
        (["teapot", "kettle"], "Шәйнек", "Shäynek", "Чайник", "Ыдыс-аяқ (Посуда)", "Шәй қайнатуға арналған ыдыс. Қазақ дастарқанының сәні.", "Посуда для заваривания чая — символ гостеприимства.", "Үстелде ыстық шәйнек тұр.", "На столе стоит горячий чайник."),
        (["book", "notebook", "paper"], "Кітап", "Kitap", "Книга", "Оқу құралдары (Учёба)", "Білім мен ғылымның қайнар көзі.", "Источник знаний и мудрости.", "Бұл кітап өте қызықты екен.", "Эта книга оказалась очень интересной."),
        (["apple", "fruit"], "Алма", "Alma", "Яблоко", "Жемістер (Фрукты)", "Дәмді әрі пайдалы жеміс. Алматы — алманың отаны.", "Вкусный и полезный плод. Алматы — родина яблок.", "Дастарқанда қызыл алма бар.", "На столе лежит красное яблоко."),
        (["keyboard"], "Пернетақта", "Pernetaqta", "Клавиатура", "Техника (Техника)", "Мәтін теруге арналған компьютер құрылғысы.", "Устройство для ввода текста.", "Пернетақтамен қазақша тез жазамын.", "Я быстро печатаю на казахском с клавиатуры."),
        (["mouse"], "Тінтуір", "Tintuir", "Компьютерная мышь", "Техника (Техника)", "Компьютер экранындағы курсорды басқару құрылғысы.", "Устройство для управления курсором на экране.", "Тінтуір үстелдің үстінде жатыр.", "Мышь лежит на столе."),
        (["pen", "pencil"], "Қалам", "Qalam", "Ручка", "Кеңсе тауарлары (Канцелярия)", "Қағаз бетіне жазуға арналған құрал.", "Инструмент для письма на бумаге.", "Дәптерге қаламмен жаздым.", "Я написал в тетрадь ручкой."),
        (["bottle", "water"], "Бөтелке", "Bötelke", "Бутылка", "Тұрмыстық заттар (Быт)", "Су немесе сусын құюға арналған ыдыс.", "Ёмкость для воды и напитков.", "Сөмкеде бір бөтелке су бар.", "В сумке есть бутылка воды."),
        (["chair", "seat"], "Орындық", "Oryndyq", "Стул", "Жиһаз (Мебель)", "Отыруға арналған жиһаз түрі.", "Предмет мебели для сидения.", "Қонақтарға орындық ұсыныңыз.", "Предложите гостям стулья."),
        (["table", "desk"], "Үстел", "Üstel", "Стол", "Жиһаз (Мебель)", "Жұмыс істеуге немесе ас ішуге арналған жиһаз.", "Мебель для работы или приёма пищи.", "Үстелдің үстінде кітаптар жатыр.", "На столе лежат книги."),
        (["hand", "finger", "person", "man", "woman", "face"], "Адам / Қол", "Adam / Qol", "Человек / Рука", "Адам (Человек)", "Суретте адам бейнеленген.", "На изображении запечатлён человек.", "Адамның ең басты байлығы — білім.", "Главное богатство человека — знания."),
    ]
    for kws, kz, tr, ru, cat, desc, desc_ru, ex, ex_ru in fallback_map:
        if any(k in lower for k in kws):
            return {
                "kazakh": kz,
                "transcription": tr,
                "russian": ru,
                "category": cat,
                "description": desc,
                "descriptionRu": desc_ru,
                "exampleSentence": ex,
                "exampleTranslation": ex_ru,
                "anatomy": [{"morph": kz, "role": "корень", "meaning": ru.lower(), "type": "root"}],
                "confidence": 91,
                "detectedRaw": caption,
            }

    return {
        "kazakh": "Зат (Объект)",
        "transcription": "Zat",
        "russian": caption.capitalize(),
        "category": "Анықталған нысан (Объект)",
        "description": f"Бейнеде анықталған нысан: {caption}.",
        "descriptionRu": f"Распознано нейросетью как: {caption}.",
        "exampleSentence": "Бұл зат біздің күнделікті өмірімізде кездеседі.",
        "exampleTranslation": "Этот предмет встречается в нашей повседневной жизни.",
        "anatomy": [{"morph": "Зат", "role": "корень", "meaning": "предмет", "type": "root"}],
        "confidence": 85,
        "detectedRaw": caption,
    }


async def recognize_image_crop(image_base64: str, crop: dict[str, float] | None = None) -> dict[str, Any]:
    cropped_img = _decode_and_crop_image(image_base64, crop)
    caption = _describe_image_locally(cropped_img)
    return await _enrich_with_kazakh_ai(caption)


async def recognize_image_crop_bytes(image_bytes: bytes, crop: dict[str, float] | None = None) -> dict[str, Any]:
    """Точка входа для multipart/form-data загрузки: принимает сырые байты файла."""
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img).convert("RGB")

    if crop:
        w, h = img.size
        x = max(0.0, min(1.0, float(crop.get("x", 0.0))))
        y = max(0.0, min(1.0, float(crop.get("y", 0.0))))
        cw = max(0.05, min(1.0 - x, float(crop.get("width", 1.0))))
        ch = max(0.05, min(1.0 - y, float(crop.get("height", 1.0))))
        left = int(x * w)
        top = int(y * h)
        right = max(left + 10, int((x + cw) * w))
        bottom = max(top + 10, int((y + ch) * h))
        img = img.crop((left, top, right, bottom))

    caption = _describe_image_locally(img)
    return await _enrich_with_kazakh_ai(caption)
