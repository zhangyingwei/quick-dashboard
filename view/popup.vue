<template>
  <div class="main-app-wrapper" :class="{ 'mainapp-dark': isDarkModel }">
    <div class="main_app">
      <div class="header-title">设置</div>
      <a-form :model="formData">
        <a-form-item label="切换主题">
          <a-switch
            v-model:checked="formData.checked"
            @change="changeThemeModel"
          />
          <span v-if="!isDarkModel" class="model-title">明亮主题</span>
          <span v-else class="model-title">黑暗主题</span>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>
import ThemeKits from "@/utils/ThemeKits";
export default {
  name: "popupView",
  data() {
    return {
      msg: "敬请期待...",
      formData: {
        checked: false,
      },
      isDarkModel: false,
    };
  },
  methods: {
    changeThemeModel() {
      if (this.formData.checked) {
        ThemeKits.setDarkTheme();
      } else {
        ThemeKits.setLigitTheme();
      }
      this.loadThemeModel();
    },
    loadThemeModel() {
      this.isDarkModel = ThemeKits.isDarkTheme();
      this.formData.checked = this.isDarkModel;
    },
  },
  mounted() {
    this.loadThemeModel();
  },
};
</script>

<style>
html,
body {
  height: 100%;
}
#app {
  height: 100%;
}
.main-app-wrapper {
  width: 100%;
  height: 100%;
  background-color: #f1f6f8;
}
.main-app-wrapper .model-title {
  line-height: 24px;
  vertical-align: top;
  padding-left: 10px;
  font-size: 13px;
}
.mainapp-dark {
  background-color: #26282b !important;
  color: rgb(227, 233, 238) !important;
}
.main_app {
  margin: 0 auto;
  height: 100%;
  width: 800px;
}

.main_app .header-title {
  font-size: 30px;
  font-weight: bold;
  padding: 20px 0 20px 0;
}

.mainapp-dark .ant-form-item-label > label {
  color: rgb(227, 233, 238) !important;
}

.mainapp-dark .model-title {
  color: rgb(227, 233, 238) !important;
}
</style>
