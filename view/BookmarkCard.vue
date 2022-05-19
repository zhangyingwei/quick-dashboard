<template>
  <div class="bookmark-card-wrapper" :style="{ width: style.width + 'px' }">
    <div class="bookmark-card-wrapper-title" :alt="info.title">
      <coffee-outlined />
      <span class="wall"></span>
      <a target="_blank" :title="info.title" :href="info.url">{{
        info.title
      }}</a>
    </div>

    <div class="bookmark-card-dirlist">
      <a-breadcrumb>
        <a-breadcrumb-item>
          <folder-open-outlined />
        </a-breadcrumb-item>
        <a-breadcrumb-item v-for="dir in dirs" :key="dir">{{
          dir
        }}</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <div class="bookmark-card-tags-wrapper">
      <a-tag
        closable
        @close="removeTag(tag)"
        class="bookmark-card-tag"
        v-for="tag in info.tags"
        :key="tag"
        color="purple"
        >{{ tag }}</a-tag
      >
      <a-input
        v-if="inputVisible && !tagsIsFull"
        ref="inputRef"
        v-model:value="inputValue"
        type="text"
        size="small"
        :maxlength=8
        :style="{ width: '78px' }"
        @blur="handleInputConfirm"
        @keyup.enter="handleInputConfirm"
      />
      <a-tag
        v-if="!inputVisible && !tagsIsFull"
        style="background: #fff; border-style: dashed"
        @click="showInput"
      >
        <plus-outlined />
        添加标签
      </a-tag>
    </div>
    <div
      v-if="!showRemoveBookmarkConfirm"
      class="remove-action"
      @click="removeBookmark"
    >
      <delete-outlined />
    </div>
    <div v-if="showRemoveBookmarkConfirm" class="remove-action-confirm">
      <a-space>
        <a-button size="small" @click="cancleBookmarkRemove">取消</a-button>
        <a-button size="small" @click="removeBookmarkConfirm"
          >确定删除</a-button
        >
      </a-space>
    </div>
    <div v-if="isRemove" class="bookmark-card-wrapper-remove-mark">已删除</div>
  </div>
</template>
<script>
import {
  CoffeeOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import chromeKits from "@/utils/ChromeKits";
import Logger from "@/utils/Logger";
// import chromeKits from '@/utils/ChromeKits';

export default {
  name: "BookmarkCard",
  components: {
    CoffeeOutlined,
    FolderOpenOutlined,
    PlusOutlined,
    DeleteOutlined,
  },
  props: {
    info: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      style: {
        width: 400,
      },
      isRemove: false,
      showRemoveBookmarkConfirm: false,
      maxTagLength: 8,
      inputVisible: false,
      tagsIsFull: false,
      inputValue: "",
      dirs: [],
      // tags: [],
      selectedType: [],
      typeOptions: [
        {
          value: "test",
          label: "测试",
        },
        {
          value: "test1",
          label: "测试1",
        },
      ],
      tableName: "bookmarkTable",
      canGetWidth: true
    };
  },
  methods: {
    removeBookmark() {
      // chrome.bookmarks.remove(this.info.id);
      this.showRemoveBookmarkConfirm = true;
    },
    cancleBookmarkRemove() {
      this.showRemoveBookmarkConfirm = false;
    },
    removeBookmarkConfirm() {
      chrome.bookmarks.remove(this.info.id);
      this.showRemoveBookmarkConfirm = false;
      this.isRemove = true;
    },
    removeTag(e) {
      this.$emit("removeTag", this.info.id, e);
      // eslint-disable-next-line vue/no-mutating-props
      this.info.tags = this.info.tags.filter((tag) => tag !== e);
      this.checkTagsIsFull();
    },
    handleInputConfirm() {
      const self = this;
      if (self.inputValue) {
        if (self.info.tags && self.info.tags.indexOf(self.inputValue) > -1) {
          self.inputValue = "";
          return;
        }
        this.$emit("createTag", self.info.id, self.inputValue);
        if (!self.info.tags) {
          // eslint-disable-next-line vue/no-mutating-props
          self.info.tags = [];
        }
        // eslint-disable-next-line vue/no-mutating-props
        self.info.tags.push(self.inputValue);
        self.inputValue = "";
      }
      self.inputVisible = false;
      this.checkTagsIsFull();
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.inputRef.focus();
      });
    },
    getCardWidth() {
      if (!this.canGetWidth) {
        return;
      }
      // 通过 document 获取 bookmarks-items-wrapper 的宽度
      const width = document.querySelector(
        ".bookmarks-items-wrapper"
      ).offsetWidth;
      // console.log("width",width)
      if (width <= 600) {
        this.style.width = width - 20;
      } else if (width > 600 && width < 900) {
        this.style.width = (width - 60) / 2.0;
      } else if (width >= 900 && width < 1250) {
        this.style.width = (width - 80) / 3.0;
      } else if (width >= 1250) {
        this.style.width = (width - 110) / 4.0;
      }
      this.canGetWidth = false;
      setTimeout(() => {
        this.canGetWidth = true;
      }, 100);
      Logger.debug("width", width,this.style.width);
    },
    checkTagsIsFull() {
      const self = this;
      if (self.info.tags && self.info.tags.length >= this.maxTagLength) {
        self.tagsIsFull = true;
      } else {
        self.tagsIsFull = false;
      }
    },
    async getDir() {
      var cusorInfo = this.info;
      // eslint-disable-next-line vue/no-mutating-props
      this.dirs = [];
      while (cusorInfo.parentId) {
        // eslint-disable-next-line vue/no-mutating-props
        this.dirs.push(cusorInfo.title);
        cusorInfo = await chromeKits.getById(cusorInfo.parentId);
        cusorInfo = cusorInfo[0];
      }
      this.dirs = this.dirs.reverse().slice(0, this.dirs.length - 1);
    },
  },
  watch: {
    info: {
      handler(newVal) {
        if (newVal) {
          this.checkTagsIsFull();
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.getDir();
    this.checkTagsIsFull();
  },
  created() {
    this.getCardWidth();
    // listen window resize event
    window.addEventListener("resize", this.getCardWidth);
  },
  unmounted() {
    window.removeEventListener("resize", this.getCardWidth);
  },
};
</script>
<style>
.bookmark-card-wrapper {
  background-color: #fff;
  display: inline-block;
  padding: 10px 20px;
  margin: 10px;
  width: 300px;
  border-radius: 5px;
  text-align: left;
  height: 180px;
  overflow: hidden;
  position: relative;
}
.bookmark-card-wrapper-title {
  font-size: 16px;
  font-weight: bold;
  font-family: "仿宋", "Courier New", Courier, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bookmark-card-dirlist .ant-breadcrumb-link {
  font-size: 10px;
}

.bookmark-card-typeselct {
  padding: 15px 0;
}

.bookmark-card-tags-wrapper {
  /* height: 80px; */
  padding: 20px 0 10px 0;
}

.bookmark-card-tag {
  margin-bottom: 10px !important;
}

.bookmark-card-wrapper:hover .remove-action {
  display: inline-block;
}

.remove-action {
  cursor: pointer;
  display: none;
  padding: 2px;
  transition: 0.5s;
  position: absolute;
  bottom: 10px;
  right: 10px;
  color: rgb(181, 190, 196);
}
.remove-action-confirm {
  display: inline-block;
  transition: 0.5s;
  position: absolute;
  bottom: 10px;
  right: 10px;
}
.remove-action:hover {
  color: rgb(243, 75, 63);
}
.bookmark-card-wrapper-remove-mark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  line-height: 180px;
  text-align: center;
  color: rgb(209, 218, 224);
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 99;
  /* display: none; */
}
.wall {
  display: inline-block;
  width: 10px;
}
</style>