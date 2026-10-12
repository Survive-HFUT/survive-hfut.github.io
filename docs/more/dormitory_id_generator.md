---
campus: xc
---

# 宿舍缴费编号生成器

:::warning

缴费前务必再三核对。若缴费编号错误，请及时联系宿管或后勤部门进行退款操作

:::

## 输入

<script setup>
import DormitoryIdGenerator from '../.vitepress/theme/components/DormitoryIdGenerator.vue'
import { ref } from 'vue'

const g = ref({});
</script>

<DormitoryIdGenerator ref="g" />

:::info

1-5 栋南楼缴费规则：`30xxxxx11`，北楼`30xxxxx21`。6-10 栋南楼照明`30xxxxx11`，空调`30xxxxx12`，北楼照明`30xxxxx21`，空调`30xxxxx22`，7、8 栋同南楼规则。`xxxxx`为楼宇+房间号。

:::

## 输出

```txt-vue
{{g.id||'-'}}
```
