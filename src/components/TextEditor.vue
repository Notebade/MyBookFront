<template>
    <div class="editor-container">
        <!-- Левая часть: Форма -->
        <div class="editor-form">
            <h2>Редактор текста</h2>
            <form @submit.prevent="textSend">
                <div class="form-group">
                    <label for="content">Текст</label>
                    <textarea id="content" v-model="text.text" class="form-textarea"
                        placeholder="Введите текст"></textarea>
                </div>
                <button class="form-button">{{ !text.id ? "Добавить" : "Обновить" }} абзац</button>
            </form>
            <br>
            <button @click="deleteText" v-if="text.id" class="delete-button">Удалить абзац</button>
            <br>
            <br>
            <button @click="clear" v-if="text.id" class="form-button">Очистить</button>
        </div>

        <!-- Правая часть: Контент -->
        <div class="editor-preview">
            <h2>Контент</h2>
            <div @click="selectText(index)" v-for="(item, index) in formItems" :key="index" class="preview-item">
                <strong>Абзац №{{ index + 1 }}:</strong> {{ item.text }}
            </div>
        </div>
    </div>
</template>

<script>
import apiClient from '@/ApiClient';
import { result } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import { inject, ref, onMounted, computed } from 'vue';
export default {
    setup() {
        const url = window.location.href;
        const temeId = url.split("/").pop();
        const isEddit = ref(false);
        const text = ref({
            id: null,
            position: 1,
            text: "",
            theme_id: temeId,
        });
        const formItems = ref([cloneDeep(text)]);

        const loadText = async () => {
            const response = apiClient.get('/theme/' + temeId)
            formItems.value = (await response).data.text;
        };

        const selectText = async (index) => {
            isEddit.value = true;
            text.value = formItems.value[index];
        };

        const clear = () => {
            isEddit.value = false;
            text.value = {
                id: null,
                position: 1,
                text: "",
                theme_id: temeId,
            }
        }

        const deleteText = async () => {
            try {
                response = await apiClient.delete("/text/" + text.value.id);
            } catch (error) {
            }
            await loadText();
            clear();
        };
        const textSend = async () => {
            try {
                let response;
                if (text.value.id == null || !isEddit) {
                    response = await apiClient.post("/text", {
                        ...text.value,
                        position: Array.isArray(formItems.value) ? formItems.value.length + 1 : 1,
                    });
                } else {
                    response = await apiClient.put(`/text/${text.value.id}`, {
                        ...text.value,
                        theme_id: temeId,
                    });
                }
            } catch (error) {
            }
            await loadText();
            clear();
        };

        onMounted(async () => {
            await loadText();
        });
        return {
            textSend,
            formItems,
            text,
            selectText,
            clear,
            deleteText,
            isEddit,
        };
    },
};
</script>

<style>
.editor-container {
    display: flex;
    gap: 2rem;
    padding: 2rem;
    font-family: Arial, sans-serif;
}

/* Стили формы */
.editor-form {
    flex: 1;
    padding: 1.5rem;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.editor-form h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
}

.form-textarea {
    height: 150px;
    resize: vertical;
}

/* Стили контента */
.editor-preview {
    flex: 1;
    padding: 1.5rem;
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.editor-preview h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.preview-item {
    margin-bottom: 1rem;
    font-size: 1rem;
    line-height: 1.5;
}

.preview-item strong {
    color: #333;
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
</style>