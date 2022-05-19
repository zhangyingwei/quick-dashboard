<template>
  <div ref="bookmarkDashboardWrapper" class="bookmark-dashboard-wrapper">
    <div ref="mutiSwitchAction" class="muti-switch-action">
      <div
        @click="changeMenu('clock')"
        :class="{
          action: true,
          active: showPanel === 'clock',
          darkmodel: isDarkTheme,
        }"
      >
        <clock-circle-outlined />
        时钟
      </div>
      <!-- <div class="action span"></div> -->
      <div
        @click="changeMenu('bookmark')"
        :class="{
          action: true,
          active: showPanel === 'bookmark',
          darkmodel: isDarkTheme,
        }"
      >
        <book-outlined />
        书签
      </div>
      <!-- <div class="action span"></div> -->
      <div
        @click="changeMenu('navigation')"
        :class="{
          action: true,
          active: showPanel === 'navigation',
          darkmodel: isDarkTheme,
        }"
      >
        <environment-outlined />导航
      </div>
    </div>
    <!-- <a-dropdown :trigger="['click']">
      <div class="bookmark-settings">
        <setting-outlined />
      </div>
      <template #overlay>
        <a-menu>
          <a-menu-item :class="{ 'bookmark-settings-item-active': showPanel=='clock'}" key="0" @click="changeMenu('clock')" >
            <clock-circle-outlined /> 翻页时钟
          </a-menu-item>
          <a-menu-item :class="{ 'bookmark-settings-item-active': showPanel=='bookmark'}" key="1" @click="changeMenu('bookmark')" >
            <container-outlined /> 书签面板
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown> -->

    <chrome-history />
    <ChromeClock v-if="showPanel == 'clock'" />
    <BookmarkPanel v-if="showPanel == 'bookmark'" />
    <ChromeNavigation v-if="showPanel == 'navigation'" />
  </div>
</template>
<script>
import ChromeHistory from "./ChromeHistory.vue";
import ChromeClock from "./ChromeClock.vue";
import BookmarkPanel from "./BookmarkPanel.vue";
import ChromeNavigation from "./ChromeNavigation.vue";
import {
  ClockCircleOutlined,
  BookOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons-vue";
import ThemeKits from "@/utils/ThemeKits.js";

export default {
  components: {
    ChromeHistory,
    ChromeClock,
    // SettingOutlined,
    ClockCircleOutlined,
    // ContainerOutlined,
    BookmarkPanel,
    BookOutlined,
    EnvironmentOutlined,
    ChromeNavigation,
  },
  data() {
    return {
      showPanel: "",
      isDarkTheme: false,
    };
  },
  methods: {
    changeMenu(type) {
      this.showPanel = type;
      // save to localStorage
      localStorage.setItem("bookmark-dashboard-panel", type);
    },
    loadMenu() {
      const panel = localStorage.getItem("bookmark-dashboard-panel");
      if (panel) {
        this.showPanel = panel;
      } else {
        this.showPanel = "clock";
      }
    },
    initBackgroundColor() {
      this.isDarkTheme = ThemeKits.isDarkTheme();
      if (ThemeKits.isDarkTheme()) {
        this.$refs.bookmarkDashboardWrapper.style.backgroundColor = "#26282B";
        document.querySelector("div#app").style.backgroundColor = "#26282B";
      }
    },
  },
  mounted() {
    this.initBackgroundColor();
    this.loadMenu();
  },
};
</script>
<style>
body,
html {
  height: 100%;
  padding: 0px;
  margin: 0px;
  background-color: #f1f6f8 !important;
  /* background-color: #26282B !important; */
}
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  display: block;
  overflow: auto;
}
.bookmark-dashboard-wrapper {
  height: 100%;
}
.bookmark-settings {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px;
  cursor: pointer;
}

.bookmark-settings-item-active {
  color: rgb(26, 125, 238) !important;
}

.muti-switch-action {
  padding: 2px;
  border: 2px solid #979ea04f;
  display: inline-block;
  border-radius: 10px;
  position: absolute;
  left: 20px;
  top: 10px;
  font-family: "仿宋", "Courier New", Courier, monospace;
}
.muti-switch-action > .action {
  display: inline-block;
  cursor: pointer;
  color: #333;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  vertical-align: bottom;
  border-radius: 6px;
  padding: 0 8px;
}

.muti-switch-action > .action.darkmodel {
  color: rgb(208, 219, 228) !important;
}

.muti-switch-action > .action.active {
  background-color: rgb(227, 233, 238);
}
.muti-switch-action > .action.active.darkmodel {
  background-color: rgb(78, 83, 87);
}
.muti-switch-action > .action.span {
  display: inline-block;
  width: 10px;
}
</style>