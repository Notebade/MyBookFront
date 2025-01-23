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
            <button @click="setActiveForm('invite')" :class="{ active: activeForm === 'invite' }" class="toggle-button">
                Создание приглашения
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
                    <button class="submit-button"> {{ isGroupSelected ? "Обновить" : "Сохранить" }} группу</button>
                    <button class="submit-button" v-if="isGroupSelected" @click="deleteGroups"
                        style="margin-left: 2%; background-color: rgb(357,80,94);">Удалить
                        группу</button>
                    <button v-if="isGroupSelected" @click="clearForms" class="submit-button"
                        style="margin-top: 2%;">Очистить группу</button>
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
                <div class="table-container">
                    <table class="group-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>ФИО</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr @click="activeUser(user.id)" v-for="user in formElementsUsers" :key="user.id">
                                <td>{{ user.id }}</td>
                                <td>{{ user.fullName }}</td>
                                <td>{{ user.active }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div v-if="activeForm === 'invite'" class="form">
                <h2 class="form-title">Создание приглашения</h2>
                <div class="form-group">
                    <label for="roles" class="form-label">Выберите роли:</label>
                    <select id="roles" class="form-select" multiple v-model="selectedRoles">
                        <option v-for="role in roles" :key="role.id" :value="role">
                            {{ role.name }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="group" class="form-label">Выберите группу:</label>
                    <select id="group" class="form-select" v-model="selectedGroup">
                        <option v-for="group in groups" :key="group.id" :value="group">
                            {{ group.name }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="expiry" class="form-label">Дата истечения приглашения:</label>
                    <input type="date" id="expiry" class="form-input" v-model="expiryDate" />
                </div>

                <button class="btn-primary" @click="createInvite">Создать</button>

                <div v-if="inviteLink" class="invite-link">
                    <p><strong>Ссылка для приглашения:</strong></p>
                    <input type="text" class="form-input readonly" :value="inviteLink" readonly />
                    <button class="btn-secondary" @click="copyInviteLink">Скопировать</button>
                </div>
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
        const formElementsUsers = ref([]);
        const selectedRoles = ref([]);
        const selectedGroup = ref('');
        const selectedGroups = ref(false);
        const inviteLink = ref('');
        const expiryDate = ref('');

        const roles = ref([]);
        const groups = ref([]);

        const group = ref({
            id: null,
            code: "",
            name: "",
        });
        const isGroupSelected = computed(() => selectedGroups.value);

        const setActiveForm = async (form) => {
            activeForm.value = form;
            switch (activeForm.value) {
                case 'groups':
                    await loadGroups();
                    break;

                case 'users':
                    await loadUsers();
                    break;

                default:
                    await loadSelectorsData();
                    break;
            }
        };

        const loadSelectorsData = async () => {
            try {
                const rolesResponse = await apiClient.post('/list/rights');
                const groupsResponse = await apiClient.post('/list/groups');
                roles.value = rolesResponse.data;
                groups.value = groupsResponse.data;
            } catch (error) {
                console.error('Ошибка загрузки данных для селекторов:', error);
            }
        };

        const loadGroups = async () => {
            try {
                const response = await apiClient.post("/list/groups");
                formElements.value = response.data;
            } catch (error) {
                console.error("Ошибка загрузки групп:", error);
            }
        };

        const loadUsers = async () => {
            try {
                const response = await apiClient.post("/list/users", { active: false });
                formElementsUsers.value = response.data;
            } catch (error) {
                console.error("Ошибка загрузки групп:", error);
            }
        };

        const clearForms = () => {
            selectedGroups.value = false
            group.value = ref({
                id: null,
                code: "",
                name: "",
            });
        };

        const createInvite = async () => {
            if (!selectedRoles.value.length || !selectedGroup.value || !expiryDate.value) {
                alert('Пожалуйста, выберите роли, группу и укажите дату истечения.');
                return;
            }

            const inviteData = {
                info: {
                    rights: selectedRoles.value,
                    group: selectedGroup.value,
                },
                dateEnd: expiryDate.value,
            };

            try {
                const response = await apiClient.post('/user/zov', inviteData);
                const inviteCode = response.data.code;

                // Формирование ссылки
                const domain = window.location.origin; // Использует текущий домен
                inviteLink.value = `${domain}/registration?invite=${inviteCode}`;

                alert('Приглашение успешно создано!');
                // Очистка выбора
                selectedRoles.value = [];
                selectedGroup.value = '';
                expiryDate.value = '';
            } catch (error) {
                console.error('Ошибка при создании приглашения:', error);
                alert('Не удалось создать приглашение.');
            }
        };

        const activeUser = async (id) => {
            try {
                let response;
                if (id != null) {
                    response = await apiClient.get("/user/" + id + "/active");
                }
                await loadUsers();
            } catch (error) {
                console.error("Ошибка сохранения групп:", error);
            }
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
        const copyInviteLink = () => {
            navigator.clipboard.writeText(inviteLink.value).then(() => {
                alert('Ссылка скопирована в буфер обмена!');
            });
        };
        const selectGroup = async (id) => {
            selectedGroups.value = true
            const response = await apiClient.get("/groups/" + id);
            group.value = response.data;
        };
        const deleteGroups = async () => {
            try {
                let response;
                if (group.value.id !== null) {
                    response = await apiClient.delete("/groups/" + group.value.id);
                }
                clearForms();
                await loadGroups();
            } catch (error) {
                console.error("Ошибка сохранения групп:", error);
            }
        }
        onMounted(async () => {
            await loadGroups();
        });
        return {
            activeForm,
            group,
            selectedGroup,
            formElements,
            isGroupSelected,
            saveGroups,
            selectGroup,
            setActiveForm,
            clearForms,
            deleteGroups,
            loadUsers,
            formElementsUsers,
            activeUser,
            createInvite,
            inviteLink,
            copyInviteLink,
            loadSelectorsData,
            groups,
            roles,
            selectedGroups,
            selectedRoles,
            expiryDate,
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

/* Стили для группы элементов */
.form-group {
    margin-bottom: 20px;
}

/* Стили для меток */
.form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    font-size: 14px;
    color: #333;
}

/* Стили для выпадающих списков */
.form-select {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #fff;
    box-sizing: border-box;
    transition: border-color 0.3s;
}

.form-select:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 4px rgba(0, 123, 255, 0.5);
}

/* Стили для текстового ввода */
.form-input {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    transition: border-color 0.3s;
}

.form-input:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 4px rgba(0, 123, 255, 0.5);
}

/* Стили для кнопок */
.btn-primary {
    padding: 10px 20px;
    font-size: 14px;
    color: #fff;
    background-color: #007bff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-primary:hover {
    background-color: #0056b3;
}

.btn-secondary {
    padding: 10px 20px;
    font-size: 14px;
    color: #fff;
    background-color: #6c757d;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-secondary:hover {
    background-color: #565e64;
}

/* Стили для поля только для чтения */
.readonly {
    background-color: #e9ecef;
    cursor: not-allowed;
}

/* Стили для блока с ссылкой */
.invite-link {
    margin-top: 20px;
    padding: 10px;
    background-color: #e9ecef;
    border: 1px dashed #ccc;
    border-radius: 4px;
}
</style>