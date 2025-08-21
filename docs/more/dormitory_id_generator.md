# 宣区宿舍缴费编号生成器

## 输出

<script setup>
import { ref } from 'vue'

const count = ref(0)
const g = ref({})
</script>

<DormitoryIdGenerator ref="g" />

## 输出

```id-vue
{{g.id||'-'}}
```
