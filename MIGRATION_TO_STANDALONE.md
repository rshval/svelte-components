
## 1) Настроить CI (обязательный минимум)

Рекомендуемые джобы на pull request:

1. `pnpm run check:deps`
2. `pnpm run check`
3. `pnpm run prepack`
4. `pnpm run smoke:exports`

Дополнительно (если используете визуальный регресс/дизайн-review):

- `pnpm run build-storybook`

## 2) Настроить релиз-пайплайн

1. Включить Changesets action.
2. Публикацию выполнять из `main` после merge release PR.
3. Проверить токены/permissions для npm publish.
