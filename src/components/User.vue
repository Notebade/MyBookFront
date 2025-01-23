<template>
    <div class="user-profile">
      <h1>Профиль пользователя</h1>
      <div class="user-info">
        <p><strong>Имя:</strong> {{ userData?.fullName || 'Не указано' }}</p>
        <p><strong>Логин:</strong> {{ userData?.login || 'Не указано' }}</p>
        <p><strong>Email:</strong> {{ userData?.email || 'Не указано' }}</p>
        <p><strong>Активен:</strong> {{ userData?.active ? 'Да' : 'Нет' }}</p>
        <p><strong>Группа:</strong> {{ userData?.group?.name || 'Нет группы' }}</p>
        <p><strong>Права:</strong> 
          {{ userData?.rights?.length ? userData.rights.map(r => r.name).join(', ') : 'Нет прав' }}
        </p>
      </div>
  
      <!-- Кнопка создания приглашения, если пользователь имеет права администратора -->
      <button v-if="isAdmin" @click="toggleInviteCreation" class="btn">
        Панель администратора
      </button>

    </div>
</template>

<script>
import { inject, ref, onMounted, computed } from 'vue';

export default {
  setup() {
    const apiClient = inject("apiClient");
    const userData = ref(JSON.parse(localStorage.getItem('userData')) || {});
    const roles = ref([]);
    const groups = ref([]);
    const selectedRoles = ref([]);
    const selectedGroup = ref('');
    const expiryDate = ref('');
    const showInviteForm = ref(false);
    const inviteLink = ref('');

    // Проверка на права администратора
    const isAdmin = computed(() => {
      return userData.value?.rights?.some(r => r.code === 'admin');
    });

    // Загрузка данных для селекторов
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

    // Переключение формы создания приглашения
    const toggleInviteCreation = () => {
      window.location.replace('/admin')
    };

    // Создание приглашения
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

    // Метод для копирования ссылки
    const copyInviteLink = () => {
      navigator.clipboard.writeText(inviteLink.value).then(() => {
        alert('Ссылка скопирована в буфер обмена!');
      });
    };

    // Загрузка данных при монтировании компонента
    onMounted(() => {
      loadSelectorsData();
    });

    return {
      userData,
      roles,
      groups,
      selectedRoles,
      selectedGroup,
      expiryDate,
      isAdmin,
      showInviteForm,
      toggleInviteCreation,
      createInvite,
      inviteLink,
      copyInviteLink,
    };
  },
};
</script>

<style scoped>
.user-profile {
  max-width: 600px;
  margin: 0 auto;
}
.user-info {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.invite-form {
  background-color: #f1f1f1;
  padding: 20px;
  border-radius: 8px;
}
.btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}
.btn:hover {
  background-color: #0056b3;
}
.invite-link {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.invite-link input {
  flex: 1;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.invite-link button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}
.invite-link button:hover {
  background-color: #218838;
}
</style>
