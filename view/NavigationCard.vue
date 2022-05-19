<template>
  <div class="navigation-card-container">
    <span class="item icon">
      <a-avatar size="small" :src="info.url + '/favicon.ico'" style="background-color: #3093F0" >
        {{info.title.substring(0,1)}}
      </a-avatar>
    </span>
    <span class="item title" @click="openUrl" :title="info.title">{{ info.title }}</span>
    <span class="item action">
      <a-dropdown :overlayClassName="isDarkModel?'navigation-dark':''">
        <more-outlined />
        <template #overlay>
          <a-menu>
            <a-menu-item :key="0" @click="clickOption">
              <span class="ncard-dropdown-item option">选项</span>
            </a-menu-item>
            <!-- TODO 选项功能尚未实现，需要设置每个导航的展示时间,比如: 默认每天，每周X，每月X日 -->
            <a-menu-item @click="deleteNav" :key="1">
              <span class="ncard-dropdown-item delete">删除</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </span>
  </div>
</template>
<script>
import { MoreOutlined } from "@ant-design/icons-vue";
import IndexedDbKits from '@/utils/IndexedDbKits';
import Logger from '@/utils/Logger';
import ThemeKits from '@/utils/ThemeKits';
export default {
  props: {
    info: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isDarkModel: false,
    }
  },
  components: {
    MoreOutlined,
  },
  methods: {
    clickOption() {
      Logger.debug('clickOption', this.info);
      this.$emit('option', this.info);
    },
    openUrl() {
      window.open(this.info.url,"_blank");
    },
    deleteNav() {
      Logger.debug("deleteNav", this.info);
      IndexedDbKits.deleteNavById(this.info.id).then(() => {
        this.$emit("refresh");
      });
    }
  },
  mounted() {
    this.isDarkModel = ThemeKits.isDarkTheme()
  }
};
</script>
<style>
.navigation-card-container {
}

.navigation-card-container > .item {
  display: inline-block;
  vertical-align: bottom;
}
.navigation-card-container > .item.icon {
  width: 30px;
}

.navigation-card-container > .item.title {
  width: calc(100% - 30px - 20px);
  cursor: default;
  /* 超出长度显示省略号 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navigation-card-container > .item.action {
  width: 20px;
  text-align: right;
  cursor: pointer;
  display: none;
  transition: .2s;
}

.navigation-card-container > .item.action:hover {
  color: rgb(40, 146, 245);
  font-weight: bold;
}

.ncard-dropdown-item {
  font-family: '仿宋','Courier New', Courier, monospace;
  font-size: 14px;
}

.ncard-dropdown-item.option {
  /* color: rgb(103, 124, 139); */
}
.ncard-dropdown-item.delete {
  color: rgb(255, 0, 0);
}
.ant-card-grid:hover .navigation-card-container .item.action {
  display: inline-block;
}
</style>