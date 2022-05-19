<template>
  <div
    ref="bookmarkWapper"
    class="bookmark-wapper"
    :class="{ 'bookmark-dark': isDarkModel }"
  >
    <div class="bookmark-content-wrapper">
      <div class="header">
        <div class="search-box-wrapper">
          <search-outlined class="search-before-icon" />
          <input
            type="text"
            placeholder="搜索书签 例: 书签名称 或 #标签"
            class="search-box"
            @input="onSearchInputChange"
            v-on:keyup.enter="onSearchSubmit"
            v-model="searchText"
          />
        </div>

        <div class="search-message" v-if="alert.show">
          {{ alert.message }}
        </div>

        <div class="quickselect-wrapper" v-if="false">
          <!-- 这块还没想好怎么做 -->
          <span
            @click="selectFilterDir('')"
            :class="{
              'quickselect-bookmark-dir': true,
              activate: filter.dirId === '',
            }"
          >
            全部书签
          </span>
          <span
            v-if="dir.pageIndex > 1"
            @click="previewDirPage"
            class="quickselect-bookmark-dir-left-action"
            ><left-outlined
          /></span>
          <span class="quickselect-bookmark-dir-container">
            <span
              @click="selectFilterDir(dir.id)"
              :class="{
                'quickselect-bookmark-dir': true,
                activate: filter.dirId === dir.id,
              }"
              v-for="dir in bookmarksDirs"
              :key="dir.id"
            >
              <span v-if="filter.dirId === dir.id"><FolderOpenOutlined /></span>
              <span v-else><FolderOutlined /></span> {{ dir.title }}
            </span>
          </span>
          <span
            @click="nextDirPage"
            class="quickselect-bookmark-dir-right-action"
            ><right-outlined
          /></span>
        </div>
      </div>

      <div class="quickselect-panel">
        <!-- 暂时无分了信息，所以分类查询选项也去掉 -->
        <div class="left">
          <a-dropdown
            :trigger="['click']"
            :overlayClassName="isDarkModel ? 'navigation-dark' : ''"
          >
            <a-button>
              <template #icon><SortAscendingOutlined /></template>
            </a-button>
            <template #overlay>
              <a-menu v-model:selectedKeys="sortKeys" @click="onSortChange">
                <a-menu-item key="asc">
                  <smile-outlined v-if="sort === 'asc'" />
                  <meh-outlined v-else />
                  按添加时间升序
                </a-menu-item>
                <a-menu-item key="desc">
                  <smile-outlined v-if="sort === 'desc'" />
                  <meh-outlined v-else />
                  按添加时间降序
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>

      <div class="bookmarks-items-wrapper">
        <BookmarkCard
          @createTag="createTagOfItem"
          @removeTag="removeTagOfItem"
          v-for="item in bookmarksPageList"
          :key="item.id"
          :info="item"
        />
      </div>
    </div>

    <a-back-top />
    <NewBookmarkDrawer ref="newbookmarkdrawer" />
  </div>
</template>
<script>
import {
  SearchOutlined,
  SortAscendingOutlined,
  MehOutlined,
  SmileOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons-vue";
import BookmarkCard from "./BookmarkCard";
import chromeKits from "../utils/ChromeKits";
import IndexedDbKits from "../utils/IndexedDbKits";
import NewBookmarkDrawer from "./NewBookmarkDrawer";
import Logger from "../utils/Logger";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import ThemeKits from "@/utils/ThemeKits";
export default {
  name: "BookmarkPanel",
  components: {
    SearchOutlined,
    BookmarkCard,
    SortAscendingOutlined,
    MehOutlined,
    SmileOutlined,
    FolderOpenOutlined,
    FolderOutlined,
    LeftOutlined,
    RightOutlined,
    NewBookmarkDrawer,
  },
  data() {
    return {
      searchText: "",
      bookmarksPageList: [],
      bookmarksDirs: [
        {
          id: 0,
          title: "全部书签",
        },
      ],
      pageIndex: 0,
      pageSize: 40,
      dir: {
        pageIndex: 0,
        pageSize: 5,
      },
      filter: {
        type: "all",
        tag: "博客",
        dirId: "",
      },
      sort: "asc",
      sortKeys: ["asc"],
      alert: {
        show: false,
        message: "",
      },
      isDarkModel: false,
      canLoad: true,
    };
  },
  methods: {
    initPageInfo() {
      // 初始化页面参数
      this.searchText = "";
      this.pageIndex = 0;
      this.pageSize = 40;
      this.bookmarksPageList = [];
      this.alert.show = false;
      this.alert.message = "";
    },
    bookmarksSortFunc(bookmarkLeft, bookmarkRight) {
      if (this.sort === "asc") {
        return bookmarkLeft.id - bookmarkRight.id;
      } else {
        return bookmarkRight.id - bookmarkLeft.id;
      }
    },
    onSearchInputChange() {
      Logger.debug("search change");
      // const text = this.searchText;
    },
    onSearchSubmit() {
      this.alert.show = false;
      const text = this.searchText;
      if (text === "") {
        Logger.debug("search empty");
        this.pageIndex = 0;
        this.bookmarksPageList = [];
        this.loadPage();
        return;
      } else if (this.searchTextIsTag()) {
        Logger.debug("search tag");
        const tagText = this.searchText.substring(1);
        this.loadPageWithTag(tagText);
      } else if (this.searchTextIsNoTag()) {
        Logger.debug("search no tag");
        this.loadPageWithNoTag();
      } else {
        NProgress.start();
        Logger.debug("search name");
        chromeKits.searchBookmarks(text).then((bookmarks) => {
          this.bookmarksPageList = bookmarks.sort(this.bookmarksSortFunc);
          NProgress.done();
        });
      }
    },
    searchTextIsTag() {
      return this.searchText.startsWith("#");
    },
    searchTextIsNoTag() {
      return this.searchText === "!#";
    },
    changeMetaTypeFilterParam() {
      this.bookmarksPageListIndex = 0;
      this.loadPage();
    },
    createTagOfItem(itemId, tag) {
      Logger.debug("create tag", itemId, tag);
      IndexedDbKits.insertNewTag(itemId, tag);
    },
    removeTagOfItem(itemId, tag) {
      Logger.debug("remove tag", itemId, tag);
      IndexedDbKits.removeTagByItemId(itemId, tag);
    },
    changeFilterTag(tag) {
      this.filter.tag = tag;
    },
    loadPage() {
      Logger.debug(this);
      NProgress.start();
      this.pageIndex += 1;
      Logger.debug("load page", this.pageIndex, this.pageSize);
      chromeKits
        .getBookmarksWithPage(this.pageIndex, this.pageSize, this.sort)
        .then((bookmarks) => {
          this.bookmarksPageList = [...this.bookmarksPageList, ...bookmarks];
          NProgress.done();
        });
    },
    loadPageWithTag(tagText) {
      NProgress.start();
      chromeKits
        .getBookmarksWithTag(tagText)
        .then((bookmarks) => {
          Logger.debug("bookmarks", tagText, bookmarks);
          this.bookmarksPageList = bookmarks.sort(this.bookmarksSortFunc);
          NProgress.done();
        })
        .catch((error) => {
          Logger.error(error);
          NProgress.done();
        });
    },
    loadPageWithNoTag() {
      NProgress.start();
      chromeKits.getAllBookmarksWithTag(this.sort).then((bookmarks) => {
        bookmarks = bookmarks.filter((item) => {
          return !item.tags || item.tags.length === 0;
        });
        Logger.debug("bookmarks", bookmarks);
        const total = bookmarks.length;
        this.bookmarksPageList = bookmarks.slice(0, this.pageSize);
        this.alert.show = true;
        this.alert.message = `提示： 共 ${total} 条，当前只显示 0 ~ ${this.pageSize} 条`;
        NProgress.done();
      });
    },
    registLoadPageEvent() {
      // const scrollTop =
      //   document.documentElement.scrollTop || document.body.scrollTop;
      const scrollTop = document.querySelector("#app").scrollTop
      const clientHeight = document.documentElement.clientHeight;
      const scrlllHeight = document.querySelector("#app").scrollHeight;
      Logger.debug("scroll", scrollTop, clientHeight, scrlllHeight);
      if (scrollTop + clientHeight + 200 >= scrlllHeight) {
        Logger.debug("can load page");
        if (this.bookmarksPageList.length > 0 && this.canLoad) {
          if (!this.searchText && !this.searchTextIsTag() && !this.searchTextIsNoTag()) {
            Logger.debug("load page");
            this.loadPage();
            this.canLoad = false;
            setTimeout(() => {
              this.canLoad = true;
            }, 2000);
          }
        }
      }
    },
    getIndexedDbHandler() {
      const self = this;
      const indexedDb =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB;
      if (!indexedDb) {
        Logger.warn(
          "Your browser doesn't support a stable version of IndexedDB."
        );
        return;
      }
      const request = indexedDb.open("BookmarkDashboardDb", 1);
      request.onerror = function (event) {
        Logger.error("indexedDb error", event);
      };
      request.onsuccess = function (event) {
        Logger.debug("indexedDb success", event);
        self.dbInstence = event.target.result;
        self.loadTagsOfBookmarkItem();
      };
      request.onupgradeneeded = function (event) {
        const db = event.target.result;
        // table tags
        if (!db.objectStoreNames.contains("tagTable")) {
          const store = db.createObjectStore("tagTable", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("itemId", "itemId", { unique: false });
          store.createIndex("tag", "tag", { unique: false });
        }

        // table types
        if (!db.objectStoreNames.contains("categoryTable")) {
          db.createObjectStore("categoryTable", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };
    },
    getStore() {
      const transaction = this.dbInstence.transaction("tagTable", "readwrite");
      const store = transaction.objectStore("tagTable");
      return store;
    },
    loadTagsOfBookmarkItem() {
      const self = this;
      this.bookmarksPageList.forEach((item) => {
        const itemId = item.id;
        const store = self.getStore();
        store.index("itemId").getAll(itemId).onsuccess = function (event) {
          const result = event.target.result;
          if (result.length > 0) {
            item.tags = result.map((item) => item.tag);
          }
          // console.log("result",result);
        };
      });
    },
    onSortChange(e) {
      Logger.debug("sort change", e);
      this.sort = e.key;
      this.sortKeys[0] = e.key;
      // this.initPageInfo();
      // this.loadPage();
      this.onSearchSubmit();
    },
    loadDirsPage() {
      this.dir.pageIndex += 1;
      chromeKits
        .getDirsWithPage(this.dir.pageIndex, this.dir.pageSize)
        .then((dirs) => {
          this.bookmarksDirs = dirs;
        });
    },
    selectFilterDir(dirId) {
      this.filter.dirId = dirId;
      // this.initPageInfo();
      // this.loadPage();
    },
    loadCachedNewBookmarks() {
      IndexedDbKits.readNewBookmarksCache("newBookmarkList").then(
        (bookmarks) => {
          Logger.debug("load cached new bookmarks", bookmarks);
          if (
            bookmarks.newBookmarkList &&
            bookmarks.newBookmarkList.list &&
            bookmarks.newBookmarkList.list.length > 0
          ) {
            const key = `open${Date.now()}`;
            this.$notification.open({
              message: "新增书签提醒",
              description:
                "你新增了书签，赶紧给书签添加合适的标签吧，这样你以后就能快速查找到这个书签了",
              duration: 0,
              placement: "topRight",
              key,
              onClose: () => {
                this.$refs.newbookmarkdrawer.onOpen();
                Logger.debug("close notification");
              },
              onClick: () => {
                this.$notification.close(key);
                this.$refs.newbookmarkdrawer.onOpen();
                Logger.debug("click notification");
              },
            });
          }
        }
      );
    },
    initThemeModel() {
      this.isDarkModel = ThemeKits.isDarkTheme();
      // set html style background
      if (this.isDardModel) {
        document.body.style.background = "#1c1c1c";
      } else {
        document.body.style.background = "#fafafa";
      }
    },
  },
  created() {
    this.initThemeModel();
    this.loadPage();
    this.loadDirsPage();
    this.loadCachedNewBookmarks();
  },
  mounted() {
    this.initPageInfo();
    // window.addEventListener("scroll", this.registLoadPageEvent);
    document.querySelector("#app").addEventListener("scroll", this.registLoadPageEvent);
  },
  unmounted() {
    window.removeEventListener("scroll", this.registLoadPageEvent, false);
    document.querySelector("#app").removeEventListener("scroll", this.registLoadPageEvent, false);
  },
};
</script>
<style>
.ant-select-selection-item,
.ant-select-item-option-content,
.ant-radio-button-wrapper,
.ant-btn {
  font-family: "仿宋", "Courier New", Courier, monospace;
}
.bookmark-wapper {
  height: 100%;
}
.bookmark-wapper .bookmark-content-wrapper {
  /* 宽度70%， 居中，高度 200 颜色红色 */
  width: 70%;
  margin: 0 auto;
  height: 200px;
  /* background-color: red; */
  min-width: 600px;
}

.bookmark-wapper .bookmark-content-wrapper .header {
  padding: 40px 0 0 0;
  /* padding-bottom: 20px; */
  text-align: center;
}

.bookmark-wapper .bookmark-content-wrapper .header .search-box {
  font-size: 15px;
  letter-spacing: 0.07em;
  border: 0;
  color: rgb(79, 82, 85);
  border-radius: 10px;
  line-height: 35px;
  padding: 5px 20px;
  width: 420px;
  outline: none;
  padding-left: 50px;
  z-index: 1;
}

.search-box-wrapper {
  display: inline-block;
  position: relative;
  box-shadow: 0px 8px 20px rgb(0 0 0 / 6%);
  font-family: "仿宋", "Courier New", Courier, monospace;
}

.search-before-icon {
  position: absolute;
  left: 20px;
  top: 16px;
}

.bookmarks-items-wrapper {
  text-align: center;
}

.quickselect-wrapper {
  padding: 20px 0 0 0;
  padding-bottom: 0;
}

.quickselect-panel {
  text-align: left;
  position: relative;
  padding: 10px;
}
.search-message {
  padding: 10px 0 0 0;
  text-align: center;
  color: #ee624f;
  font-family: "仿宋", "Courier New", Courier, monospace;
}
.quickselect-panel > .left {
  display: inline-block;
  width: 200px;
  /* position: absolute; */
  /* left: 0;
  top: 20px; */
}

.quickselect-panel > .center {
  display: inline-block;
  padding-left: 20px;
}

.quickselect-panel .right-action {
  position: absolute;
  right: 0;
  top: 20px;
}
.quickselect-panel > .right {
  display: block;
  text-align: center;
  padding: 20px 250px;
}

.quickselect-panel > .right > .tag-wrapper {
  font-size: 16px;
  font-family: "仿宋", "Courier New", Courier, monospace;
  padding: 5px 10px;
  cursor: pointer;
  margin: 10px 10px;
  border-radius: 6px;
  transition: 0.2s;
}

.quickselect-panel > .right > .tag-wrapper.activate {
  background-color: rgb(162, 202, 253);
}

.tag-more-btn {
  color: rgb(15, 165, 235);
  display: inline-block;
  background-color: #000;
}

.menu-actove {
  color: rgb(116, 173, 248) !important;
}

.quickselect-bookmark-dir {
  display: inline-block;
  font-size: 14px;
  font-family: "仿宋", "Courier New", Courier, monospace;
  padding: 3px 6px;
  cursor: pointer;
  margin: 10px 10px;
  border-radius: 6px;
  transition: 0.2s;
  font-weight: bold;
}

.quickselect-bookmark-dir.activate {
  background-color: #1890ff;
  color: #fff;
}

.quickselect-bookmark-dir-left-action,
.quickselect-bookmark-dir-right-action {
  color: #1890ff;
  padding: 3px 3px;
  cursor: pointer;
}
.quickselect-bookmark-dir-container {
  display: inline-block;
  padding: 10px;
  min-width: 800px;
  overflow: initial;
}

.bookmark-dark {
  /* background-color: rgb(78, 83, 87) !important;
  color: rgb(227, 233, 238) !important; */
}

.bookmark-dark .search-box,
.bookmark-dark .search-before-icon {
  background-color: rgb(78, 83, 87) !important;
  color: rgb(234, 239, 243) !important;
}

.bookmark-dark button {
  background-color: rgb(78, 83, 87) !important;
  color: rgb(234, 239, 243) !important;
  border: 0;
}

.bookmark-dark .bookmark-card-wrapper {
  background-color: rgb(78, 83, 87) !important;
  color: rgb(234, 239, 243) !important;
}

.bookmark-dark .bookmark-card-wrapper .bookmark-card-wrapper-title {
  color: rgb(234, 239, 243) !important;
}

.bookmark-dark .bookmark-card-wrapper .bookmark-card-wrapper-title a {
  color: rgb(234, 239, 243) !important;
}

.bookmark-dark .bookmark-card-wrapper .ant-breadcrumb {
  color: rgb(234, 239, 243) !important;
}

.bookmark-dark .bookmark-card-wrapper .ant-breadcrumb span {
  color: rgb(234, 239, 243) !important;
}

.bookmark-dark .bookmark-card-wrapper .ant-tag,
.bookmark-dark .bookmark-card-wrapper input {
  background-color: rgb(93, 99, 105) !important;
  color: rgb(234, 239, 243) !important;
  border: 0;
}
</style>