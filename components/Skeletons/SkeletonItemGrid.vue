<template>
  <v-row>
    <v-col cols="12" class="card-grid-container">
      <skeleton-card v-for="n in 24" :key="n" :card-shape="skeletonCardShape" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    viewType: {
      type: String,
      default: (): string => 'Movie'
    }
  },
  data() {
    return {
      skeletonCardShape: 'portrait-card'
    };
  },
  watch: {
    viewType(): void {
      this.setCardShape();
    }
  },
  created() {
    this.setCardShape();
  },
  methods: {
    setCardShape(): void {
      switch (this.viewType) {
        case 'Audio':
        case 'Folder':
        case 'MusicAlbum':
        case 'MusicArtist':
        case 'MusicGenre':
        case 'PhotoAlbum':
        case 'Playlist':
        case 'Video':
          this.skeletonCardShape = 'square-card';
          return;
        case 'Episode':
        case 'Studio':
          this.skeletonCardShape = 'thumb-card';
          return;
        case 'Book':
        case 'BoxSet':
        case 'Genre':
        case 'Movie':
        case 'Person':
        case 'Series':
        default:
          this.skeletonCardShape = 'portrait-card';
      }
    }
  }
});
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/styles.sass';
.card-grid-container {
  display: grid;
}

@media #{map-get($display-breakpoints, 'sm-and-down')} {
  .card-grid-container {
    grid-template-columns: repeat(3, minmax(calc(100% / 3), 1fr));
  }
}

@media #{map-get($display-breakpoints, 'sm-and-up')} {
  .card-grid-container {
    grid-template-columns: repeat(4, minmax(calc(100% / 4), 1fr));
  }
}

@media #{map-get($display-breakpoints, 'lg-and-up')} {
  .card-grid-container {
    grid-template-columns: repeat(6, minmax(calc(100% / 6), 1fr));
  }
}

@media #{map-get($display-breakpoints, 'xl-only')} {
  .card-grid-container {
    grid-template-columns: repeat(8, minmax(calc(100% / 8), 1fr));
  }
}
</style>
