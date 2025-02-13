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
    default: 'Select Item',
  },
  title: {
    type: String,
    default: 'Filter',
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
  // Add isTeamFilter prop to determine which filter set to use
  isTeamFilter: {
    type: Boolean,
    default: true,
  },
})

const filterStore = useFilterStore()
const selectedItems = ref(props.multiple ? [] : null)

const handleChange = (selected) => {
  // Use the appropriate clear method based on isTeamFilter prop
  if (props.isTeamFilter) {
    filterStore.clearTeamFilters(props.filterType)
  } else {
    filterStore.clearModalFilters(props.filterType)
  }

  if (selected) {
    if (props.multiple) {
      selected.forEach((item) => {
        if (props.isTeamFilter) {
          filterStore.addTeamFilter(props.filterType, item)
        } else {
          filterStore.addModalFilter(props.filterType, item)
        }
      })
    } else {
      if (props.isTeamFilter) {
        filterStore.addTeamFilter(props.filterType, selected)
      } else {
        filterStore.addModalFilter(props.filterType, selected)
      }
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
