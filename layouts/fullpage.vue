<template>
  <empty-layout>
    <v-main>
      <nuxt />
    </v-main>
  </empty-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import EmptyLayout from '~/layouts/empty.vue';

export default Vue.extend({
  components: {
    EmptyLayout
  }
});
</script>
