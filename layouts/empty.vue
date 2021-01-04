<template>
  <v-app>
    <nuxt v-if="!$slots.default" />
    <slot />
    <snackbar />
    <player-manager />
  </v-app>
</template>
