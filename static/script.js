document.getElementById('searchForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const query = document.getElementById('query').value.trim();
    if (!query) return;

    const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    data.results.forEach(song => {
        const div = document.createElement('div');
        div.classList.add('song');
        div.innerHTML = `
            <img src="${song.image}" width="100" height="100" alt="Capa" />
            <div class="info">
                <strong>${song.name}</strong> — ${song.primaryArtists}<br>
                <audio id="audio-${song.id}" src="${song.audio_url}" controls style="display:none; width: 100%; margin-top: 5px;"></audio>
                <div class="actions">
                    <button onclick="toggleAudio('${song.id}')">▶️ Ouvir</button>
                    <button onclick="downloadSong('${song.id}', '${song.name}')">⬇️ Baixar</button>
                    <button onclick="addFavorite('${song.id}', '${song.name}')">⭐ Favorito</button>
                </div>
            </div>
        `;
        resultsDiv.appendChild(div);
    });
});

function toggleAudio(id) {
    const audio = document.getElementById(`audio-${id}`);
    if (!audio) return;

    if (audio.style.display === 'none') {
        // Esconde todos os players abertos
        document.querySelectorAll('audio').forEach(a => {
            a.pause();
            a.style.display = 'none';
        });
        audio.style.display = 'block';
        audio.play();
    } else {
        audio.pause();
        audio.style.display = 'none';
    }
}

async function downloadSong(id, name) {
    const res = await fetch(`/download?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`);
    const data = await res.json();
    if(data.status === "sucesso"){
        addHistory(name);
        alert(`Música "${name}" baixada com sucesso!`);
    } else {
        alert(`Erro ao baixar: ${data.message}`);
    }
}

function addFavorite(id, name) {
    let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favs.find(f => f.id === id)) {
        favs.push({ id, name });
        localStorage.setItem('favorites', JSON.stringify(favs));
        renderFavorites();
    }
}

function addHistory(name) {
    let hist = JSON.parse(localStorage.getItem('history') || '[]');
    hist.unshift({ name, date: new Date().toLocaleString() });
    if (hist.length > 20) hist = hist.slice(0, 20);
    localStorage.setItem('history', JSON.stringify(hist));
    renderHistory();
}

function renderFavorites() {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    const list = document.getElementById('favoritesList');
    list.innerHTML = '';
    favs.forEach(fav => {
        const li = document.createElement('li');
        li.textContent = fav.name;
        list.appendChild(li);
    });
}

function renderHistory() {
    const hist = JSON.parse(localStorage.getItem('history') || '[]');
    const list = document.getElementById('historyList');
    list.innerHTML = '';
    hist.forEach(h => {
        const li = document.createElement('li');
        li.textContent = `${h.name} (${h.date})`;
        list.appendChild(li);
    });
}

window.onload = () => {
    renderFavorites();
    renderHistory();
};
