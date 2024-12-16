<template>
  <div class="form-wrapper">
    <div class="form-container">
      <h2>{{ formData.id ? "Редактировать Учебное пособие" : "Добавить Учебное пособие" }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="material-name">Название материала</label>
          <input
            type="text"
            id="material-name"
            v-model="formData.name"
            placeholder="Введите название материала"
          />
          <span v-if="errors.name" class="error">{{ errors.name }}</span>
        </div>
        <div class="form-group">
          <label for="discipline-select">Выберите дисциплину</label>
          <select
            id="discipline-select"
            v-model="formData.discipline"
          >
            <option value="" disabled>Выберите дисциплину</option>
            <option
              v-for="discipline in formData.disciplines"
              :key="discipline"
              :value="discipline"
            >
              {{ discipline.name }}
            </option>
          </select>
          <span v-if="errors.discipline" class="error">{{ errors.discipline }}</span>
        </div>
        <div class="form-group">
          <label for="description">Описание</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Введите описание материала"
          ></textarea>
          <span v-if="errors.description" class="error">{{ errors.description }}</span>
        </div>
        <div class="form-group">
          <button type="submit">Сохранить</button>
        </div>
        <div class="form-group" v-if="formData.id">
          <button type="button" class="delete-button" @click="handleDelete">Удалить</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { inject } from "vue";

export default {
  data() {
    return {
      formData: {
        id: null,
        name: "",
        discipline: "",
        description: "",
        disciplines: [],
      },
      errors: {},
    };
  },
  setup() {
    const apiClient = inject("apiClient");
    return { apiClient };
  },
  methods: {
    async fetchDisciplines() {
      try {
        const response = await this.apiClient.post("/list/disciplines");
        this.formData.disciplines = response.data;
      } catch (error) {
        console.error("Ошибка при загрузке дисциплин:", error);
      }
    },
    async loadMaterial() {
      const url = window.location.href;
      const id = url.split("/").pop();

      if (!isNaN(id)) {
        try {
          const response = await this.apiClient.get(`/subject/${id}`);
          this.formData = { ...response.data, disciplines: this.formData.disciplines };
        } catch (error) {
          console.error("Ошибка при загрузке данных материала:", error);
          alert("Не удалось загрузить данные материала.");
        }
      }
    },
    generateCode() {
      return Math.random().toString(36).substr(2, 10);
    },
    validateForm() {
      this.errors = {};
      if (!this.formData.name) {
        this.errors.name = "Название материала обязательно.";
      }
      if (!this.formData.discipline) {
        this.errors.discipline = "Выберите дисциплину.";
      }
      if (!this.formData.description) {
        this.errors.description = "Описание обязательно.";
      }
      return Object.keys(this.errors).length === 0;
    },
    async handleSubmit() {
      if (!this.validateForm()) {
    return;
  }

  try {
    const payload = {
      name: this.formData.name,
      discipline:  this.formData.discipline , // Отправляем дисциплину как объект
      description: this.formData.description,
      code: this.formData.id ? this.formData.code : this.generateCode(),
    };

    const response = this.formData.id
      ? await this.apiClient.put(`/subject/${this.formData.id}`, payload)
      : await this.apiClient.post("/subject", payload);

    if ([200, 201].includes(response.status)) {
      alert("Учебное пособие сохранено.");
      window.location.replace(`/discipline/${this.formData.discipline.id}`);
    }
  } catch (error) {
    console.error("Ошибка при сохранении учебного пособия:", error);
    alert("Произошла ошибка при сохранении. Попробуйте снова.");
  }
    },
    async handleDelete() {
      if (confirm("Вы уверены, что хотите удалить это учебное пособие?")) {
        try {
          const response = await this.apiClient.delete(`/subject/${this.formData.id}`);
          if (response.status === 200) {
            alert("Учебное пособие удалено.");
            window.location.replace(`/discipline/${this.formData.discipline.id}`);
          }
        } catch (error) {
          console.error("Ошибка при удалении учебного пособия:", error);
          alert("Не удалось удалить учебное пособие. Попробуйте снова.");
        }
      }
    },
  },
  mounted() {
    this.fetchDisciplines();
    this.loadMaterial();
  },
};
</script>

<style>
.form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
}

.form-container {
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px 30px;
  width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
}

.form-group button {
  width: 100%;
  padding: 10px;
  border: none;
  background-color: #28a745;
  color: #fff;
  font-size: 1em;
  border-radius: 8px;
  cursor: pointer;
}

.form-group button:hover {
  background-color: #218838;
}

.delete-button {
  background-color: #dc3545;
}

.delete-button:hover {
  background-color: #c82333;
}

.error {
  color: #dc3545;
  font-size: 0.9em;
  margin-top: 5px;
}
</style>
