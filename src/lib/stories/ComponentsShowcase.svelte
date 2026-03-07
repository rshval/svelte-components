<script lang="ts">
	import Alert from '../components/Alert.svelte';
	import Badge from '../components/Badge.svelte';
	import Button from '../components/Button.svelte';
	import Loader from '../components/Loader.svelte';
	import Switch from '../components/Switch.svelte';
	import Toast from '../components/Toast.svelte';

	let checked = $state(true);
</script>

<div class="grid gap-4 md:grid-cols-2">
	<div class="card bg-base-100 border-base-300 border shadow-sm">
		<div class="card-body gap-4">
			<h3 class="card-title">Базовые элементы</h3>
			<Alert class="alert-info">Компонент Alert отображается корректно</Alert>
			<div class="flex items-center gap-2">
				<Badge class="badge-primary">New</Badge>
				<Badge class="badge-outline">v1.1.6</Badge>
			</div>
			<Button class="btn-primary">Кнопка Button</Button>
		</div>
	</div>

	<div class="card bg-base-100 border-base-300 border shadow-sm">
		<div class="card-body gap-4">
			<h3 class="card-title">Состояния</h3>
			<div class="flex items-center justify-between gap-4">
				<span>Switch</span>
				<Switch bind:checked styleType="success" />
			</div>
			<div class="relative h-20 rounded-box border border-dashed border-base-300">
				<Loader class="loading-md" />
			</div>
		</div>
	</div>

	<div class="card bg-base-100 border-base-300 border shadow-sm md:col-span-2">
		<div class="card-body gap-4">
			<h3 class="card-title">Toast</h3>
			<div class="relative min-h-28 rounded-box border border-dashed border-base-300 p-2">
				<Toast
					class="toast-end"
					items={[
						{ type: 'success', message: 'Данные сохранены' },
						{ type: 'info', message: 'Тема Storybook применена' }
					]}
				/>
			</div>
		</div>
	</div>
</div>
