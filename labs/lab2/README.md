### Лабораторна №2: Налаштування проєкту та інструментів розробки

#### Виконані завдання:

1. **Налаштування Prettier** для автоматичного форматування коду:

   - Додано конфігураційний файл:
     - [../../.prettierrc](../../.prettierrc) (backend)
   - Додано ігнорування певних файлів і папок у:
     - [../../.prettierignore](../../.prettierignore) (backend)
   - Додано команду для запуску форматування в `package.json`:
     ```bash
     npm run format
     ```

2. **Налаштування ESLint** для статичного аналізу коду:

   - Додано конфігураційний файл:
     - [../../eslint.config.js](../../eslint.config.js) (backend)
   - Налаштовано інтеграцію з Prettier для уникнення конфліктів форматування.
   - Додано команду для перевірки коду в `package.json`:
     ```bash
     npm run lint
     ```

3. **Налаштування Git-хуків за допомогою Husky**:

   - Ініціалізовано Husky:
     ```bash
     npm pkg set scripts.prepare="husky install"
     npm run prepare
     ```
   - Додано хук `pre-commit`, який запускає автоматичну перевірку коду (ESLint) та форматування (Prettier) перед кожним комітом:
     ```bash
     npx husky add .husky/pre-commit "npx lint-staged"
     ```
   - Налаштовано `lint-staged` для перевірки лише змінених файлів:
     ```json
     "lint-staged": {
       "*.{js,jsx,ts,tsx}": [
         "eslint --fix",
         "prettier --write"
       ]
     }
     ```

4. **Перевірка збірки та роботи середовища розробки**:
   - Перед запуском серверної частини виконується компіляція Tailwind CSS:
     ```bash
     npx tailwindcss -i ./public/styles/tailwind.css -o ./public/styles/output.css
     ```
   - Після компіляції виконується запуск серверної частини:
     ```bash
     npm start
     ```

5. **Інші поліпшення**:
   - Налаштовано `endOfLine: auto` у Prettier для уникнення помилок переносу рядків у різних ОС.
   - Створено файл `.prettierignore` для виключення непотрібних файлів із форматування.