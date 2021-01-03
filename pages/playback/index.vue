<template>
  <v-container fluid>
    <backdrop :hash="backdropHash" :opacity="0.5" />
    <swiper
      ref="playbackSwiper"
      class="swiper"
      :options="swiperOptions"
      @slideChange="onSlideChange"
    >
      <swiper-slide v-for="item in currentQueue" :key="item.Id">
        <div class="d-flex flex-column justify-center">
          <div class="d-flex align-center justify-center">
            <v-avatar ref="albumCover" tile size="65vh" color="primary">
              <v-img :src="getImageUrl(item)">
                <template #placeholder>
                  <v-icon dark>mdi-album</v-icon>
                </template>
              </v-img>
            </v-avatar>
          </div>
          <h1 class="text-h6 mt-5 text-center" data-swiper-parallax="-50">
            {{ item.Name }}
          </h1>
        </div>
      </swiper-slide>
    </swiper>
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
    <volume-slider />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { BaseItemDto, ImageType } from '@jellyfin/client-axios';
import { mapGetters, mapActions } from 'vuex';
import Swiper, { SwiperOptions } from 'swiper';
import { PlaybackStatus, RepeatMode } from '~/store/playbackManager';
import imageHelper from '~/mixins/imageHelper';

export default Vue.extend({
  mixins: [imageHelper],
  layout: 'fullpage',
  data() {
    return {
      swiperOptions: {
        slidesPerView: 4,
        centeredSlides: true,
        centerInsufficientSlides: true,
        initialSlide: 0,
        loop: true,
        parallax: true,
        autoplay: false,
        effect: 'coverflow',
        coverflowEffect: {
          depth: 500,
          slideShadows: false,
          stretch: -200,
          rotate: 0
        },
        keyboard: true,
        a11y: true
      } as SwiperOptions,
      swiper: undefined as Swiper | undefined
    };
  },
  computed: {
    currentItemIndex: {
      get(): number {
        return this.$store.state.playbackManager.currentItemIndex;
      }
    },
    currentQueue: {
      get(): BaseItemDto[] {
        return this.$store.state.playbackManager.queue;
      }
    },
    backdropHash: {
      get(): string | undefined {
        return this.getBlurhashHash(this.getCurrentItem(), ImageType.Primary);
      }
    },
    isPaused: {
      get(): boolean {
        return (
          this.$store.state.playbackManager.status === PlaybackStatus.paused
        );
      }
    }
  },
  watch: {
    currentItemIndex(newIndex: number): void {
      if (this.swiperOptions.loop) {
        this.swiper?.slideToLoop(newIndex);
      } else {
        this.swiper?.slideTo(newIndex);
      }
    }
  },
  beforeMount() {
    this.swiperOptions.initialSlide = this.currentItemIndex;
    if (this.$store.state.playbackManager.repeatMode !== RepeatMode.all) {
      this.swiperOptions.loop = false;
    }
  },
  mounted() {
    this.swiper = (this.$refs.playbackSwiper as Vue).$swiper as Swiper;
  },
  methods: {
    ...mapGetters('playbackManager', ['getCurrentItem']),
    ...mapActions('playbackManager', [
      'setLastItemIndex',
      'resetCurrentItemIndex',
      'setNextTrack',
      'setPreviousTrack',
      'unpause',
      'pause'
    ]),
    onSlideChange(): void {
      this.$store.state.playbackManager.currentItemIndex = this.swiper?.realIndex;
    },
    getImageUrl(item: BaseItemDto): string {
      return this.getImageUrlForElement(ImageType.Primary, { item });
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
<style lang="scss" scoped>
// .swiper-slide {
//   transition: filter 300ms;
// }
// .swiper-slide:not(.swiper-slide-active) {
//   filter: brightness(70%);
// }
</style>
