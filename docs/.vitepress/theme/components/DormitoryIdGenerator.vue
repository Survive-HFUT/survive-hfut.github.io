<script setup lang="ts">
import { ref, computed } from 'vue';

const buildingNumber = ref(1);
const roomNumber = ref('');
const selectedDirection = ref('north');
const type = ref('ac');
const roomError = ref('');

const id = computed(() => {
  if (
    !buildingNumber.value ||
    !roomNumber.value ||
    !selectedDirection.value ||
    roomError.value
  ) {
    return '';
  }

  // 方向代码
  const directionCode = selectedDirection.value === 'south' ? '1' : '2';

  if (buildingNumber.value < 6) {
    // 北生活区：楼宇编号+房间号+方向代码+方向代码
    return `300${buildingNumber.value}${roomNumber.value}${directionCode}1`;
  } else {
    // 南生活区：楼宇编号+房间号+方向代码+用电类型代码
    const typeCode = type.value === 'lighting' ? '1' : '2';

    return `30${buildingNumber.value.toString().padStart(2, '0')}${roomNumber.value}${directionCode}${typeCode}`;
  }
});

const validateRoom = () => {
  const room = roomNumber.value;
  if (room && !/^\d{3}$/.test(room)) {
    roomError.value = '房间号必须是3位数字，例如：101';
  } else {
    roomError.value = '';
  }
};

defineExpose({ id });
</script>

<template>
  <div class="dormitory-id-generator">
    <div class="form-group">
      <label for="building">楼号：</label>
      <select id="building" v-model="buildingNumber">
        <option
          v-for="building in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
          :key="building"
          :value="building"
        >
          {{ building }} 号楼
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="room">房间号</label>
      <input
        id="room"
        type="text"
        v-model="roomNumber"
        placeholder="例如：101"
        @input="validateRoom"
        maxlength="3"
      />
      <span v-if="roomError" class="error">{{ roomError }}</span>
    </div>

    <div class="form-group">
      <label for="direction">方向</label>
      <select id="direction" v-model="selectedDirection">
        <option value="south">南边</option>
        <option value="north">北边</option>
      </select>
    </div>

    <div class="form-group">
      <label for="type">用电类型</label>
      <select v-if="buildingNumber >= 6" id="type" v-model="type">
        <option value="lighting">照明</option>
        <option value="ac">空调</option>
      </select>
      <select v-else disabled>
        <option>-</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.dormitory-id-generator {
  margin: 20px auto;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  user-select: none;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.form-group select:focus,
.form-group input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.error {
  color: var(--vp-c-danger-1);
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

@media (max-width: 640px) {
  .dormitory-id-generator {
    margin: 10px;
    padding: 16px;
  }
}
</style>
