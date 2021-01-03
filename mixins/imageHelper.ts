/**
 * Helper for image manipulation and image-related utility functions
 *
 * @mixin
 */
import Vue from 'vue';
import { stringify } from 'qs';
import {
  BaseItemDto,
  BaseItemDtoImageBlurHashes,
  BaseItemPerson,
  ImageType
} from '@jellyfin/client-axios';

type ImageUrlForElementParams = {
  item?: BaseItemDto;
  element?: HTMLElement;
  tag?: string;
  itemId?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  limitByWidth?: boolean;
  backdropIndex?: number;
};

declare module '@nuxt/types' {
  interface Context {
    getImageUrlForElement: (
      type: ImageType,
      {
        item,
        element,
        tag,
        itemId,
        maxWidth,
        maxHeight,
        quality,
        limitByWidth,
        backdropIndex
      }: ImageUrlForElementParams
    ) => string;
    getImageTag(
      item: BaseItemDto | BaseItemPerson,
      type: ImageType,
      index?: number
    ): string | undefined;
    canBeBlurhashed(
      item: BaseItemDto | BaseItemPerson,
      type: ImageType,
      index?: number
    ): boolean;
    getBlurhashHash(
      item: BaseItemDto | BaseItemPerson,
      type: ImageType,
      index?: number
    ): string | undefined;
  }

  interface NuxtAppOptions {
    getImageUrlForElement: (
      type: ImageType,
      {
        item,
        element,
        tag,
        itemId,
        maxWidth,
        maxHeight,
        quality,
        limitByWidth,
        backdropIndex
      }: ImageUrlForElementParams
    ) => string;
    getImageTag(
      item: BaseItemDto | BaseItemPerson,
      type: ImageType,
      index?: number
    ): string | undefined;
    canBeBlurhashed(
      item: BaseItemDto | BaseItemPerson,
      type: ImageType,
      index?: number
    ): boolean;
    getBlurhashHash(
      item: BaseItemDto | BaseItemPerson,
      type: ImageType,
      index?: number
    ): string | undefined;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    getImageUrlForElement: (
      type: ImageType,
      {
        item,
        element,
        tag,
        itemId,
        maxWidth,
        maxHeight,
        quality,
        limitByWidth,
        backdropIndex
      }: ImageUrlForElementParams
    ) => string;
    getImageTag(
      item: BaseItemDto | BaseItemPerson,
      type: ImageType,
      index?: number
    ): string | undefined;
    canBeBlurhashed(
      item: BaseItemDto | BaseItemPerson,
      type: ImageType,
      index?: number
    ): boolean;
    getBlurhashHash(
      item: BaseItemDto | BaseItemPerson,
      type: ImageType,
      index?: number
    ): string | undefined;
  }
}

/**
 * Checks if the passed object is BaseItemDto or BaseItemPerson
 *
 * @param {BaseItemDto|BaseItemPerson} obj - The object to check
 * @returns {boolean} Returns true if the object is a person, false otherwise.
 */
function isPerson(obj: BaseItemDto | BaseItemPerson): obj is BaseItemPerson {
  if ((obj as BaseItemPerson).Role) {
    return true;
  }
  return false;
}

const excludedBlurhashTypes = [ImageType.Logo];

const imageHelper = Vue.extend({
  methods: {
    /**
     * Gets the tag of the image of an specific item and type
     *
     * @param {BaseItemDto|BaseItemPerson} item - The item object
     * @param {ImageType} type - The type of the image requested
     * @param {number} [index=0] - Index of the Backdrop image (when ImageType equals to 'Backdrop')
     * @returns {string|undefined} Returns the tag, undefined if the specific ImageType doesn't exist.
     */
    getImageTag(
      item: BaseItemDto | BaseItemPerson,
      type: ImageType,
      index = 0
    ): string | undefined {
      if (!isPerson(item)) {
        if (item?.ImageTags?.[type]) {
          return item?.ImageTags?.[type];
        } else if (
          type === ImageType.Backdrop &&
          item.BackdropImageTags &&
          item.BackdropImageTags[index]
        ) {
          return item.BackdropImageTags[index];
        }
      } else if (item.PrimaryImageTag && type === ImageType.Primary) {
        return item.PrimaryImageTag;
      }
    },
    /**
     * Checks if an item has a blurhash hash for an specific image type.
     * Although API-wise all the images have blurhashes, some of them are excluded in purpose (check imageHelper
     * mixin code, the 'excludedBlurhashTypes' contains a list with all the imageTypes that will always return false)
     *
     * @param {BaseItemDto|BaseItemPerson} item - The item object
     * @param {ImageType} type - The type of the image requested
     * @param {number} [index=0] - Index of the Backdrop image (when ImageType equals to 'Backdrop')
     * @returns {boolean} Returns the tag, undefined if the specific ImageType doesn't exist.
     */
    canBeBlurhashed(
      item: BaseItemDto | BaseItemPerson,
      type: ImageType,
      index = 0
    ): boolean {
      if (excludedBlurhashTypes.includes(type) || !item.ImageBlurHashes) {
        return false;
      }

      if (!isPerson(item)) {
        if (
          type === ImageType.Backdrop ||
          (item.BackdropImageTags &&
            item.ImageBlurHashes?.Backdrop &&
            item.ImageBlurHashes?.Backdrop?.[
              (item.BackdropImageTags as Array<string>)[index]
            ]) ||
          (item.ImageBlurHashes.Backdrop &&
            item.ParentBackdropImageTags &&
            item.ParentBackdropImageTags)
        ) {
          return true;
        } else if (
          item?.ImageBlurHashes?.[type] &&
          item?.ImageTags?.[type] &&
          item?.ImageBlurHashes?.[type]?.[item?.ImageTags?.[type]]
        ) {
          return true;
        }
      } else if (
        item?.PrimaryImageTag &&
        item?.ImageBlurHashes?.Primary &&
        item?.ImageBlurHashes?.Primary?.[item?.PrimaryImageTag]
      ) {
        return true;
      }
      return false;
    },
    /**
     * Gets the blurhash string of an image given the item and the image type desired.
     *
     * @param {BaseItemDto|BaseItemPerson} item - The item object
     * @param {ImageType} type - The type of the image requested
     * @param {number} [index=0] - Index of the Backdrop image (when ImageType equals to 'Backdrop')
     * @returns {string|undefined} Returns the tag, undefined if the specific ImageType doesn't exist.
     */
    getBlurhashHash(
      item: BaseItemDto | BaseItemPerson,
      type: ImageType,
      index = 0
    ): string | undefined {
      const tag = this.getImageTag(item, type, index);
      if (!tag || !this.canBeBlurhashed(item, type, index)) {
        return undefined;
      }

      if (!isPerson(item)) {
        if (type === ImageType.Backdrop) {
          return ((item?.ImageBlurHashes as BaseItemDtoImageBlurHashes)
            .Backdrop as Record<string, string>)[tag];
        } else {
          return ((item?.ImageBlurHashes as BaseItemDtoImageBlurHashes)[
            type
          ] as Record<string, string>)[tag];
        }
      } else {
        return ((item?.ImageBlurHashes as BaseItemDtoImageBlurHashes)[
          type
        ] as Record<string, string>)[item?.PrimaryImageTag as string];
      }
    },
    /**
     * Returns the URL of an item's image:
     * · When 'element' parameter is passed, size of the image will be determined by the element's width & height
     * · When 'maxWidth' and 'maxHeight' parameters are passed, size of the image will be as requested
     * · When no 'element' or 'maxWidth' or 'maxHeight' is provided, image will have the original size.
     *
     * @param {ImageType} type - The type of the image to fetch.
     * @param {object} options - Optional parameters for the function.
     * @param {BaseItemDto} options.item - The item to fetch the image for (optional).
     * @param {HTMLElement} options.element - The DOM element which size will be used for the image's maximum width or height (optional).
     * @param {string} options.tag - tag of the image to fetch (optional if item is passed).
     * @param {string} [options.itemId=item?.Id] - itemId to get the image from (optional if item is passed).
     * @param {number} [options.maxWidth=element?.clientWidth] - Maximum width of the image in CSS pixels (optional).
     * @param {number} [options.maxHeight=element?.clientHeight] - Maximum height of the image in CSS pixels (optional).
     * @param {number} [options.quality=90] - Quality level of the image (optional, only relevant for jpeg format).
     * @param {boolean} [options.limitByWidth=false] - Use the element's width instead of its height for the size calculation.
     * @param {number} [options.backdropIndex] - Index of the backdrop image to use (when image type is 'Backdrop')
     * @returns {string} The URL for the image, with the base URL set and the options provided.
     */
    getImageUrlForElement(
      type: ImageType,
      {
        item,
        element,
        tag,
        itemId = item?.Id,
        maxWidth = element?.clientWidth,
        maxHeight = element?.clientHeight,
        quality = 90,
        limitByWidth = false,
        backdropIndex = 0
      }: ImageUrlForElementParams
    ): string {
      if (item) {
        tag = this.getImageTag(item, type, backdropIndex);
        if (!tag) {
          throw new TypeError(
            "Item doesn't have a valid tag for the image type requested"
          );
        }
      } else if (!itemId) {
        throw new TypeError(
          'itemId must not be null or undefined when an item object is not passed'
        );
      }

      const url = new URL(
        `${this.$axios.defaults.baseURL}/Items/${itemId}/Images/${type}`
      );

      const params: { [k: string]: string | number | undefined } = {
        tag,
        quality
      };

      const scaling = window.devicePixelRatio;
      if (limitByWidth && maxWidth) {
        params.maxWidth = Math.round(maxWidth * scaling).toString();
      } else if (maxHeight) {
        params.maxHeight = Math.round(maxHeight * scaling).toString();
      }

      url.search = stringify(params);

      return url.toString();
    }
  }
});

export default imageHelper;
