# Фотоквест

Мобільний сайт для прогулянкового квесту. Кожен QR відкриває колесо фортуни, потім фото-підказку.

## Живий сайт

https://quarezz.github.io/quest/

Приклади точок:

- https://quarezz.github.io/quest/?s=1
- https://quarezz.github.io/quest/?s=6

Друк QR: [print.html](print.html)

## Локально

Відкрий `index.html?s=1` у браузері телефону або через простий сервер:

```bash
python3 -m http.server 8080
```

Потім `http://localhost:8080/?s=1`.

Призи та тексти підказок лежать у `js/quest.js`.
