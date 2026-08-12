<script lang="ts">
	import InputField from '../components/input/InputField.svelte';

	let email = $state('anna@example.com');
	let password = $state('secret-value');
</script>

<div class="grid max-w-3xl gap-4 md:grid-cols-2">
	<InputField label="Email" type="email" bind:value={email} placeholder="name@example.com" />
	<InputField label="Password" type="password" bind:value={password} placeholder="Enter password" />
	<InputField label="Search" type="search" value="" placeholder="Search by name or ID" />
	<InputField label="Disabled" value="Read only value" disabled />
	<InputField label="Number" type="number" value="24" min={0} max={100} />
	<InputField
		class="input-error"
		label="With error style"
		value="Invalid value"
		aria-invalid="true"
	/>
</div>
