<template>
    <form @submit.prevent="submitForm" class="create-discipline-form">
      <div class="form-group">
        <label for="name">Название дисциплины</label>
        <input
          type="text"
          id="name"
          v-model="formData.name"
          placeholder="Введите название дисциплины"
          required
        />
      </div>
  
      <div class="form-group">
        <label for="authors">Авторы</label>
        <select
          id="authors"
          v-model="formData.authors"
          multiple
          @change="handleAuthorsChange"
        >
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.fullName }}
          </option>
        </select>
        <small>Удерживайте Ctrl (Cmd на Mac), чтобы выбрать нескольких авторов</small>
      </div>
  
      <div class="form-group">
        <label for="description">Описание</label>
        <textarea
          id="description"
          v-model="formData.description"
          placeholder="Введите описание дисциплины"
          rows="6"
          required
        ></textarea>
      </div>
  
      <button type="submit" class="btn submit-btn">Создать дисциплину</button>
    </form>
  </template>
  
  <script>
  import { inject } from 'vue';
  export default {
    data() {
      return {
        formData: {
          code: Math.random().toString(36).substring(2, 12),
          name: "",
          authors: [],
          description: "",
        },
        users: [], // Список пользователей
      };
    },

    setup() {
     const apiClient = inject("apiClient");
      return {
        apiClient: apiClient,
      }
    },

    methods: {
      async fetchUsers() {
        try {
          const response = await this.apiClient("/list/users");
          this.users = await response.json();
        } catch (error) {
          console.error("Ошибка при загрузке списка пользователей:", error);
        }
      },
      handleAuthorsChange(event) {
        this.formData.authors = Array.from(event.target.selectedOptions, (option) => option.value);
      },
      async submitForm() {
        try {
          const response = await this.apiClient("/discipline", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.formData),
          });
  
          if (response.ok) {
            alert("Дисциплина успешно создана!");
            this.resetForm();
          } else {
            console.error("Ошибка при создании дисциплины:", response.statusText);
          }
        } catch (error) {
          console.error("Ошибка:", error);
        }
      },
      resetForm() {
        this.formData = {
          name: "",
          authors: [],
          description: "",
        };
      },
    },
    mounted() {
      this.fetchUsers(); // Загрузка списка пользователей при монтировании компонента
    },
  };
  </script>
  
  <style>
  .create-discipline-form {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background: #f9f9f9;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .form-group small {
    display: block;
    margin-top: 4px;
    color: #666;
  }
  
  .btn.submit-btn {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn.submit-btn:hover {
    background-color: #0056b3;
  }
  </style>
  