<template>
  <div class="form-container">
    <h2>Добавить дисциплину</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="discipline-name">Название дисциплины</label>
        <input type="text" id="discipline-name" v-model="formData.name" placeholder="Введите название дисциплины" />
      </div>

      <div class="form-group">
        <label>Авторы</label>
        <div class="multi-select">
          <div class="multi-select-btn" @click="toggleDropdown">
            {{ formData.authorsSelected.length > 0
              ? formData.authorsSelected.map(author => author.fullName ?? author.login).join(', ')
              : 'Выберите авторов' }}
            <span v-if="!formData.dropdownOpen">▼</span>
            <span v-else>▲</span>
          </div>
          <div class="multi-select-options" :class="{ active: formData.dropdownOpen }">
            <label v-for="author in formData.authors" :key="author.id">
              <input type="checkbox" :value="author" v-model="formData.authorsSelected" />
              {{ author.fullName ?? author.login }}
            </label>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Классы</label>
        <div class="multi-select">
          <div class="multi-select-btn" @click="toggleDropdownSecond">
            {{ formData.groupsSelected.length > 0
              ? formData.groupsSelected.map(group => group.name).join(', ')
              : 'Выберите классы' }}
            <span v-if="!formData.dropdownOpenSecond">▼</span>
            <span v-else>▲</span>
          </div>
          <div class="multi-select-options" :class="{ active: formData.dropdownOpenSecond }">
            <label v-for="group in formData.groups" :key="group.id">
              <input type="checkbox" :value="group" v-model="formData.groupsSelected" />
              {{ group.name }}
            </label>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="description">Описание</label>
        <textarea id="description" v-model="formData.description" placeholder="Введите описание дисциплины"></textarea>
      </div>

      <div class="form-group">
        <button type="submit">Создать</button>
      </div>
      <div class="form-group">
        <button type="button" @click="handleDelete" v-if="formData.id" class="delete-button">Удалить</button>
      </div>
    </form>
  </div>
</template>

<script>
import { inject } from "vue";

export default {
  data() {
    return {
      formData: {
        id: null,
        code: Math.random().toString(36).substring(2, 12), // Уникальный код
        name: "", // Название дисциплины
        authors: [], // Список авторов, полученный с API
        authorsSelected: [], // Выбранные авторы
        description: "", // Описание
        dropdownOpen: false, // Открыт ли выпадающий список
        dropdownOpenSecond: false, // Открыт ли выпадающий список
        groups: [],
        groupsSelected: [], // Выбранные авторы
      },
    };
  },
  setup() {
    const apiClient = inject("apiClient");
    return { apiClient };
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await this.apiClient.post("/list/users");
        this.formData.authors = response.data;
      } catch (error) {
        console.error("Ошибка при загрузке списка пользователей:", error);
      }
    },
    async fetchGroup() {
      try {
        const response = await this.apiClient.post("/list/groups");
        this.formData.groups = response.data;
      } catch (error) {
        console.error("Ошибка при загрузке списка пользователей:", error);
      }
    },
    async handleDelete() {
      if (!confirm("Вы уверены, что хотите удалить дисциплину?")) return;

      try {
        const response = await this.apiClient.delete(`/discipline/${this.formData.id}`);
        if (response.status === 200) {
          alert("Дисциплина успешно удалена.");
          window.location.replace('/discipline');
        }
      } catch (error) {
        alert("Ошибка при удалении дисциплины.");
        console.error(error);
      }
    },
    async disciplineLoad(lastParam) {
      try {
        const response = await this.apiClient.get(`/discipline/${lastParam}`);
        this.formData.name = response.data.name;
        this.formData.description = response.data.description;
        this.formData.authorsSelected = response.data.authors;
        this.formData.groupsSelected = response.data.groups;
        this.formData.id = lastParam;
      } catch (error) {
        window.location.replace('/discipline');
      }
    },
    toggleDropdown() {
      this.formData.dropdownOpen = !this.formData.dropdownOpen;
    },
    toggleDropdownSecond() {
      this.formData.dropdownOpenSecond = !this.formData.dropdownOpenSecond;
    },
    async handleSubmit() {
      if (!Number.isInteger(parseInt(this.formData.id))) {
        try {
          const response = await this.apiClient.post('/discipline', {
            name: this.formData.name,
            description: this.formData.description,
            authors: this.formData.authorsSelected,
            groups: this.formData.groupsSelected,
            code: this.formData.code,
          });
          if (response.status === 201) {
            window.location.replace('/discipline');
          }
        } catch (error) {
          alert("Что-то пошло не так");
        }
      }
      try {
        const response = await this.apiClient.put(`/discipline/${this.formData.id}`, {
          name: this.formData.name,
          description: this.formData.description,
          authors: this.formData.authorsSelected,
          groups: this.formData.groupsSelected,
          code: this.formData.code,
        });
        if (response.status === 200) {
          window.location.replace('/discipline');
        }
      } catch (error) {
        alert("Что-то пошло не так при обновлении");
      }
    },
  },
  mounted() {
    this.fetchUsers();
    this.fetchGroup();
    const url = window.location.href;
    const lastParam = url.split("/").slice(-1)[0];
    if (Number.isInteger(parseInt(lastParam))) {
      this.disciplineLoad(lastParam);
    }
  },
};
</script>

<style>
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

.multi-select {
  position: relative;
  display: inline-block;
  width: 100%;
}

.multi-select-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.multi-select-options {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: none;
  z-index: 1000;
}

.multi-select-options.active {
  display: block;
}

.multi-select-options label {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
}

.multi-select-options label:hover {
  background-color: #f1f1f1;
}

.multi-select-options input {
  margin-right: 10px;
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
  color: #fff;
  font-size: 1em;
  border-radius: 8px;
  cursor: pointer;
  padding: 10px;
  border: none;
}

.delete-button:hover {
  background-color: #c82333;
}
</style>
