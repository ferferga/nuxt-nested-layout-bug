<template>
  <div v-if="isValidImage" ref="img" class="absolute">
    <transition-group mode="in-out" name="fade" class="absolute">
      <blurhash-canvas
        v-if="hash"
        key="canvas"
        :hash="hash"
        :width="width"
        :height="height"
        :punch="punch"
        class="absolute"
      />
      <img
        key="image"
        class="absolute"
        :src="image"
        v-bind="$attrs"
        :alt="alt"
        @error="onError"
      />
    </transition-group>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { BaseItemDto, ImageType } from '@jellyfin/client-axios';
import imageHelper from '~/mixins/imageHelper';

export default Vue.extend({
  mixins: [imageHelper],
  props: {
    item: {
      type: Object as () => BaseItemDto,
      required: true
    },
    width: {
      type: Number,
      default: 32
    },
    height: {
      type: Number,
      default: 32
    },
    punch: {
      type: Number,
      default: 1
    },
    type: {
      type: String as () => ImageType,
      default: ImageType.Primary
    },
    alt: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      image: ''
    };
  },
  computed: {
    hash: {
      get(): string | undefined {
        return this.getBlurhashHash(this.item, this.type);
      }
    },
    isValidImage: {
      get(): string | undefined {
        return this.getImageTag(this.item, this.type);
      }
    }
  },
  mounted(): void {
    const img = this.$refs.img as HTMLElement;
    this.image = this.getImageUrlForElement(this.type, {
      item: this.item,
      element: img
    });
  },
  methods: {
    onError(): void {
      this.$emit('error');
    }
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.absolute {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
img {
  object-fit: cover;
}
</style>
