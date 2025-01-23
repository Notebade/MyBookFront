<template>
  <div class="form-container">
    <h1>{{ isEditing ? 'Редактировать тест' : 'Создать тест' }}</h1>

    <form @submit.prevent="handleSubmit" class="test-form">
      <!-- Поле для кода теста -->
      <div class="form-group">
        <label for="testCode">Код теста:</label>
        <input id="testCode" v-model="test.code" required class="form-input" />
      </div>

      <!-- Поле для имени теста -->
      <div class="form-group">
        <label for="testName">Имя теста:</label>
        <input id="testName" v-model="test.name" required class="form-input" />
      </div>

      <!-- Селектор дисциплин -->
      <div class="form-group">
        <label for="discipline">Дисциплина:</label>
        <select id="discipline" v-model="selectedDiscipline" @change="fetchSubjects" class="form-select">
          <option v-for="discipline in disciplines" :key="discipline.id" :value="discipline.id">
            {{ discipline.name }}
          </option>
        </select>
      </div>

      <!-- Селектор объектов (предметов) -->
      <div class="form-group" v-if="subjects.length > 0">
        <label for="subject">Объект:</label>
        <select id="subject" v-model="selectedSubject" @change="fetchThemes" class="form-select">
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
            {{ subject.name }}
          </option>
        </select>
      </div>

      <!-- Селектор тем -->
      <div class="form-group" v-if="themes.length > 0">
        <label for="theme">Тема:</label>
        <select id="theme" v-model="selectedTheme" class="form-select">
          <option v-for="theme in themes" :key="theme.id" :value="theme.id">
            {{ theme.name }}
          </option>
        </select>
      </div>

      <!-- Кнопка для создания теста -->
      <div class="form-group">
        <button type="submit" :disabled="!isFormValid" class="form-button">
          {{ isEditing ? 'Сохранить изменения' : 'Создать тест' }}
        </button>
      </div>
      <div class="form-group" v-if="isEditing">
        <button @click="deleteItem" type="button" class="delete-button">Удалить</button>
      </div>
    </form>
    <div class="form-group">
      <button @click="addQuestionMethods">Добавить Вопрос</button>
    </div>
  </div>
  <div class="form-container">
    <h1 v-if="isQuestion">{{ isQuestion ? 'Редактировать Вопросы' : 'Вопросы' }}</h1>
    <form @submit.prevent="saveQuestions" class="test-form">
      <div v-for="(formElement, index) in formElements" :key="index">
        <div class="form-group">
          <label :for="'input' + index">Вопрос № {{ index + 1 }} </label>
          <input :id="'input' + index" v-model="formElement.text" required class="form-input" />
        </div>
        <div class="form-group">
          <label :for="'question' + index">Тип вопроса:</label>
          <select :for="'question' + index" v-model="formElement.type.id" class="form-select">
            <option v-for="questionType in questionTypes" :key="questionType.id" :value="questionType.id">
              {{ questionType.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label :for="'number' + index">кол-во вариантов</label>
          <input @change="updateCountAnswers($event.target.value, index)" :value="formElement.answersCount"
            type="number" :id="'number' + index" required class="form-input" />
        </div>
        <div style="border: 1px black;
            padding: 10px;
            border-style: solid;">
          <div class="form-group" v-for="(answer, key) in formElement.answers" :key="key">
            <div class="form-group">
              <label :for="'textAnswer' + key">ответ №{{ ++key }}:</label>
              <input v-model="answer.text" :id="'textAnswer' + key" required class="form-input" />
            </div>
            <div class="form-group">
              <label :for="'rightAnswer' + key">Ответ:</label>
              <input v-model="answer.right" type="text" value=true :id="'rightAnswer' + key" required
                class="form-input" />
            </div>
          </div>
        </div>
        <div class="form-group">
          <button @click="deleteAnswers(index)">Удалить вопрос</button>
        </div>
      </div>
      <div class="form-group">
        <button v-if="formElements.length > 0">Сохранить вопросы</button>
      </div>
    </form>
  </div>
</template>

<script>
import { result } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import { inject, ref, onMounted, computed } from 'vue';

export default {
  setup() {
    const apiClient = inject("apiClient");
    const disciplines = ref([]);
    const subjects = ref([]);
    const themes = ref([]);
    const questionTypes = ref([]);
    const formElements = ref([]);
    const formElementsAnswers = ref([]);
    const steep = ref(4);

    const selectedDiscipline = ref(null);
    const selectedSubject = ref(null);
    const selectedTheme = ref(null);
    const url = window.location.href;
    const testId = url.split("/").pop();

    const test = ref({
      code: "",
      name: "",
    });
    const answer = {
      id: null,
      text: "",
      right: "false"
    };
    const answers = ref([]);
    for (let i = 0; i < steep.value; i++) {
      answers.value.push(cloneDeep(answer));
    }
    const initialQuestion = {
      id: null,
      test: { id: !isNaN(testId) ? testId : null },
      text: "",
      type: { id: null },
      answers: answers,
      answersCount: 4,
    };
    const question = ref(cloneDeep(initialQuestion));

    const isEditing = ref(false);
    const isQuestion = ref(false);
    const isQuestionDelete = ref(false);

    if (!isNaN(testId)) {
      isEditing.value = true;
      isQuestion.value = true;
    }

    const fetchDisciplines = async () => {
      try {
        const response = await apiClient.post("/list/disciplines");
        disciplines.value = response.data;
      } catch (error) {
        console.error("Ошибка загрузки дисциплин:", error);
      }
    };

    const fetchSubjects = async () => {
      if (!selectedDiscipline.value) return;
      try {
        const response = await apiClient.post("/list/subjects", {
          disciplineId: selectedDiscipline.value,
        });
        subjects.value = response.data;
        themes.value = []; // Очистить темы при смене дисциплины
        selectedSubject.value = null;
      } catch (error) {
        console.error("Ошибка загрузки объектов:", error);
      }
    };

    const fetchThemes = async () => {
      if (!selectedSubject.value) return;
      try {
        const response = await apiClient.post("/list/themes", {
          subjectsId: selectedSubject.value,
        });
        themes.value = response.data;
        selectedTheme.value = null;
      } catch (error) {
        console.error("Ошибка загрузки тем:", error);
      }
    };

    const fetchQuestionTypes = async () => {
      try {
        const response = await apiClient.get("/list/questionTypes");
        questionTypes.value = response.data;
      } catch (error) {
        console.error("Ошибка загрузки тем:", error);
      }
    };

    const getTheme = async (themeId) => {
      if (!themeId) return;
      try {
        const response = await apiClient.get("/theme/" + themeId);
        themes.value = [response.data];
        selectedTheme.value = response.data.id;
      } catch (error) {
        console.error("Ошибка загрузки тем:", error);
      }
    };

    const getSubjects = async (subjectId) => {
      if (!subjectId) return;
      try {
        const response = await apiClient.get("/subject/" + subjectId);
        subjects.value = [response.data];
        selectedSubject.value = response.data.id;
      } catch (error) {
        console.error("Ошибка загрузки тем:", error);
      }
    };

    const getDiscipline = async (disciplineId) => {
      if (!disciplineId) return;
      try {
        const response = await apiClient.get("/discipline/" + disciplineId);
        disciplines.value = [response.data];
        selectedDiscipline.value = response.data.id;
      } catch (error) {
        console.error("Ошибка загрузки тем:", error);
      }
    };

    const loadTest = async () => {
      if (!testId) return;
      try {
        const response = await apiClient.get(`/test/${testId}`);
        if (questionTypes.value.length == 0) {
          await fetchQuestionTypes();
        }
        Object.assign(test.value, response.data);
        Object.assign(formElements.value, response.data.questions);
        await getTheme(response.data.theme.id);
        await getSubjects(response.data.theme.subjectId);
        await getDiscipline(subjects.value[0].discipline.id);
      } catch (error) {
        console.error("Ошибка загрузки теста:", error);
      }
    };

    const handleSubmit = async () => {
      try {
        let result;
        if (isEditing.value && !isNaN(testId)) {
          result = await apiClient.post(`/test/${testId}`, {
            ...test.value,
            theme: {
              id: selectedTheme.value,
            },
          });
        } else {
          result = await apiClient.post("/test", {
            ...test.value,
            theme: {
              id: selectedTheme.value,
            },
          });
        }
        alert(isEditing.value ? "Тест обновлён" : "Тест создан");
        window.location.replace(`/test/editor/` + result.data.id);
      } catch (error) {
        console.error("Ошибка сохранения теста:", error);
      }
    };

    const saveQuestions = async () => {
      try {
        let result;
        if (isEditing.value && !isNaN(testId)) {
          result = await apiClient.delete(`/test/${testId}/questions/clear`);
        }
        console.log(formElements.value);
        const requests = formElements.value.map((formElement) =>
          apiClient.post("/questions", { ...formElement, test: { id: testId } })
        );
        alert("Вопросы добавлены");
      } catch (error) {
        console.error("Ошибка:", error);
      }
    };

    const deleteAnswers = async (key) => {
      key--; //todo костыль 
      formElements.value = formElements.value.filter((_, index) => index !== key);
    };

    const deleteItem = async () => {
      try {
        if (confirm('Вы уверены, что хотите удалить этот тест?')) {
          await apiClient.delete(`/test/${testId}`);
          alert("Тест удалён");
          window.location.replace(`/test`);
        }
      } catch (error) {
        console.error("Ошибка удаления теста:", error);
      }
    };

    const addQuestionMethods = async () => {

      formElements.value.push(cloneDeep(question.value));
      if (questionTypes.value.length == 0) {
        await fetchQuestionTypes();
      }
      question.value = cloneDeep(initialQuestion);
    };
    const updateCountAnswers = async (countAnswer, index) => {
      formElements.value[index].answersCount = countAnswer;
      formElements.value[index].answers = [];
      for (let i = 0; i < countAnswer; i++) {
        formElements.value[index].answers.push(cloneDeep(answer));
      }
    };

    onMounted(async () => {
      await fetchDisciplines();
      if (isEditing.value) {
        await loadTest();
      }
    });

    const isFormValid = computed(
      () =>
        test.value.code &&
        test.value.name &&
        selectedDiscipline.value &&
        selectedSubject.value &&
        selectedTheme.value
    );

    return {
      disciplines,
      subjects,
      themes,
      selectedDiscipline,
      selectedSubject,
      selectedTheme,
      test,
      isEditing,
      handleSubmit,
      fetchSubjects,
      fetchThemes,
      isFormValid,
      deleteItem,
      addQuestionMethods,
      isQuestion,
      formElements,
      question,
      saveQuestions,
      questionTypes,
      formElementsAnswers,
      initialQuestion,
      updateCountAnswers,
      steep,
      answer,
      deleteAnswers,
      isQuestionDelete,
    };
  },
};
</script>

<style>
.delete-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-button:hover {
  background-color: #ff1a1a;
}

.form-container {
  max-width: 500px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.test-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}

.form-input,
.form-select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.form-button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.form-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.form-button:hover:not(:disabled) {
  background-color: #0056b3;
}
</style>