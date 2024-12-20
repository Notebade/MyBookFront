<template>
    <div class="form-container">
      <h2>Создание новой темы для дисциплины: {{ subjectName }}</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="code">Код</label>
          <input
            id="code"
            v-model="form.code"
            type="text"
            required
            placeholder="Введите код темы"
          />
        </div>
  
        <div class="form-group">
          <label for="name">Название</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="Введите название темы"
          />
        </div>
  
        <div class="form-group">
          <label for="parent">Родительская тема</label>
          <input
            id="parent"
            v-model="form.parent"
            type="text"
            placeholder="ID родительской темы (необязательно)"
          />
        </div>
  
        <div class="form-group">
          <label for="position">Позиция</label>
          <input
            id="position"
            v-model="form.position"
            type="number"
            required
            min="1"
            placeholder="Позиция темы"
          />
        </div>
  
        <button type="submit" class="btn submit-btn">Создать</button>
      </form>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, inject } from "vue";
  
  export default {
    name: "CreateThemeForm",
    setup() {
      const form = ref({
        code: "",
        name: "",
        parent: null,
        position: 1,
        subject: null, // Здесь будет объект дисциплины
      });
  
      const subjectName = ref("");
  
      const fetchSubjectDetails = async (id) => {
        try {
          const apiClient = inject("apiClient");
          const response = await apiClient.get(`/subjects/${id}`);
          subjectName.value = response.data.name;
          form.value.subject = response.data; // Связываем объект дисциплины с темой
        } catch (error) {
          console.error("Ошибка при загрузке дисциплины:", error);
        }
      };
  
      onMounted(() => {
        const subjectId = localStorage.getItem("subjectId");
        if (subjectId) {
          fetchSubjectDetails(subjectId);
        } else {
          console.error("ID дисциплины не найден в localStorage!");
        }
      });
  
      const submitForm = async () => {
        try {
          const apiClient = inject("apiClient");
          const response = await apiClient.post("/themes", form.value);
          alert("Тема успешно создана!");
          console.log("Созданная тема:", response.data);
        } catch (error) {
          console.error("Ошибка при создании темы:", error);
          alert("Ошибка при создании темы");
        }
      };
  
      return {
        form,
        subjectName,
        submitForm,
      };
    },
  };
  </script>
  