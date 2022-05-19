<template>
  <div>
    <a-drawer
      :width="800"
      title="添加标签"
      placement="right"
      :visible="visible"
      :maskClosable="false"
      @close="onClose"
    >
      <div
        class="newbookmark-drawer-tag-container"
        v-for="bitem in cachedNewBookmarkList"
        :key="bitem.id"
      >
        <div class="title">
          {{ bitem.title }}
        </div>
        <div class="tags-wrapper">
          <a-select
            v-model:value="bitem.tags"
            mode="tags"
            style="width: 100%"
            placeholder="请输入标签，回车输入多个"
            :options="options"
          ></a-select>
        </div>
        <div class="action-wrapper">
          <a-space>
            <a-button type="primary" size="small" @click="saveNewItemTags(bitem)" >保存</a-button>
            <a-button size="small" danger @click="removeCacheBookmark(bitem)">不添加标签</a-button>
          </a-space>
        </div>
      </div>
    </a-drawer>
  </div>
</template>
<script>
// import {
//   FileTextFilled
// } from "@ant-design/icons-vue";
import IndexedDbKits from "../utils/IndexedDbKits";
import Logger from "../utils/Logger";
export default {
  components: {},
  data() {
    return {
      visible: false,
      cachedNewBookmarkList: [],
      options: [{ value: "java" }, { value: "vue" }],
    };
  },
  methods: {
    onClose() {
      this.visible = false;
    },
    onOpen() {
      this.visible = true;
    },
    loadCachedNewBookmarks() {
      IndexedDbKits.readNewBookmarksCache("newBookmarkList").then(
        (bookmarks) => {
          Logger.debug("load cached new bookmarks", bookmarks);
          if (bookmarks.newBookmarkList && bookmarks.newBookmarkList.list) {
            this.cachedNewBookmarkList = bookmarks.newBookmarkList.list.map(
              (item) => {
                item.tags = [];
                return item;
              }
            );
          }else  {
            this.cachedNewBookmarkList = [];
          }
        }
      );
    },
    loadAllTags() {
      IndexedDbKits.listAllTags().then((tags) => {
        Logger.debug("load all tags", tags);
        this.options = tags.map((item) => {
          return { value: item.tag };
        });
      });
    },
    removeCacheBookmark(bitem) {
      IndexedDbKits.removeNewBookmarkCache(bitem).then(() => {
        this.cachedNewBookmarkList = this.cachedNewBookmarkList.filter(
          (item) => {
            return item.id !== bitem.id;
          }
        );
      });
    },
    saveNewItemTags(bitem) {
      Logger.debug(bitem.id,bitem.tags)
      const promisses = bitem.tags.map((tag) => {
        IndexedDbKits.insertNewTag(bitem.id,tag);
      });
      Promise.all(promisses).then(() => {
        this.removeCacheBookmark(bitem);
      });
    }
  },
  mounted() {
    this.loadCachedNewBookmarks();
    this.loadAllTags();
  },
};
</script>
<style>
.newbookmark-drawer-tag-container {
  padding: 10px;
  /* border-bottom: 1px solid rgb(223, 233, 240); */
}
.newbookmark-drawer-tag-container > .title {
  padding: 5px 0 10px 0;
}
.newbookmark-drawer-tag-container > .action-wrapper {
  padding-top: 10px;
}
</style>