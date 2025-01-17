<template>
  <div class="test" v-if="testData">
    <h1>{{ testData.name }}</h1>
    <div v-for="question in testData.questions" :key="question.id" class="question">
      <p>{{ question.text }}</p>

      <!-- Одиночный выбор (радиокнопки) -->
      <div v-if="question.type.code === 'single'">
        <div v-for="answer in question.answers" :key="answer.id">
          <label>
            <input
              type="radio"
              :name="'question-' + question.id"
              :value="answer.id"
              v-model="answers[question.id]"
            />
            {{ answer.text }}
          </label>
        </div>
      </div>

      <!-- Несколько вариантов выбора (чекбоксы) -->
      <div v-if="question.type.code === 'multiple'">
        <div v-for="answer in question.answers" :key="answer.id">
          <label>
            <input
              type="checkbox"
              :value="answer.id"
              :name="'question-' + question.id"
              v-model="answers[question.id]"
            />
            {{ answer.text }}
          </label>
        </div>
      </div>

      <!-- Ввод текста -->
      <div v-if="question.type.code === 'textAria'">
        <textarea v-model="answers[question.id]" placeholder="Введите ответ"></textarea>
      </div>
    </div>

    <button @click="submitTest">Подтвердить ответы</button>
  </div>

  <!-- Можно также добавить индикатор загрузки, если данные ещё не загружены -->
  <div v-else>
    <p>Загрузка теста...</p>
  </div>
</template>

<script>
import { ref, onMounted, inject } from "vue";

export default {
  setup() {
    const apiClient = inject("apiClient"); // Inject your API client
    const testData = ref(null); // Сначала null, пока не загрузим данные
    const answers = ref({}); // Массив для хранения ответов

    // Загрузка данных теста с сервера
    onMounted(async () => {
      try {
        const response = await apiClient.get("/test/1");
        testData.value = response.data; // Присваиваем данные теста
        // Инициализация массива для каждого вопроса с множественным выбором
        testData.value.questions.forEach(question => {
          if (question.type.code === 'multiple') {
            answers.value[question.id] = []; // Массив для множественного выбора
          } else {
            answers.value[question.id] = null; // Для одиночного выбора - строка
          }
        });
      } catch (error) {
        console.error("Ошибка загрузки теста", error);
      }
    });

    // Функция для обработки отправки ответов
    const submitTest = () => {
      console.log("Ответы на тест:", answers.value);
      // Здесь можно отправить ответы на сервер для проверки
    };

    return {
      testData,
      answers,
      submitTest,
    };
  },
};
</script>

<style scoped>
.test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.question {
  margin-bottom: 20px;
}

.question p {
  font-weight: bold;
}

textarea {
  width: 100%;
  height: 100px;
  margin-top: 10px;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  margin-top: 20px;
}

button:hover {
  background-color: #45a049;
}

.loading {
  text-align: center;
  font-size: 18px;
}
</style>
