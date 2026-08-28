---
campus: xc
---

# 宿舍缴费编号生成器

:::warning

缴费前务必再三核对。若缴费编号错误，请及时联系宿管或后勤部门进行退款操作

:::

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
