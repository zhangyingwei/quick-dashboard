<template>
  <div class="history-wrapper">
    <div class="history-btn" :class="{ 'dark': isDarkTheme }" @click="showDrawer">
      <history-outlined />
    </div>
    <a-drawer
      v-model:visible="visible"
      :class="{ 'dark-drawer': isDarkTheme }"
      style="color: red,padding: 0px;"
      title="浏览历史"
      placement="right"
      :closable="false"
    >
      <template #extra>
        <a-input-search
          v-model:value="serachValue"
          placeholder="搜索"
          @change="onSearchChange"
        />
      </template>
      <a-list size="small" :data-source="history">
        <template #header>
          <span class="open-current-page-title">当前页打开 </span>
          <a-switch
            v-model:checked="openCurrentPage"
            checked-children="是"
            un-checked-children="否"
            @change="onOpenCurrentPageChange"
          />
        </template>
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta
              :description="
                '访问次数: ' +
                item.visitCount +
                ' 时间: ' +
                dateFormat(item.lastVisitTime)
              "
            >
              <template #title>
                <a :target="openCurrentPage ? '' : '_blank'" :href="item.url">{{
                  item.title
                }}</a>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-drawer>
  </div>
</template>
<script>
import { HistoryOutlined } from "@ant-design/icons-vue";
import Logger from "@/utils/Logger.js";
import ThemeKits from "@/utils/ThemeKits.js";

export default {
  name: "ChromeHistory",
  components: {
    HistoryOutlined,
  },
  data() {
    return {
      serachValue: "",
      visible: false,
      openCurrentPage: false,
      allHistory: [],
      history: [],
      isDarkTheme: false,
    };
  },
  methods: {
    onSearchChange(e) {
      Logger.debug(e.target.value);
      this.history = this.allHistory.filter((ele) => {
        // 先转成小写，然后查找
        return (
          ele.title.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1
        );
      });
    },
    dateFormat(dateLong) {
      const date = new Date(dateLong);
      return `${date.getFullYear()}/${
        date.getMonth() + 1
      }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    },
    showDrawer() {
      this.loadHistory();
      this.visible = true;
    },
    loadHistory() {
      const self = this;
      chrome.history.search({ text: "" }, (items) => {
        self.allHistory = [];
        items.forEach((ele) => {
          self.allHistory.push(ele);
        });
        self.history = self.allHistory;
      });
    },
    onOpenCurrentPageChange() {
      const status = this.openCurrentPage;
      // save status in storage
      chrome.storage.sync.set({ openCurrentPage: status });
    },
    loadOpenCurrentPageStatusFromStorage() {
      chrome.storage.sync.get(["openCurrentPage"], (result) => {
        this.openCurrentPage = result.openCurrentPage | false;
      });
    },
    initThemeConfig() {
      this.isDarkTheme = ThemeKits.isDarkTheme();
    },
  },
  mounted() {
    this.initThemeConfig();
    this.loadOpenCurrentPageStatusFromStorage();
  },
};
</script>
<style>
.history-wrapper {
  position: relative;
}
.history-wrapper .history-btn {
  background-color: #fff;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  display: inline-block;
  padding: 3px 8px;
  position: absolute;
  right: 0px;
  top: 10px;
  cursor: pointer;
}
.open-current-page-title {
  vertical-align: bottom;
}

.dark {
  background-color: rgb(78, 83, 87) !important;
  color: rgb(227, 233, 238) !important;
}
.dark-drawer .ant-drawer-content,
.dark-drawer .ant-drawer-header {
  border-bottom: 1px solid #6a6a6a !important;
}
.dark-drawer .ant-drawer-content,
.dark-drawer .ant-drawer-header,
.dark-drawer .ant-drawer-title {
  background-color: rgb(78, 83, 87) !important;
  color: rgb(227, 233, 238) !important;
}

.dark-drawer .ant-drawer-wrapper-body {
  background-color: rgb(78, 83, 87) !important;
  color: rgb(227, 233, 238) !important;
}

.dark-drawer .ant-drawer-wrapper-body span,
.dark-drawer .ant-drawer-wrapper-body input,
.dark-drawer .ant-drawer-wrapper-body button {
  background-color: rgb(78, 83, 87) !important;
  color: rgb(227, 233, 238) !important;
  border-color: #6a6a6a !important;
}

.dark-drawer .ant-drawer-wrapper-body button[role="switch"],.dark-drawer .ant-drawer-wrapper-body button[role="switch"] span {
  /* border: 1px solid #939496 !important; */
  background-color: rgb(107, 112, 116) !important;
}

.dark-drawer .ant-drawer-wrapper-body .ant-list-item-meta-title a {
  background-color: rgb(78, 83, 87) !important;
  color: rgb(227, 233, 238) !important;
}

.dark-drawer .ant-drawer-wrapper-body .ant-list-item-meta-description {
  background-color: rgb(78, 83, 87) !important;
  color: rgb(227, 233, 238) !important;
}
.dark-drawer .ant-list-header,
.dark-drawer .ant-list-item {
  border-bottom: 1px solid #6a6a6a !important;
}
</style>