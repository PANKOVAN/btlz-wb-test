# Инструкция по загрузке проекта в GitHub

## Шаг 1: Инициализация Git репозитория

```bash
# Инициализируем git репозиторий
git init

# Проверяем статус
git status
```

## Шаг 2: Добавление файлов

```bash
# Добавляем все файлы (кроме тех, что в .gitignore)
git add .

# Проверяем, что будет добавлено
git status
```

## Шаг 3: Создание первого коммита

```bash
# Создаем первый коммит
git commit -m "Initial commit: тестовое задание BTLZ WB Test"
```

## Шаг 4: Создание репозитория на GitHub

1. Откройте [GitHub.com](https://github.com) и войдите в свой аккаунт
2. Нажмите кнопку **"+"** в правом верхнем углу → **"New repository"**
3. Заполните форму:
   - **Repository name**: `btlz-wb-test` (или другое имя)
   - **Description**: "Тестовое задание: интеграция с Wildberries API и Google Sheets"
   - **Visibility**: выберите Public или Private
   - **НЕ** создавайте README, .gitignore или лицензию (они уже есть)
4. Нажмите **"Create repository"**

## Шаг 5: Подключение к удаленному репозиторию

После создания репозитория GitHub покажет инструкции. Выполните:

```bash
# Добавляем удаленный репозиторий (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/btlz-wb-test.git

# Или если используете SSH:
# git remote add origin git@github.com:YOUR_USERNAME/btlz-wb-test.git

# Проверяем подключение
git remote -v
```

## Шаг 6: Отправка кода в GitHub

```bash
# Переименовываем основную ветку в main (если нужно)
git branch -M main

# Отправляем код в GitHub
git push -u origin main
```

Если потребуется авторизация:
- Для HTTPS: введите логин и Personal Access Token (не пароль!)
- Для SSH: убедитесь, что SSH ключ добавлен в GitHub

## Шаг 7: Проверка

Откройте ваш репозиторий на GitHub и убедитесь, что все файлы загружены.

## Полезные команды для дальнейшей работы

```bash
# Проверить статус изменений
git status

# Добавить изменения
git add .

# Создать коммит
git commit -m "Описание изменений"

# Отправить изменения в GitHub
git push

# Получить последние изменения
git pull
```

## Важно!

✅ Убедитесь, что файл `.env` не попал в репозиторий (он в `.gitignore`)
✅ Убедитесь, что файлы с credentials (например, `tariffbox-*.json`) не попали в репозиторий
✅ Проверьте, что `dist/` не попал в репозиторий (он тоже в `.gitignore`)

## Если нужно создать Personal Access Token

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Выберите права: `repo` (полный доступ к репозиториям)
4. Скопируйте токен и используйте его вместо пароля при `git push`
