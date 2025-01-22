<template>
    <div class="admin-panel">
        <!-- Header -->
        <h1 class="admin-header">Панель администратора</h1>

        <!-- Toggle Buttons -->
        <div class="toggle-buttons">
            <button @click="setActiveForm('groups')" :class="{ active: activeForm === 'groups' }" class="toggle-button">
                Добавление групп
            </button>
            <button @click="setActiveForm('users')" :class="{ active: activeForm === 'users' }" class="toggle-button">
                Активация пользователей
            </button>
        </div>

        <!-- Forms -->
        <div class="form-container">
            <div v-if="activeForm === 'groups'" class="form">
                <h2 class="form-title">Добавление групп</h2>
                <form @submit.prevent="saveGroups">
                    <div class="form-field">
                        <label for="group-code">Код группы</label>
                        <input type="text" v-model="group.code" id="group-code" placeholder="Введите код группы" />
                    </div>
                    <div class="form-field">
                        <label for="group-name">Название группы</label>
                        <input type="text" id="group-name" v-model="group.name" placeholder="Введите название группы" />
                    </div>
                    <button type="submit" class="submit-button">Сохранить группу</button>
                    <button class="submit-button" style="margin-left: 2%;">Удалить группу</button>
                    <button @click="clearForms" class="submit-button" style="margin-top: 2%;">Очистить группу</button>
                </form>
                <h2 class="form-title mt-6">Список групп</h2>
                <div class="table-container">
                    <table class="group-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Код</th>
                                <th>Название</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="group in formElements" :key="group.id" @click="selectGroup(group.id)">
                                <td>{{ group.id }}</td>
                                <td>{{ group.code }}</td>
                                <td>{{ group.name }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-if="activeForm === 'users'" class="form">
                <h2 class="form-title">Активация пользователей</h2>
                <form>
                    <div class="form-field">
                        <label for="user-email">Email пользователя</label>
                        <input type="email" id="user-email" placeholder="Введите email пользователя" />
                    </div>
                    <button type="submit" class="submit-button">Активировать пользователя</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import { inject, ref, onMounted, computed } from 'vue';
export default {
    setup() {
        const apiClient = inject("apiClient");
        const activeForm = ref("groups");
        const formElements = ref([]);

        const group = ref({
            id: null,
            code: "",
            name: "",
        });

        const setActiveForm = (form) => {
            activeForm.value = form; // Обновляем значение через .value
        };

        const loadGroups = async () => {
            try {
                const response = await apiClient.post("/list/groups");
                formElements.value = response.data;
            } catch (error) {
                console.error("Ошибка загрузки групп:", error);
            }
        };

        const clearForms = () => {
            group.value = ref({
                id: null,
                code: "",
                name: "",
            });
        };
        const saveGroups = async () => {
            try {
                let response;
                if (group.value.id == null) {
                    response = await apiClient.post("/groups", { ...group.value });
                } else {
                    response = await apiClient.put("/groups/" + group.value.id, { ...group.value });
                }
                clearForms();
                await loadGroups();
            } catch (error) {
                console.error("Ошибка сохранения групп:", error);
            }
        };
        const selectGroup = async (id) => {
            group.value = formElements.value.find(element => element.id === id);
        };
        onMounted(async () => {
            await loadGroups();

        });
        return {
            activeForm,
            group,
            formElements,
            saveGroups,
            selectGroup,
            setActiveForm,
            clearForms,
        };
    },
};
</script>

<style scoped>
/* Общий стиль */
body {
    margin: 0;
    font-family: Arial, sans-serif;
    background-color: #f9f9f9;
    color: #333;
}

/* Панель */
.admin-panel {
    max-width: 600px;
    margin: 50px auto;
    padding: 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Заголовок */
.admin-header {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #4a90e2;
}

/* Кнопки переключения */
.toggle-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}

.toggle-button {
    padding: 10px 20px;
    font-size: 14px;
    font-weight: bold;
    color: #555;
    background-color: #e0e0e0;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.toggle-button:hover {
    background-color: #d0d0d0;
}

.toggle-button.active {
    background-color: #4a90e2;
    color: white;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

/* Формы */
.form-container {
    padding: 20px;
}

.form {
    display: flex;
    flex-direction: column;
}

.form-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
}

.form-field {
    margin-bottom: 15px;
}

.form-field label {
    display: block;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #555;
}

.form-field input {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: border-color 0.3s ease;
}

.form-field input:focus {
    border-color: #4a90e2;
    outline: none;
}

/* Кнопка отправки */
.submit-button {
    padding: 10px 20px;
    font-size: 14px;
    font-weight: bold;
    color: white;
    background-color: #4a90e2;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.submit-button:hover {
    background-color: #357abd;
}

/* Таблица */
.table-container {
    overflow-x: auto;
    margin-top: 20px;
}

.group-table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.group-table th,
.group-table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.group-table th {
    background-color: #4a90e2;
    color: white;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 14px;
}

.group-table tr:hover {
    background-color: #f2f9ff;
}

.group-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.group-table td {
    font-size: 14px;
    color: #555;
}
</style>