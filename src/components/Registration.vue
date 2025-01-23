<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Registration</h2>
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" placeholder="Enter your username" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" placeholder="Enter your password" required />
      </div>

      <div class="form-group">
        <label for="firstName">Имя</label>
        <input type="text" id="firstName" v-model="firstName" placeholder="Введите свое имя" required />
      </div>

      <div class="form-group">
        <label for="lastName">Фамилию</label>
        <input type="text" id="lastName" v-model="lastName" placeholder="Введите свою фамилию" required />
      </div>

      <div class="form-group">
        <label for="password">Отчество</label>
        <input type="text" id="middleName" v-model="middleName" placeholder="Введите свое отчество" required />
      </div>
      <div class="form-group">
        <label for="password">email</label>
        <input type="text" id="email" v-model="email" placeholder="Введите свой email" required />
      </div>
      <button type="submit" class="login-button">Регистрация</button>
    </form>

    <!-- Блок для отображения ответа -->
    <div v-if="response" class="response-block">
      <pre>{{ response }}</pre>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue';
const userData = localStorage.getItem('userData');
const user = userData ? JSON.parse(userData) : null;
if (user?.login != null && window.location.pathname === '/login') {
  window.location.replace('/');
}

export default {
  name: "LoginForm",
  data() {
    return {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      client: null,
      response: null,
      error: null,
    };
  },
  setup() {
    const params = new URLSearchParams(window.location.search);
    const apiClient = inject("apiClient");
    const code = params.get('invite');

    return {
      apiClient: apiClient,
      code: code,
    };
  },
  methods: {
    async handleLogin() {
      this.response = null; // Сброс ответа перед новым запросом
      this.error = null; // Сброс ошибки
      try {
        // Отправляем POST-запрос
        const info = await this.apiClient.get('/user/zov?code=' + this.code);
        console.log(info.info);
        console.log(info.data);
        console.log(info.data.info);

        const res = await this.apiClient.post("/user/register", {
          login: this.username,
          password: this.password,
          firstName: this.firstName,
          lastName: this.lastName,
          middleName: this.middleName,
          email: this.email,
          rights: info.data.info.rights,
          group: info.data.info.group,
          active: info.data.info.rights.length === 0 ? false : true,
        },
        );

        // Проверяем статус ответа
        if (res.status === 200) {
          this.response = "Успешно!";
          if (res.data.token) {
            window.location.replace('/');
            localStorage.setItem('userData', JSON.stringify(res.data, null, 2));
          }
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          this.error = "Ошибка: Пользователь не найден.";
        } else {
          this.error = "Произошла ошибка. Попробуйте позже.";
        }
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

.login-form {
  display: flex;
  flex-direction: column;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.login-button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #0056b3;
}

.response-block {
  margin-top: 20px;
  padding: 10px;
  background-color: #e7f9e7;
  border: 1px solid #a2d5a2;
  border-radius: 4px;
}

.error-message {
  margin-top: 20px;
  padding: 10px;
  background-color: #f9e7e7;
  border: 1px solid #d5a2a2;
  border-radius: 4px;
}
</style>