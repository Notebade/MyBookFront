<template>
    <nav v-if="user" class="navbar">
        <ul class="nav-links">
            <li v-for="route in filteredRoutes" :key="route.path">
                <router-link :to="route.path" class="nav-link">{{ route.name }}</router-link>
            </li>
        </ul>
    </nav>
</template>

<script>
import { computed, inject } from "vue";
import { useRouter } from "vue-router";

export default {
    name: "Navigation",
    setup() {
        const router = useRouter();
        const userData = localStorage.getItem('userData');
        const user = userData ? JSON.parse(userData) : null;
        let filteredRoutes
        if (user !== null) {
            filteredRoutes = computed(() => {
                return router.options.routes.filter((route) => {
                    if (!route.meta || !route.meta.showInNav) return false; // Только маршруты с meta.showInNav
                    if (route.meta.requiresAdmin && (!user || !user.rights.some(r => r.code === "admin"))) {
                        return false; // Проверка прав для admin
                    }
                    return true; // Отобразить маршрут
                });
            });
        }

        return {
            filteredRoutes,
            user,
        };
    },
};
</script>

<style>
.navbar {
    display: flex;
    background-color: #007bff;
    padding: 10px;
}

.nav-links {
    list-style: none;
    display: flex;
    margin: 0;
    padding: 0;
}

.nav-link {
    color: white;
    text-decoration: none;
    padding: 10px 15px;
    margin-right: 10px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.nav-link:hover {
    background-color: #555;
}
</style>