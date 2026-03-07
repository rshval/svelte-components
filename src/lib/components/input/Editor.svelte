<script lang="ts">
	import DOMPurify from 'dompurify';
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import BubbleMenu from '@tiptap/extension-bubble-menu';
	import Underline from '@tiptap/extension-underline';

	import IconH1 from '@tabler/icons-svelte-runes/icons/h-1';
	import IconH2 from '@tabler/icons-svelte-runes/icons/h-2';
	import IconH3 from '@tabler/icons-svelte-runes/icons/h-3';
	import IconPilcrow from '@tabler/icons-svelte-runes/icons/pilcrow';
	import IconList from '@tabler/icons-svelte-runes/icons/list';
	import Button from '$lib/components/Button.svelte';

	let { value = $bindable(), disabled = false }: { value: string | undefined; disabled?: boolean } =
		$props();

	let bubbleMenu: HTMLElement;
	let element: HTMLElement;
	let editor: Editor | undefined = $state();
	let isVisible = $state(false);

	let isActiveButtonP = $state(false);
	let isActiveButtonH1 = $state(false);
	let isActiveButtonH2 = $state(false);
	let isActiveButtonH3 = $state(false);
	let isActiveButtonB = $state(false);
	let isActiveButtonI = $state(false);
	let isActiveButtonU = $state(false);
	let isActiveButtonS = $state(false);
	let isActiveButtonBulletList = $state(false);
	let showBubble = $state(false);

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit,
				BubbleMenu.configure({
					element: bubbleMenu,
					shouldShow: ({ state }) => !state.selection.empty,
					tippyOptions: {
						duration: 0,
						offset: [0, 10],
						onShow: () => {
							showBubble = true;
						},
						onHide: () => {
							showBubble = false;
						}
					}
				}),
				Underline
			],
			content: value ? DOMPurify.sanitize(value) : '',
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			},
			onFocus({ editor, event }) {
				// The editor is focused.
			},
			onUpdate({ editor }) {
				value = DOMPurify.sanitize(editor.getHTML());
				// The content has changed.
				getActiveButtons(); //get1
			},
			onSelectionUpdate({ editor }) {
				// The selection has changed.
				getActiveButtons(); //get2
			}
		});
		isVisible = true;
	});

	onDestroy(() => {
		if (editor) editor.destroy();
	});

	function getActiveButtons() {
		if (editor) {
			isActiveButtonP = editor.isActive('paragraph');
			isActiveButtonH1 = editor.isActive('heading', { level: 1 });
			isActiveButtonH2 = editor.isActive('heading', { level: 2 });
			isActiveButtonH3 = editor.isActive('heading', { level: 3 });
			isActiveButtonB = editor.isActive('bold');
			isActiveButtonI = editor.isActive('italic');
			isActiveButtonI = editor.isActive('italic');
			isActiveButtonU = editor.isActive('underline');
			isActiveButtonS = editor.isActive('strike');
			isActiveButtonBulletList = editor.isActive('bulletList');
		}
	}
</script>

<div style="position: relative" class="editor mt-2 overflow-hidden rounded-xl bg-base-200 p-2">
	{#if isVisible}
		<div class="fixed-menu mb-2 rounded-xl bg-base-300 p-2">
			<Button
				class={[{ 'btn-active': isActiveButtonH1 }, 'btn-sm']}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
			>
				<IconH1 size={20} />
			</Button>
			<Button
				class={[{ 'btn-active': isActiveButtonH2 }, 'btn-sm']}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
			>
				<IconH2 size={20} />
			</Button>
			<Button
				class={[{ 'btn-active': isActiveButtonH3 }, 'btn-sm']}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
			>
				<IconH3 size={20} />
			</Button>
			<Button
				onclick={() => editor?.chain().focus().setParagraph().run()}
				class={[{ 'btn-active': isActiveButtonP }, 'btn-sm']}
			>
				<IconPilcrow size={20} />
			</Button>
			<Button
				onclick={() => editor?.chain().focus().toggleBulletList().run()}
				class={[{ 'btn-active': isActiveButtonBulletList }, 'btn-sm']}
			>
				<IconList size={20} />
			</Button>
		</div>
	{/if}

	<ul
		bind:this={bubbleMenu}
		class="menu menu-horizontal absolute gap-2 rounded-xl bg-base-100 shadow-lg shadow-gray-300/50"
		style={showBubble ? '' : 'visibility: hidden;'}
	>
		{#if isVisible}
			<Button
				onclick={() => editor?.chain().focus().toggleBold().run()}
				class={[{ 'btn-active': isActiveButtonB }, 'btn-xs']}
			>
				Жирный
			</Button>
			<Button
				onclick={() => editor?.chain().focus().toggleItalic().run()}
				class={[{ 'btn-active': isActiveButtonI }, 'btn-xs']}
			>
				<i style="font-weight:300;">Курсив</i>
			</Button>
			<Button
				onclick={() => editor?.chain().focus().toggleUnderline().run()}
				class={[{ 'btn-active': isActiveButtonU }, 'btn-xs']}
			>
				<u style="font-weight:300;">Подчеркнуть</u>
			</Button>
			<Button
				onclick={() => editor?.chain().focus().toggleStrike().run()}
				class={[{ 'btn-active': isActiveButtonS }, 'btn-xs']}
			>
				<s style="font-weight:300;">Зачеркнуть</s>
			</Button>
		{/if}
	</ul>

	<div class="textarea mt-8 flex min-h-20 w-full flex-col rounded-xl bg-base-100 p-2">
		<div bind:this={element} class="editor__element prose max-h-80 min-h-24 overflow-scroll"></div>
	</div>
</div>

<style>
	.fixed-menu {
		margin-bottom: 0.5em;
	}
	.editor {
		width: 100%;
	}
	:global .editor__element > div {
		min-height: 100%;
		flex: 1;
		font-size: 0.9em;
	}
	:global .editor__element > div:focus {
		outline-color: transparent;
	}
	.prose {
		overflow: auto;
		max-width: unset;
	}
</style>
