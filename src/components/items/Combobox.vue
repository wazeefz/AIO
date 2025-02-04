<template>
  <div class="mb-4">
    <h2>{{ title }}</h2>
    <v-combobox
      v-model="selectedItems"
      :items="items"
      :label="label"
      item-title="title"
      item-value="id"
      :variant="variant"
      :chips="chips"
      :multiple="multiple"
      clearable
      @update:model-value="handleChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFilterStore } from '@/stores/filterStore'

// Define props for customization
const props = defineProps({
  variant: {
    type: String,
    default: 'underlined',
  },
  chips: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: 'Select Item', // Default label
  },
  title: {
    type: String,
    default: 'Filter', // Default title
  },
  items: {
    type: Array,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  filterType: {
    type: String,
    required: true,
  },
})

const filterStore = useFilterStore()
const selectedItems = ref(props.multiple ? [] : null)

const handleChange = (selected) => {
  filterStore.clearFilters(props.filterType)
  if (selected) {
    if (props.multiple) {
      selected.forEach((item) => {
        filterStore.addFilter(props.filterType, item)
      })
    } else {
      filterStore.addFilter(props.filterType, selected)
    }
  }
}

onMounted(() => {
  if (props.items.length > 0 && !props.multiple) {
    selectedItems.value = props.items[0].id
    handleChange(selectedItems.value)
  }
})
</script>
