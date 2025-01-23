<template>
  <div class="test">
    <!-- Таймер -->
    <div v-if="isRetesting && timer > 0" class="timer">Время осталось: {{ timer }} секунд</div>

    <!-- Результаты теста -->
    <div v-if="testResultData.length > 0 && !isRetesting">
      <h2>Результаты предыдущего теста</h2>
      <p>Оценка: {{ testResultData[0].score }}</p>
      <p>Попыток: {{ testResultData[0].trail }}</p>
      <p v-if="testResultData[0].score < 4">Ваша оценка ниже 4. Рекомендуется пройти тест повторно.</p>
      <button v-if="testResultData[0].score < 4" @click="startRetest">Пройти тест повторно</button>
    </div>

    <div v-if="testResultData.length == 0 && !isRetesting">
      <h2>Результаты предыдущего теста</h2>
      <p>Оценка: не оценено</p>
      <p>Попыток: нет</p>
      <p>Рекомендуется пройти тест.</p>
      <button @click="startRetest">Пройти тест</button>
    </div>

    <!-- Вопросы -->
    <div v-else-if="testData && (testResultData.length === 0 || isRetesting)">
      <h1>{{ testData.name }}</h1>
      <div v-for="question in testData.questions" :key="question.id" class="question">
        <p>{{ question.text }}</p>

        <!-- Одиночный выбор (радиокнопки) -->
        <div v-if="question.type.code === 'single'">
          <div v-for="answer in question.answers" :key="answer.id">
            <label>
              <input type="radio" :name="'question-' + question.id" :value="answer.id" v-model="answers[question.id]" />
              {{ answer.text }}
            </label>
          </div>
        </div>

        <!-- Несколько вариантов выбора (чекбоксы) -->
        <div v-if="question.type.code === 'multiple'">
          <div v-for="answer in question.answers" :key="answer.id">
            <label>
              <input type="checkbox" :value="answer.id" :name="'question-' + question.id"
                v-model="answers[question.id]" />
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
  </div>

  <!-- Индикатор загрузки -->

</template>

<script>
import { ref, onMounted, inject } from "vue";

export default {
  setup() {
    const apiClient = inject("apiClient");
    const testData = ref(null);
    const testResultData = ref([]);
    const answers = ref({});
    const timer = ref(0);
    const isRetesting = ref(false);
    let timerInterval = null;

    const loadQuestions = async () => {
      try {
        const url = window.location.href;
        const lastParam = url.split("/").slice(-1)[0];
        const response = await apiClient.get("/test/" + lastParam);
        testData.value = response.data;
        console.log("Данные теста загружены:", testData.value);

        // Инициализация ответов
        testData.value.questions.forEach((question) => {
          if (question.type.code === "multiple") {
            answers.value[question.id] = [];
          } else {
            answers.value[question.id] = null;
          }
        });

        // Установка таймера
        timer.value = testData.value.questions.length * 60;
        startTimer();
      } catch (error) {
        console.error("Ошибка загрузки вопросов", error);
      }
    };

    const loadTestResult = async () => {
      try {
        const url = window.location.href;
        const lastParam = url.split("/").slice(-1)[0];
        const response = await apiClient.post("list/result/test", {
          test: { id: lastParam },
        });
        testResultData.value = response.data;
        console.log("Результаты теста загружены:", testResultData.value);
      } catch (error) {
        console.error("Ошибка загрузки результатов теста", error);
      }
    };

    const startTimer = () => {
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (timer.value > 0) {
          timer.value -= 1;
        } else {
          clearInterval(timerInterval);
          console.log("Таймер истек, отправляем тест.");
          submitTest(); // Отправка теста по завершении таймера
        }
      }, 1000);
    };

    const startRetest = () => {
      isRetesting.value = true;
      loadQuestions();
    };

    const formatAnswers = (source) => {
      const formattedAnswers = [];
      for (const key in source) {
        const value = source[key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formattedAnswers.push({ id: Number(item) });
          });
        } else if (value !== null) {
          formattedAnswers.push({ id: Number(value) });
        }
      }
      return formattedAnswers;
    };

    const submitTest = async () => {
      try {
        const url = window.location.href;
        const lastParam = url.split("/").slice(-1)[0];
        const result = await apiClient.post("user/test", {
          test: { id: lastParam },
          answers: formatAnswers(answers.value),
        });
        console.log("Результат отправки:", result.data);
        clearInterval(timerInterval);
        window.location.reload();
      } catch (error) {
        console.error("Ошибка отправки теста", error);
      }
    };

    onMounted(async () => {
      await loadTestResult();
    });

    return {
      testData,
      testResultData,
      answers,
      timer,
      isRetesting,
      submitTest,
      startRetest,
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

.timer {
  text-align: center;
  font-size: 18px;
  margin-bottom: 20px;
}
</style>