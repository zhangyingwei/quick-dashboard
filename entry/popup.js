import { createApp } from 'vue'
import Antd from 'ant-design-vue';
import App from '../view/popup.vue'
import 'ant-design-vue/dist/antd.css';

const app = createApp(App);
app.use(Antd).mount('#app');
