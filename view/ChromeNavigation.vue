<template>
  <div class="navigation-wrapper" :class="{ 'navigation-dark': isDarkModel }">
    <div class="search-wrapper">
      <a-input-group compact size="large">
        <a-select size="large" style="width: 100px" v-model:value="searchEngin" :dropdownClassName="isDarkModel?'navigation-dark':''">
          <a-select-option value="baidu">百度</a-select-option>
          <a-select-option value="google">Google</a-select-option>
        </a-select>
        <a-input
          ref="searchInput"
          v-model:value="searchText"
          style="width: 500px; text-align: left"
          @pressEnter="onSearch"
          autofocus
        />
        <a-button size="large" type="primary" @click="onSearch">搜索</a-button>
      </a-input-group>
    </div>
    <div class="navigation-panel-wrapper">
      <div class="navigation-panel">
        <div class="navigation-panel-switchmenu">
          <span
            @click="changeTab('all')"
            :class="{ active: activeTab == 'all' }"
            >全部导航</span
          >
          <span
            @click="changeTab('today')"
            :class="{ active: activeTab == 'today' }"
            >今日导航</span
          >
          <!-- TODO 今日导航尚未实现 -->
        </div>
        <div class="navigation-panel-content">
          <a-card class="card" size="small">
            <template #title>
              <strong> <alert-filled /> 未分类</strong>
            </template>
            <template #extra>
              <span class="navigation-panel-action" @click="addNav('未分类')">
                <PlusOutlined /> 添加导航</span
              >
            </template>
            <a-card-grid
              v-for="info in noCategoryMavs"
              :key="info.id"
              :bordered="false"
              style="width: 25%; padding: 10px; background-color: none"
            >
              <NavigationCard
                :info="{
                  id: info.id,
                  title: info.title,
                  url: info.url,
                  category: info.category,
                  showFlag: info.showFlag,
                }"
                @refresh="loadAllNavs"
                @option="clickCardOption"
              />
            </a-card-grid>
          </a-card>

          <a-card
            class="card"
            size="small"
            v-for="category in allCategory"
            :key="category"
          >
            <template #title>
              <strong> <alert-filled /> {{ category }}</strong>
            </template>
            <template #extra>
              <span class="navigation-panel-action" @click="addNav(category)">
                <PlusOutlined /> 添加导航</span
              >
            </template>
            <a-card-grid
              v-for="info in navCategoryMap[category]"
              :key="info.id"
              :bordered="false"
              style="width: 25%; padding: 10px; background-color: none"
            >
              <NavigationCard
                :info="{
                  id: info.id,
                  title: info.title,
                  url: info.url,
                  category: info.category,
                  showFlag: info.showFlag,
                }"
                @refresh="loadAllNavs"
                @option="clickCardOption"
              />
            </a-card-grid>
          </a-card>
        </div>
      </div>
    </div>

    <a-modal
      v-model:visible="addNewNav.show"
      title="添加网址"
      ok-text="确认"
      :class="{ 'modal-dark': isDarkModel }"
      destroy-on-close
      cancel-text="取消"
      :ok-button-props="{
        disabled:
          addNewNav.title && addNewNav.url && addNewNav.type ? false : true,
      }"
      @ok="submitNewNav"
    >
      <NewNavigationForm
        ref="newNvForm"
        :info="addNewNav"
        @onChange="onNavigationFormChange"
      />
    </a-modal>

    <a-modal
      v-model:visible="cardOption.show"
      :destroyOnClose="true"
      size="small"
      title="选项"
      ok-text="确认"
      cancel-text="取消"
      @ok="submitCardOption"
    >
      <NavCardOption ref="optNvForm" :info="cardOption.info" />
    </a-modal>
  </div>
</template>
<script>
import { PlusOutlined, AlertFilled } from "@ant-design/icons-vue";
import NavigationCard from "./NavigationCard";
import Logger from "@/utils/Logger";
import IndexedDbKits from "@/utils/IndexedDbKits";
import NProgress from "nprogress";
import NavCardOption from "@/components/NavCardOption";
import NewNavigationForm from "@/components/NewNavigationForm.vue";
import ThemeKits from "@/utils/ThemeKits";

export default {
  name: "ChromeNavigation",
  components: {
    PlusOutlined,
    AlertFilled,
    NavigationCard,
    NavCardOption,
    NewNavigationForm,
  },
  data() {
    return {
      activeTab: "all",
      searchText: "",
      searchEngin: "baidu",
      addNewNav: {
        show: false,
        title: "",
        url: "",
        type: undefined,
        showFlag: ["everyday"],
      },
      categoryOptions: [
        {
          value: "无分类",
        },
      ],
      allCategory: [],
      navCategoryMap: {},
      noCategoryMavs: [],
      cardOption: {
        show: false,
        info: {},
      },
      isDarkModel: false,
    };
  },
  methods: {
    changeTab(name) {
      this.activeTab = name;
      this.loadAllNavs();
      // save active tab into local storage
      localStorage.setItem("activeTab", name);
    },
    submitCardOption() {
      const data = this.$refs.optNvForm.getFormData();
      Logger.debug("submitCardOption-before", data);
      data.id = this.cardOption.info.id;
      data.category = data.type;
      data.showFlag = data.showFlag.join(",");
      Logger.debug("submitCardOption-after", data);
      IndexedDbKits.updateNavigationById(this.cardOption.info.id, data)
        .then(() => {
          this.loadAllNavs();
        })
        .catch((e) => {
          Logger.debug("更新失败", e);
        })
        .finally(() => {
          this.cardOption.show = false;
        });
    },
    onNavigationFormChange(data) {
      this.addNewNav.title = data.title;
      this.addNewNav.url = data.url;
      this.addNewNav.type = data.category;
    },
    clickCardOption(card) {
      Logger.debug("clickCardOption", card);
      this.cardOption.info = card;
      this.cardOption.show = true;
    },
    onCategoryFocus() {
      this.categoryOptions = this.allCategory.map((item) => {
        return {
          value: item,
        };
      });
    },
    onSearch() {
      if (!this.searchText) {
        return;
      }
      if (this.searchEngin === "baidu") {
        window.open(`https://www.baidu.com/s?wd=${this.searchText}`, "_self");
      } else if (this.searchEngin === "google") {
        window.open(
          `https://www.google.com/search?q=${this.searchText}`,
          "_self"
        );
      }
    },
    addNav(category) {
      Logger.debug("addNav", category);
      this.addNewNav.type = category;
      this.addNewNav.show = true;
    },
    submitNewNav() {
      Logger.debug("submitNewNav", this.addNewNav);
      NProgress.start();
      const data = this.$refs.newNvForm.getFormData();
      IndexedDbKits.listNacigationsByUrl(data.url)
        .then((res) => {
          if (res && res.length > 0) {
            NProgress.done();
            this.$message.error("该网址已存在");
            return;
          }
          IndexedDbKits.insertNewNavigation({
            title: data.title,
            url: data.url,
            category: data.type,
            showFlag: data.showFlag.join(","),
          })
            .then(() => {
              this.addNewNav.show = false;
              this.addNewNav.title = "";
              this.addNewNav.url = "";
              this.addNewNav.type = undefined;
              this.loadAllNavs();
              NProgress.done();
            })
            .catch(() => {
              NProgress.done();
            });
        })
        .catch((err) => {
          Logger.error(err);
        })
        .finally(() => {
          NProgress.done();
        });
    },
    tabFilter(item) {
      Logger.debug("loadCategory-item-filter", item);
      const currentDay = new Date().getDate() + "";
      const currentWeek = new Date().getDay() + "";
      if (this.activeTab === "all") {
        Logger.debug("loadCategory-item-filter-all");
        return true;
      }
      if (item.showFlag === undefined || item.showFlag === "everyday") {
        return true;
      } else {
        const flags = item.showFlag.split(",");
        if (flags.includes("everymonth")) {
          Logger.debug(
            "loadCategory-item-filter-flags",
            flags,
            flags[1] === currentDay
          );
          return flags[1] === currentDay;
        } else if (flags.includes("everyweek")) {
          Logger.debug(
            "loadCategory-item-filter-flags",
            flags,
            flags[1] === currentWeek
          );
          return flags[1] === currentWeek;
        }
      }
      return false;
    },
    loadAllNavs() {
      IndexedDbKits.listAllNavs().then((res) => {
        Logger.debug("loadCategory", res);
        this.allCategory = [];
        this.navCategoryMap = {};
        this.noCategoryMavs = [];
        res
          .filter((item) => this.tabFilter(item))
          .forEach((item) => {
            if (item.showFlag) {
              item.showFlag = item.showFlag.split(",");
            } else {
              item.showFlag = ["everyday"];
            }
            if (!this.navCategoryMap[item.category]) {
              this.navCategoryMap[item.category] = [];
              if (item.category !== "未分类") {
                this.allCategory.push(item.category);
              }
            }
            if (item.category === "未分类") {
              this.noCategoryMavs.push(item);
            }
            this.navCategoryMap[item.category].push(item);
          });

        Logger.debug("loadCategory all", this.allCategory);
        Logger.debug("loadCategory map", this.navCategoryMap);
        Logger.debug("loadCategory no", this.noCategoryMavs);
      });
    },
    initThemeModel() {
      this.isDarkModel = ThemeKits.isDarkTheme();
    },
  },
  mounted() {
    this.initThemeModel();
    // load active tab from local stroage
    this.activeTab = localStorage.getItem("activeTab") || "all";
    this.loadAllNavs();
    this.$refs.searchInput.focus();
  },
};
</script>
<style>
.navigation-wrapper .search-wrapper {
  text-align: center;
  padding: 100px 0 20px 0;
  font-family: "仿宋", "Courier New", Courier, monospace;
}

.navigation-panel-wrapper {
  text-align: center;
  padding-top: 20px;
}
.navigation-panel-wrapper .navigation-panel {
  width: 1000px;
  display: inline-block;
}
.navigation-panel-switchmenu {
  font-size: 15px;
  font-family: "仿宋", "Courier New", Courier, monospace;
  text-align: left;
  padding-bottom: 10px;
}

.navigation-panel-switchmenu > span {
  padding: 0 10px;
  cursor: pointer;
  color: rgb(103, 124, 139);
}
.navigation-panel-switchmenu > span.active {
  font-weight: bold;
  color: #000;
}
.navigation-panel-content {
  font-family: "仿宋", "Courier New", Courier, monospace;
  text-align: left;
}
.navigation-panel-content .card {
  margin-bottom: 20px;
}
.navigation-panel-content .ant-card-head {
  padding-left: 10px;
}
.navigation-panel-action {
  cursor: pointer;
  color: rgb(33, 161, 247);
}

.ant-modal-header {
  padding: 8px 24px !important;
}
.ant-modal-close .ant-modal-close-x {
  width: 39px;
  height: 39px;
}
.ant-modal-close .ant-modal-close-x .anticon {
  vertical-align: 0.4em;
}

.ant-card-head-wrapper .navigation-panel-action {
  display: none;
  transition: 0.2s !important;
}

.ant-card-head-wrapper:hover .navigation-panel-action {
  display: block;
}

.navigation-dark input,
.navigation-dark button {
  background-color: rgb(78, 83, 87) !important;
  color: rgb(234, 239, 243) !important;
  border: 0;
  height: 40px;
}
.navigation-dark button {
  border-left: 0.5px solid rgba(234, 239, 243, 0.068) !important;
}

.navigation-dark .ant-select-selector {
  background-color: rgb(78, 83, 87) !important;
  color: rgb(234, 239, 243) !important;
  border: 0 !important;
  border-right: 0.5px solid rgba(234, 239, 243, 0.192) !important;
}

.navigation-dark .navigation-panel-switchmenu {
  color: rgb(234, 239, 243) !important;
}

.navigation-dark .navigation-panel-switchmenu > .active {
  color: rgb(234, 239, 243) !important;
}

.navigation-dark .ant-card,
.navigation-dark .ant-card-grid {
  background-color: rgb(78, 83, 87) !important;
  color: rgb(234, 239, 243) !important;
  border-color: rgb(110, 115, 119) !important;
  box-shadow: 1px 0 0 0 rgb(92, 97, 100), 0 1px 0 0 rgb(92, 97, 100),
    1px 1px 0 0 rgb(92, 97, 100), 1px 0 0 0 rgb(92, 97, 100) inset,
    0 1px 0 0 rgb(92, 97, 100) inset !important;
}

.navigation-dark .ant-card,
.navigation-dark .ant-card-grid-hoverable:hover {
  position: relative;
  z-index: 1;
  box-shadow: 0 1px 2px -2px rgb(0 0 0 / 16%), 0 3px 6px 0 rgb(0 0 0 / 12%),
    0 5px 12px 4px rgb(0 0 0 / 9%) !important;
}

.navigation-dark .ant-card .ant-card-head {
  border-color: rgb(92, 97, 100) !important;
}

.navigation-dark .ant-card-head-title {
  color: rgb(234, 239, 243) !important;
}

.navigation-dark .ant-dropdown-content .ant-dropdown-menu {
  background-color: rgb(105, 111, 116) !important;
  color: rgb(234, 239, 243) !important;
}

.navigation-dark.ant-select-dropdown {
  background-color: rgb(115, 122, 128) !important;
  color: rgb(234, 239, 243) !important;
}

.navigation-dark .ant-select-item-option-active {
  background-color: rgb(115, 122, 128) !important;
  color: rgb(234, 239, 243) !important;
}

.navigation-dark .ant-select-item-option {
  color: rgb(234, 239, 243) !important;
}

.navigation-dark .ant-select-item-option:hover {
  background-color: rgb(100, 107, 112) !important;
  color: rgb(234, 239, 243) !important;
}

/* .navigation-dark.ant-select-dropdown:hover {
  background-color: rgb(100, 107, 112) !important;
  color: rgb(234, 239, 243) !important;
} */

.navigation-dark .ant-select-item-option-selected {
  background-color: rgb(90, 94, 99) !important;
}

.navigation-dark .ant-dropdown-content .ant-dropdown-menu-item:hover {
  background-color: rgb(87, 92, 95) !important;
}

.navigation-dark .ant-dropdown-content .ant-dropdown-menu-title-content {
  color: rgb(234, 239, 243) !important;
}

.navigation-dark .ant-dropdown-menu-item-selected {
  background-color: rgb(90, 94, 99) !important;
  color: rgb(234, 239, 243) !important;
}

.modal-dark {
  /* background-color: rgb(57, 61, 65) !important; */
  color: rgb(234, 239, 243) !important;
}

.modal-dark .ant-modal-content {
  background-color: rgb(57, 61, 65) !important;
  color: rgb(234, 239, 243) !important;
}

.modal-dark .ant-modal-header,
.modal-dark .ant-modal-header .ant-modal-title {
  background-color: rgb(57, 61, 65) !important;
  color: rgb(234, 239, 243) !important;
  border-color: rgb(92, 97, 100) !important;
}

.modal-dark .ant-modal-close-icon {
  color: rgb(234, 239, 243) !important;
}

.modal-dark .ant-modal-footer {
  border-color: rgb(92, 97, 100) !important;
}
.modal-dark .ant-modal-footer button {
  background-color: rgb(79, 84, 88) !important;
  color: rgb(234, 239, 243) !important;
  border: 0 !important;
}
.modal-dark .ant-modal-footer button:disabled {
  color: rgb(140, 159, 172) !important;
}
</style>