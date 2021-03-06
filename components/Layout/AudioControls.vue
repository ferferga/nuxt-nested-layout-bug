<template>
  <v-container fluid>
    <v-row>
      <v-col cols="9" md="3" class="d-flex flex-row pa-0">
        <v-avatar ref="albumCover" tile size="72" color="primary">
          <v-img :src="getImageUrl(getCurrentItem.AlbumId)">
            <template #placeholder>
              <v-icon dark>mdi-album</v-icon>
            </template>
          </v-img>
        </v-avatar>
        <div class="d-flex flex-column justify-center ml-4">
          <span class="font-weight-medium mt-md-n2">
            <nuxt-link
              tag="span"
              class="text-truncate link"
              :to="`/item/${getCurrentItem.AlbumId}`"
            >
              {{ getCurrentItem.Name }}
            </nuxt-link>
            <v-btn class="d-none d-md-inline-flex" icon disabled>
              <v-icon size="18">{{
                getCurrentItem.UserData.IsFavorite
                  ? 'mdi-heart'
                  : 'mdi-heart-outline'
              }}</v-icon>
            </v-btn>
          </span>
          <nuxt-link
            tag="span"
            class="text--secondary text-caption text-truncate mt-md-n2 link"
            :to="`/artist/${getCurrentItem.AlbumArtists[0].Id}`"
          >
            {{ getCurrentItem.AlbumArtist }}
          </nuxt-link>
        </div>
      </v-col>
      <v-col cols="6" class="pa-0 d-none d-md-inline">
        <div class="d-flex flex-column justify-center">
          <div class="d-flex align-center justify-center">
            <v-btn disabled icon class="mx-1">
              <v-icon>mdi-shuffle</v-icon>
            </v-btn>
            <v-btn icon class="mx-1" @click="setPreviousTrack">
              <v-icon>mdi-skip-previous</v-icon>
            </v-btn>
            <v-btn icon large class="mx-1" @click="togglePause">
              <v-icon large>
                {{ isPaused ? 'mdi-play' : 'mdi-pause' }}
              </v-icon>
            </v-btn>
            <v-btn icon class="mx-1" @click="stopPlayback">
              <v-icon>mdi-stop</v-icon>
            </v-btn>
            <v-btn icon class="mx-1" @click="setNextTrack">
              <v-icon>mdi-skip-next</v-icon>
            </v-btn>
            <v-btn disabled icon class="mx-1">
              <v-icon>mdi-repeat-off</v-icon>
            </v-btn>
          </div>
          <media-progress-slider />
        </div>
      </v-col>
      <v-col cols="3" class="d-none d-md-flex align-center justify-end">
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <v-btn disabled icon class="mr-2" v-bind="attrs" v-on="on">
              <v-icon>mdi-playlist-play</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('queue') }}</span>
        </v-tooltip>
        <volume-slider />
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <nuxt-link tag="span" :to="'/playback'">
              <v-btn icon class="ml-2" v-bind="attrs" v-on="on">
                <v-icon>mdi-fullscreen</v-icon>
              </v-btn>
            </nuxt-link>
          </template>
          <span>{{ $t('fullScreen') }}</span>
        </v-tooltip>
      </v-col>
      <v-col cols="3" class="d-flex d-md-none px-0 align-center justify-end">
        <v-btn icon>
          <v-icon>mdi-heart</v-icon>
        </v-btn>
        <v-btn icon @click="togglePause">
          <v-icon>
            {{ isPaused ? 'mdi-play' : 'mdi-pause' }}
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ImageType } from '@jellyfin/client-axios';
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import timeUtils from '~/mixins/timeUtils';
import imageHelper from '~/mixins/imageHelper';
import { PlaybackStatus } from '~/store/playbackManager';

export default Vue.extend({
  mixins: [timeUtils, imageHelper],
  computed: {
    ...mapGetters('playbackManager', ['getCurrentItem']),
    isPaused(): boolean {
      return this.$store.state.playbackManager.status === PlaybackStatus.paused;
    }
  },
  methods: {
    ...mapActions('playbackManager', [
      'setLastItemIndex',
      'resetCurrentItemIndex',
      'setNextTrack',
      'setPreviousTrack',
      'unpause',
      'pause'
    ]),
    getImageUrl(itemId: string): string {
      const element = this.$refs.albumCover as HTMLElement;
      return this.getImageUrlForElement(ImageType.Primary, {
        itemId,
        element
      });
    },
    stopPlayback(): void {
      this.setLastItemIndex();
      this.resetCurrentItemIndex();
      this.setNextTrack();
    },
    togglePause(): void {
      if (this.isPaused) {
        this.unpause();
      } else {
        this.pause();
      }
    }
  }
});
</script>
