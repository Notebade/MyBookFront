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
import { ref, onMounted, inject, onBeforeMount } from "vue";

export default {
  setup() {
    const apiClient = inject("apiClient");
    const testData = ref(null);
    const testResultData = ref(null);
    const answers = ref({});

    const questions = async () => {
      try {
        const url = window.location.href;
        const lastParam = url.split("/").slice(-1)[0];
        const response = await apiClient.get("/test/" + lastParam);
        testData.value = response.data; // Присваиваем данные теста
        // Инициализация массива для каждого вопроса с множественным выбором
        testData.value.questions.forEach((question) => {
          if (question.type.code === "multiple") {
            answers.value[question.id] = []; // Массив для множественного выбора
          } else {
            answers.value[question.id] = null; // Для одиночного выбора - строка
          }
        });
      } catch (error) {
        console.error("Ошибка загрузки теста", error);
      }
    };

    const testResult = async () => {
      try {
        const url = window.location.href;
        const lastParam = url.split("/").slice(-1)[0];
        const response = await apiClient.post(
          "list/result/test", 
          {
            test: {id: lastParam}
          }
      );
      testResultData.value = response.data;
      } catch (error) {
        console.error("Ошибка загрузки теста", error);
      }
    };

    // Загрузка данных теста с сервера
    onMounted(async () => {
      testResult();
      questions();
    });

    // Функция форматирования ответов
    const formatAnswers = (source) => {
      const formattedAnswers = [];

      for (const key in source) {
        const value = source[key];

        if (Array.isArray(value)) {
          // Если значение массив, добавляем объекты для каждого элемента массива
          value.forEach((item) => {
            formattedAnswers.push({ id: Number(item) });
          });
        } else if (value !== null) {
          // Если значение одно число
          formattedAnswers.push({ id: Number(value) });
        }
      }

      return formattedAnswers;
    };

    // Функция для обработки отправки ответов
    const submitTest = async () => {
      console.log("Ответы на тест:", answers.value);
      console.log(formatAnswers(answers.value)); // Теперь без использования this

      try {
        const url = window.location.href;
        const lastParam = url.split("/").slice(-1)[0];
        const result = await apiClient.post("user/test", {
          test: { id: lastParam },
          answers: formatAnswers(answers.value),
        });

        console.log("Результат отправки:", result.data);
      } catch (error) {
        console.error("Ошибка отправки теста", error);
      }
    };

    return {
      testData,
      answers,
      submitTest,
      testResultData,
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
