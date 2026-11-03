# KZ Duolingo backend

Backend на FastAPI, перенесённый с Kotlin/Spring Boot. Supabase Auth отвечает за регистрацию и вход, а API проверяет access token по JWKS Supabase.

## Структура

- `src/app/api/routes` — HTTP-маршруты.
- `src/app/core` — настройки и проверка Supabase JWT.
- `src/app/db` — SQLAlchemy Base и подключение к PostgreSQL.
- `src/app/modules` — ORM-модели таблиц.
- `src/app/schemas` — проверка входных данных и формы ответов.
- `src/app/services` — логика уроков, упражнений, пользователей и попыток.
- `src/migrations/versions` — место для будущих миграций схемы.
- `src/tests` — место для тестов.

## Настройка и запуск

1. Создай `.env` на основе `.env.example` и укажи пароль/адрес PostgreSQL.
2. Выполни в терминале PyCharm: `uv sync`.
3. Примени миграции к базе из `DATABASE_URL`: `uv run python -m app.db.migrate`. Команда пропускает уже применённые миграции.
4. Запусти API: `uv run python -m uvicorn app.main:app --reload`.
5. Открой `http://127.0.0.1:8000/docs`.

Запустить локальные тесты можно командой `PYTHONPATH=src .venv/bin/python -m unittest discover -s src/tests -v`.

Сейчас Kotlin подключён к локальной базе `kz_duolingo`. Для совместного пошагового перехода укажи в `DATABASE_URL` ту же базу. Таблицы изменяются только отдельной командой миграции и не меняются автоматически при запуске API.

Если таблицы уже перенесены в Supabase PostgreSQL, вместо локального URL используй URL подключения Supabase. Сам Supabase Auth остаётся источником токенов. JWT проверяется с issuer `/auth/v1`, audience `authenticated` и алгоритмом `ES256`, как в текущем Kotlin-конфиге.

## Маршруты

- `GET /lesson`, `GET /lesson/{id}`, `GET /lesson/by-type?type=THEORY`
- `POST /lesson`, `PUT /lesson/{id}`, `DELETE /lesson/{id}`
- `GET /lesson/{lessonId}/exercises`, `POST /lesson/{lessonId}/exercises`
- `POST /exercises/{exerciseId}/answer`, `PUT /exercises/{exerciseId}`, `DELETE /exercises/{exerciseId}`
- `GET /users/me`, `GET /users/me/attempts`, `GET /users/me/progress`, `GET /users/{id}` (admin)

Без токена доступны `GET /lesson...`, `GET /lesson/{lessonId}/exercises` и `/health`. Проверка ответа, профиль и история попыток требуют Supabase access token в заголовке `Authorization: Bearer <access_token>`.

`POST /exercises/{exerciseId}/answer` возвращает объект с `isCorrect`. Если ответ неверный, в `correctAnswer` приходит правильный ответ; если верный — `correctAnswer` равен `null`.

Регистрация и вход выполняются через Supabase Auth в клиентском приложении. Backend проверяет выданный Supabase access token; локальные `POST /users` и `POST /auth/login` удалены, потому что они дублировали Supabase и не выдавали совместимый токен.

Создавать, изменять и удалять уроки и упражнения может только администратор. Укажи UUID администратора из Supabase **Authentication → Users** в `ADMIN_USER_IDS` внутри локального `.env`. Для нескольких администраторов перечисли UUID через запятую. Не добавляй `.env` в Git.

Создание урока и упражнения возвращает созданный объект вместе с его ID (`201 Created`). Успешное удаление возвращает `204 No Content`; если объект не найден, API отвечает `404 Not Found`.

Урок или упражнение, по которому уже есть ответы пользователей, удалить нельзя: API вернёт `409 Conflict`, чтобы сохранить историю и прогресс. Урок без ответов удаляется вместе со своими упражнениями.

У упражнения есть тип `TEXT` (свободный ввод), `MULTIPLE_CHOICE` (выбор варианта) или `FILL_BLANK` (ввод пропущенного слова). Для выбора варианта передай `options` — минимум два непустых варианта, один из которых должен совпадать с `correctAnswer`. Для остальных типов `options` не нужен. Старые упражнения после миграции получают тип `TEXT`.

Пример создания упражнения с выбором ответа:

```json
{
  "prompt": "Как по-казахски «спасибо»?",
  "correctAnswer": "Рақмет",
  "type": "MULTIPLE_CHOICE",
  "options": ["Сәлем", "Рақмет", "Сау бол"]
}
```

`GET /users/me` находит или создаёт профиль приложения для вошедшего Supabase-пользователя. `GET /users/me/attempts` возвращает его попытки от новых к старым. `GET /users/me/progress` возвращает общую статистику по попыткам и прогресс по каждому уроку. Урок считается завершённым, когда пользователь ответил на все упражнения и правильно решил не менее половины из них. Если на упражнение отвечали несколько раз, оно считается правильным для завершения, когда есть хотя бы одна правильная попытка. Пустые уроки не считаются завершёнными. `GET /users/{id}` доступен только администраторам.
