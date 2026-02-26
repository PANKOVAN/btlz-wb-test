# Примеры использования API для управления Google Spreadsheet ID

Базовый URL: `http://localhost:5000`

## 1. GET /api/spreadsheets - Получить список всех spreadsheet ID

### Linux/Mac/Git Bash:
```bash
curl http://localhost:5000/api/spreadsheets
```

### Windows PowerShell (curl.exe):
```powershell
curl.exe http://localhost:5000/api/spreadsheets
```

### Windows PowerShell (Invoke-RestMethod):
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/spreadsheets" -Method GET
```

### Пример ответа:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "13Wg-tLmmLyPkLYGzopQESfhk6z41-vDfe6ST-uAQugk"
    },
    {
      "id": 2,
      "name": "1qVut0HJ4GyJ_1I4vkaHOI3wUvDikO3cqxYkwpAuHY7w"
    }
  ]
}
```

---

## 2. PUT /api/spreadsheets?spreadsheetId=xxx - Добавить новый spreadsheet ID

### Linux/Mac/Git Bash:
```bash
curl -X PUT "http://localhost:5000/api/spreadsheets?spreadsheetId=1qVut0HJ4GyJ_1I4vkaHOI3wUvDikO3cqxYkwpAuHY7w"
```

### Windows PowerShell (curl.exe):
```powershell
curl.exe -X PUT "http://localhost:5000/api/spreadsheets?spreadsheetId=1qVut0HJ4GyJ_1I4vkaHOI3wUvDikO3cqxYkwpAuHY7w"
```

### Windows PowerShell (Invoke-RestMethod):
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/spreadsheets?spreadsheetId=1qVut0HJ4GyJ_1I4vkaHOI3wUvDikO3cqxYkwpAuHY7w" -Method PUT
```

### Альтернативный параметр (name):
```bash
curl -X PUT "http://localhost:5000/api/spreadsheets?name=1qVut0HJ4GyJ_1I4vkaHOI3wUvDikO3cqxYkwpAuHY7w"
```

### Пример ответа (успех):
```json
{
  "success": true,
  "message": "Spreadsheet ID added successfully",
  "data": {
    "id": 3,
    "name": "1qVut0HJ4GyJ_1I4vkaHOI3wUvDikO3cqxYkwpAuHY7w"
  }
}
```

### Пример ответа (уже существует):
```json
{
  "success": false,
  "error": "Spreadsheet ID already exists"
}
```

---

## 3. DELETE /api/spreadsheets - Очистить всю таблицу spreadsheet

### Linux/Mac/Git Bash:
```bash
curl -X DELETE http://localhost:5000/api/spreadsheets
```

### Windows PowerShell (curl.exe):
```powershell
curl.exe -X DELETE http://localhost:5000/api/spreadsheets
```

### Windows PowerShell (Invoke-RestMethod):
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/spreadsheets" -Method DELETE
```

### Пример ответа:
```json
{
  "success": true,
  "message": "All spreadsheets cleared successfully",
  "deletedCount": 5
}
```

---

## 4. DELETE /api/spreadsheets/:id - Удалить конкретный spreadsheet ID

Можно удалить по ID записи (число) или по spreadsheet ID (name).

### Удаление по ID записи (число):

#### Linux/Mac/Git Bash:
```bash
curl -X DELETE http://localhost:5000/api/spreadsheets/1
```

#### Windows PowerShell (curl.exe):
```powershell
curl.exe -X DELETE http://localhost:5000/api/spreadsheets/1
```

#### Windows PowerShell (Invoke-RestMethod):
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/spreadsheets/1" -Method DELETE
```

### Удаление по spreadsheet ID (name):

#### Linux/Mac/Git Bash:
```bash
curl -X DELETE "http://localhost:5000/api/spreadsheets/1qVut0HJ4GyJ_1I4vkaHOI3wUvDikO3cqxYkwpAuHY7w"
```

#### Windows PowerShell (curl.exe):
```powershell
curl.exe -X DELETE "http://localhost:5000/api/spreadsheets/1qVut0HJ4GyJ_1I4vkaHOI3wUvDikO3cqxYkwpAuHY7w"
```

#### Windows PowerShell (Invoke-RestMethod):
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/spreadsheets/1qVut0HJ4GyJ_1I4vkaHOI3wUvDikO3cqxYkwpAuHY7w" -Method DELETE
```

### Пример ответа (успех):
```json
{
  "success": true,
  "message": "Spreadsheet ID deleted successfully"
}
```

### Пример ответа (не найдено):
```json
{
  "success": false,
  "error": "Spreadsheet ID not found"
}
```

---

## 5. Health Check - Проверка работы сервиса

### Linux/Mac/Git Bash:
```bash
curl http://localhost:5000/
```

### Windows PowerShell (curl.exe):
```powershell
curl.exe http://localhost:5000/
```

### Windows PowerShell (Invoke-RestMethod):
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/"
```

### Пример ответа:
```json
{
  "status": "ok",
  "message": "Service is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Полный пример последовательности операций:

```bash
# 1. Проверка работы сервиса
curl http://localhost:5000/

# 2. Получение списка (пустой)
curl http://localhost:5000/api/spreadsheets

# 3. Добавление первого spreadsheet ID
curl -X PUT "http://localhost:5000/api/spreadsheets?spreadsheetId=13Wg-tLmmLyPkLYGzopQESfhk6z41-vDfe6ST-uAQugk"

# 4. Добавление второго spreadsheet ID
curl -X PUT "http://localhost:5000/api/spreadsheets?spreadsheetId=1qVut0HJ4GyJ_1I4vkaHOI3wUvDikO3cqxYkwpAuHY7w"

# 5. Получение списка (теперь с данными)
curl http://localhost:5000/api/spreadsheets

# 6. Удаление по ID записи
curl -X DELETE http://localhost:5000/api/spreadsheets/1

# 7. Удаление по spreadsheet ID
curl -X DELETE "http://localhost:5000/api/spreadsheets/1qVut0HJ4GyJ_1I4vkaHOI3wUvDikO3cqxYkwpAuHY7w"

# 8. Очистка всей таблицы
curl -X DELETE http://localhost:5000/api/spreadsheets
```

---

## Примечания:

1. **Windows PowerShell**: В PowerShell `curl` является алиасом для `Invoke-WebRequest`, поэтому используйте `curl.exe` для настоящего curl или `Invoke-RestMethod` для нативного PowerShell.

2. **Кодирование URL**: Если spreadsheet ID содержит специальные символы, их нужно кодировать в URL. Например:
   ```bash
   curl -X PUT "http://localhost:5000/api/spreadsheets?spreadsheetId=$(echo 'ID_с_спец_символами' | jq -sRr @uri)"
   ```

3. **CORS**: API поддерживает CORS, поэтому можно делать запросы из браузера.

4. **Порты**: Убедитесь, что порт 5000 (или указанный в `APP_PORT`) доступен и сервер запущен.
