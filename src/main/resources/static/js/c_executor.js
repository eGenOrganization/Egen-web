function executeCScript(name, args) {
    const url = `/c-scripts/${name}?args=${args}`;
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
            return response.text(); // Распаковываем текст
        })
        .catch(error => {
            console.error('Критическая ошибка скрипта:', error);
            throw error; // Пробрасываем ошибку дальше
        });
}