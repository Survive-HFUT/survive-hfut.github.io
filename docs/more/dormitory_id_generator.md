# 宣区宿舍缴费编号生成器

<script setup>
import DormitoryIdGenerator from '../.vitepress/theme/components/DormitoryIdGenerator.vue'
import { ref } from 'vue'

const g = ref({});
</script>

<DormitoryIdGenerator ref="g" />

## 输出

```txt-vue
{{g.id||'-'}}
```
