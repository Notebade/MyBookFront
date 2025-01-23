<template>
  <div class="theme-node">
    <div class="theme-header">
      <!-- Редактирование позиции -->
      <span v-if="!isEditing">
        {{ theme.position }}.
      </span>
      <input v-else type="number" v-model.number="editablePosition" @keyup.enter="saveEdit" @blur="saveEdit"
        class="theme-input position-input" />

      <!-- Редактирование названия -->
      <span v-if="!isEditing">
        {{ theme.name }}
      </span>
      <input v-else type="text" v-model="editableName" @keyup.enter="saveEdit" @blur="saveEdit"
        class="theme-input name-input" />

      <!-- Кнопки действий -->
      <button v-if="!isEditing" @click="editTheme" class="btn edit-btn">✏️</button>
      <button v-else @click="saveEdit" class="btn save-btn">💾</button>
      <button @click="deleteTheme(theme.id)" class="btn delete-btn">🗑️</button>
    </div>
    <!-- Дочерние темы -->
    <div class="sub-themes" v-if="subThemes.length">
      <ThemeNode v-for="subTheme in subThemes" :key="subTheme.id" :theme="subTheme" :all-themes="allThemes"
        @refresh="$emit('refresh')" />
    </div>
  </div>

</template>

<script>
import { ref, computed, inject } from "vue";

export default {
  props: {
    theme: {
      type: Object,
      required: true,
    },
    allThemes: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const apiClient = inject("apiClient");

    // Режим редактирования
    const isEditing = ref(false);
    const editableName = ref(props.theme.name);
    const editablePosition = ref(props.theme.position);
    const subject = { id: props.theme.subjectId };

    const subThemes = computed(() =>
      props.allThemes.filter((t) => t.parent === props.theme.id)
    );

    const editTheme = () => {
      isEditing.value = true; // Включаем режим редактирования
    };

    const saveEdit = async () => {
      try {
        if (editableName.value.trim() !== "" && editablePosition.value > 0) {
          await apiClient.put(`/theme/${props.theme.id}`, {
            ...props.theme,
            name: editableName.value.trim(),
            position: editablePosition.value,
            subject: subject,
            code: Math.random().toString(36).substring(2, 12),
          });
          props.theme.name = editableName.value.trim(); // Обновляем локально
          props.theme.position = editablePosition.value; // Обновляем локально
          emit("refresh"); // Обновляем список тем
        }
      } catch (error) {
        console.error("Ошибка при сохранении темы:", error);
      } finally {
        isEditing.value = false; // Выключаем режим редактирования
      }
    };

    const deleteTheme = async (themeId) => {
      if (confirm("Вы уверены, что хотите удалить эту тему?")) {
        try {
          await apiClient.delete(`/theme/${themeId}`);
          emit("refresh");
        } catch (error) {
          console.error("Ошибка при удалении темы:", error);
        }
      }
    };

    const addSubTheme = (parentId) => {
      localStorage.setItem("parentThemeId", parentId);
      window.location.href = "/create-theme";
    };

    return {
      isEditing,
      editableName,
      editablePosition,
      subThemes,
      editTheme,
      saveEdit,
      deleteTheme,
      addSubTheme,
    };
  },
};
</script>

<style>
.theme-node {
  margin-left: 20px;
  margin-top: 10px;
}

.theme-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9f9f9;
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  margin-left: 5px;
  padding: 3px 6px;
  cursor: pointer;
}

.add-btn {
  background: #4caf50;
  color: white;
}

.edit-btn {
  background: #ffc107;
  color: white;
}

.delete-btn {
  background: #f44336;
  color: white;
}
</style>