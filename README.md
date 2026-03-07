# @rshval/svelte-components

Переиспользуемая UI-библиотека на Svelte 5.

Пакет содержит:

- базовые UI-компоненты (`Button`, `InputField`, `Select`, `Modal`, `Toast`, `Alert`);
- составные компоненты (`Table`, `InputPhone`, `Drawer`, `Notifications`);
- map-компоненты на `mapbox-gl`;
- хелперы и плагины (`api`, `geoserviceApi`, `storage*`);
- готовые Svelte stores для сессии, аккаунта, сети, геолокации и device info.

## Установка

```bash
npm i @rshval/svelte-components
```

Также убедитесь, что в проекте установлены зависимости библиотеки:

- `@popperjs/core` — runtime dependency (устанавливается автоматически вместе с пакетом);
- `svelte`, `@sveltejs/kit`, `@tiptap/*` — peer dependencies, их нужно держать совместимыми в приложении-потребителе.

## Быстрый старт

```svelte
<script lang="ts">
	import { Button, InputField, Table } from '@rshval/svelte-components';

	let value = $state('');
	const rows = [{ id: '1', name: 'Alice' }];
	const columns = [{ id: 'name', title: 'Name' }];
</script>

<InputField bind:value label="Имя" placeholder="Введите имя" />
<Button>Сохранить</Button>
<Table {rows} {columns} />
```

## Использование компонентов

Ниже — типовой шаблон, как подключать компоненты из библиотеки и передавать им props/slots.

### 1) Импорт из пакета

```svelte
<script lang="ts">
	import { Button, InputField, Select, Modal, Toast, Table } from '@rshval/svelte-components';
</script>
```

### 2) Базовые компоненты формы

```svelte
<script lang="ts">
	import { Button, InputField, Select } from '@rshval/svelte-components';

	let name = $state('');
	let role = $state('user');

	const options = [
		{ id: 'user', title: 'Пользователь' },
		{ id: 'admin', title: 'Администратор' }
	];
</script>

<InputField bind:value={name} label="Имя" placeholder="Введите имя" />
<Select bind:value={role} {options} label="Роль" />
<Button on:click={() => console.log({ name, role })}>Сохранить</Button>
```

#### Поле пароля с кнопкой показать/скрыть

`InputField` поддерживает встроенный toggle пароля: если передать `type="password"`, справа появится кнопка с иконкой глаза.

```svelte
<script lang="ts">
	import { InputField } from '@rshval/svelte-components';

	let password = $state('');
</script>

<InputField
	bind:value={password}
	type="password"
	label="Пароль"
	placeholder="Введите пароль"
	autocomplete="new-password"
/>
```

Полезные детали:

- Кнопка переключает тип инпута между `password` и `text`.
- Для доступности у кнопки используется `aria-label`: `Показать пароль` / `Скрыть пароль`.
- Если `disabled`, кнопка переключения также блокируется.
- Toggle можно отключить через `passwordToggle={false}`.

### 3) Модальные окна и уведомления

```svelte
<script lang="ts">
	import { Button, Modal, Toast } from '@rshval/svelte-components';

	let isModalOpen = $state(false);
	let showToast = $state(false);
</script>

<Button on:click={() => (isModalOpen = true)}>Открыть модалку</Button>

<Modal bind:open={isModalOpen} title="Подтверждение">
	<p>Вы уверены, что хотите продолжить?</p>
	<Button on:click={() => (showToast = true)}>Подтвердить</Button>
</Modal>

{#if showToast}
	<Toast message="Операция выполнена" type="success" />
{/if}
```

### 4) Таблицы

```svelte
<script lang="ts">
	import { Table } from '@rshval/svelte-components';

	const rows = [
		{ id: '1', name: 'Alice', email: 'alice@example.com' },
		{ id: '2', name: 'Bob', email: 'bob@example.com' }
	];

	const columns = [
		{ id: 'name', title: 'Имя' },
		{ id: 'email', title: 'Email' }
	];
</script>

<Table {rows} {columns} />
```

### 5) Рекомендации по использованию

- Начинайте с импорта только необходимых компонентов, чтобы не усложнять код страницы.
- Проверяйте доступные props и события в Storybook перед интеграцией в продуктовую страницу.
- Browser-only компоненты (например, карта) подключайте внутри `onMount` или под проверкой `browser` в SvelteKit.

## Экспорты

Основные группы экспортов из `src/lib/index.ts`:

- Components: `Button`, `Badge`, `InputField`, `Textarea`, `Editor`, `Select`, `Loader`, `Modal`, `Switch`, `Alert`, `Popup`, `BreadCrumbs`, `Timer`, `Toast`;
- Complex components: `InputPhone`, `Notifications`, `Notification`, `Table`, `Theme`, `ThemeButton`, `Drawer`;
- Map: `Map`, `MapComponent`, `UiMap*`, `getGeolocation`, типы событий mapbox;
- Helpers: `clickOutside`, `blurOnEscape`, `isValid*`, `patternPassword`, `getColorByValue`, `isObject`;
- Plugins: `api`, `geoserviceApi`, `storageGet/storageSet/storageRemove`;
- Stores: `accountStore`, `sessionStore`, `networkStore`, `deviceInfoStore`, `geolocationStore`, `screenOrientationStore`, `noScrollAppStore`.

## Скрипты разработки

```bash
npm run dev
npm run check
npm run lint
npm run test
npm run build
npm run storybook
npm run build-storybook
```

## Storybook

Для визуальной проверки компонентов в изоляции:

```bash
npm run storybook
```

Сборка статического Storybook:

```bash
npm run build-storybook
```

## Публикация

Сборка пакета:

```bash
npm run prepack
```

Ручная публикация:

```bash
npm publish --access public
```

Автоматизированный релиз через Changesets:

1. Добавьте changeset (`npm run changeset`) с описанием изменений.
2. На `main` workflow создаст/обновит release PR с версиями и changelog.
3. После merge release PR пакет публикуется автоматически (`npm run release`).

## Совместимость

| Пакет                              | Рекомендуемая версия |
| ---------------------------------- | -------------------- |
| `svelte` (peer)                    | `^5.53.7`            |
| `@sveltejs/kit` (peer)             | `^2.53.4`            |
| `@tiptap/core` и `@tiptap/*` (peer)| `^3.20.0`            |
| `@popperjs/core` (runtime)         | `^2.11.8`            |

## Ограничения и особенности SSR

- Часть компонентов ориентирована на браузерное окружение (`mapbox-gl`, геолокация, Capacitor плагины) и должна использоваться только на клиенте.
- Для SvelteKit-страниц с SSR оборачивайте browser-only компоненты в проверки `if (browser)` или грузите через `onMount`.
- Компоненты карты требуют наличия токена и клиентского инициализационного кода.
- Плагины Capacitor предполагают доступ к нативной среде; в обычном браузере возможны ограничения API и fallback-поведение.

## Breaking changes policy

- Любое удаление/изменение публичного экспорта (`exports` или именованный экспорт из корня) считается breaking change и требует major bump.
- Изменения обязательных props у компонентов и shape публичных store/helper API также считаются breaking changes.
- Для потребителей рекомендуется фиксировать major-версию (`^1.x`) и читать changelog перед обновлением.

Подробный пошаговый план выноса в отдельный репозиторий: `MIGRATION_TO_STANDALONE.md`.

## Migration checklist при выносе в отдельный репозиторий

1. Вынести package в отдельный git-репозиторий с сохранением истории (`git subtree split` или фильтрация истории).
2. Настроить CI: `check`, `prepack`, `build-storybook` на pull request.
3. Включить changesets workflow для контроля semver и changelog.
4. Проверить public API: фиксировать контракты в `exports` и не удалять их без major bump.
5. Добавить smoke-пример потребителя (минимальный SvelteKit app), который устанавливает пакет из tarball.

## CI и smoke-проверки

Рекомендуемые проверки в CI перед публикацией:

```bash
npm run check
npm run prepack
npm run smoke:exports
npm run build-storybook
```

`smoke:exports` проверяет, что после `prepack` в `dist/` действительно присутствуют все артефакты, объявленные в `exports`.
