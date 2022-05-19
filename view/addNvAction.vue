<template>
  <div v-show="success" class="add-nv-action-wrapper-message">
    <div class="icon">
      <smile-outlined/>
    </div>
    <div class="msg">
      {{message}}
    </div>
  </div>
  <div v-if="!success" class="add-nv-action-wrapper">
    <p>
      <strong> <compass-outlined /> 添加导航</strong>
    </p>
    <p>
      <NewNavigationForm ref="nvForm" :info="tabInfo" @onChange="onNavigationFormChange" />
    </p>
    <p>
      <a-button :disabled="!canSubmit" type="primary" @click="saveNavigation">保存</a-button>
    </p>
  </div>
</template>
<script>
import Logger from "@/utils/Logger";
import {CompassOutlined,SmileOutlined} from "@ant-design/icons-vue";
import NewNavigationForm from "@/components/NewNavigationForm.vue";
import IndexedDbKits from '@/utils/IndexedDbKits';
export default {
  components: {
    CompassOutlined,
    NewNavigationForm,
    SmileOutlined
  },
  data() {
    return {
      success: false,
      message: "恭喜，已经将该页面成功添加至导航！继续你的冲浪之旅吧！",
      canSubmit: false,
      tabInfo: {
        title: "",
        url: "",
        type: "未分类",
        showFlag: ["everyday"],
      },
    };
  },
  methods: {
    saveNavigation() {
      const data = this.$refs.nvForm.getFormData()
      Logger.debug("saveNavigation", data);
      IndexedDbKits.insertNewNavigation({
        title: data.title,
        url: data.url,
        category: data.type,
        showFlag: data.showFlag.join(","),
      })
        .then(() => {
          Logger.debug("saveNavigation success");
        })
        .catch((e) => {
          Logger.error("saveNavigation error",e);
        }).finally(() => {
          Logger.debug("saveNavigation finally",chrome.action);
          this.message = "恭喜，已经将该页面成功添加至导航！继续你的冲浪之旅吧！";
          this.success = true;
        });
    },
    onNavigationFormChange(data) {
      this.tabInfo.title = data.title;
      this.tabInfo.url = data.url;
      this.tabInfo.type = data.category;
      if (data.title && data.url && data.category && data.showFlag ) {
        this.canSubmit = true;
      }else {
        this.canSubmit = false;
      }
    },
    loadTabInfo() {
      this.debugInfo = chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          Logger.debug("tabs",tabs);
          const currentTab = tabs[0];
          this.tabInfo.title = currentTab.title;
          this.tabInfo.url = currentTab.url;
          this.checkNavigationExist();
        }
      );
    },
    checkNavigationExist() {
      IndexedDbKits.listNacigationsByUrl(this.tabInfo.url)
        .then((res) => {
          Logger.debug("checkNavigationExist",res);
          if (res && res.length > 0) {
            this.message = "这个页面已经在你的导航列表中啦！";
            this.success = true;
          }
        })
        .catch((e) => {
          Logger.error("checkNavigationExist error",e);
        });
    },
  },
  mounted() {
    this.loadTabInfo();
  },
};
</script>
<style>
body,
html {
  height: 100%;
  padding: 0px;
  margin: 0px;
}
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  width: 400px;
}
.add-nv-action-wrapper {
  padding: 10px 20px;
}
.add-nv-action-wrapper-message {
  padding: 30px 60px 60px 60px;
  transition: .2s;
}

.add-nv-action-wrapper-message > .icon {
  font-size: 50px;
  color: #eb2f96;
  text-align: center;
}

.add-nv-action-wrapper-message > .msg {
  text-align: center;
}
</style>