document.addEventListener('DOMContentLoaded', () => {

    const grid = document.getElementById('trends-grid');
    const filters = document.querySelectorAll('.filters li');
    const modal = document.getElementById('trend-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');
    const weekSelector = document.getElementById('week-selector');
    const pageTitle = document.querySelector('.top-bar h2');

    let allWeeksData = [];
    let currentWeekTrends = [];

    // Fetch JSON Data (now an array of weeks)
    fetch('database.json')
        .then(response => response.json())
        .then(data => {
            allWeeksData = data.semaines;

            // Populate Week Selector Dropdown
            populateWeekSelector(allWeeksData);

            // Load the most recent week by default (last in array but rendered first)
            if (allWeeksData.length > 0) {
                const latestWeek = allWeeksData[allWeeksData.length - 1];
                weekSelector.value = latestWeek.id;
                loadWeek(latestWeek.id);
            }
        })
        .catch(err => console.error("Erreur de chargement JSON:", err));

    // Populate the dropdown
    function populateWeekSelector(semaines) {
        weekSelector.innerHTML = '';
        // Reverse so the newest week is at the top of the dropdown
        [...semaines].reverse().forEach(semaine => {
            const option = document.createElement('option');
            option.value = semaine.id;
            option.textContent = semaine.date_label;
            weekSelector.appendChild(option);
        });
    }

    // Handle Week Change
    weekSelector.addEventListener('change', (e) => {
        loadWeek(e.target.value);
    });

    // Load specific week data
    function loadWeek(weekId) {
        const selectedWeek = allWeeksData.find(s => s.id === weekId);
        if (selectedWeek) {
            currentWeekTrends = selectedWeek.ressources;
            pageTitle.textContent = `Archives : ${selectedWeek.date_label}`;

            // Reset theme filter to 'all' when changing weeks
            filters.forEach(f => f.classList.remove('active'));
            document.querySelector('[data-filter="all"]').classList.add('active');

            renderCards(currentWeekTrends);
        }
    }

    // Render Cards Function
    function renderCards(trends) {
        grid.innerHTML = '';
        trends.forEach((trend, index) => {
            const card = document.createElement('div');
            card.className = 'trend-card';
            card.innerHTML = `
                <div class="card-image" style="background-image: url('${trend.image}')">
                    <span class="card-tag">${trend.thematique}</span>
                </div>
                <div class="card-content">
                    <h3>${trend.titre}</h3>
                    <p>${trend.resume}</p>
                    <div class="card-footer">
                        <button class="btn-insight" data-id="${index}">Analyse SEP</button>
                        <a href="${trend.lien}" class="source-link" target="_blank">Source : ${trend.source_nom} ↗</a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Add event listeners to new buttons
        document.querySelectorAll('.btn-insight').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                openModal(trends[id]);
            });
        });
    }

    // Filter Logic (Themes)
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class
            filters.forEach(f => f.classList.remove('active'));
            // Add active class
            filter.classList.add('active');

            const filterValue = filter.getAttribute('data-filter');

            if (filterValue === 'all') {
                renderCards(currentWeekTrends);
            } else {
                const filteredTrends = currentWeekTrends.filter(t => t.thematique === filterValue);
                renderCards(filteredTrends);
            }
        });
    });

    // Modal Logic
    function openModal(trend) {
        modalBody.innerHTML = `
            <h3>Analyse pour mon SEP</h3>
            <h2>${trend.titre}</h2>
            <h4>Le Fait</h4>
            <p>${trend.resume}</p>
            <h4>Lien avec SPORTFIVE (Brand Services)</h4>
            <p style="color: #fff; font-weight: 300;">${trend.analyse_sep}</p>
            <a href="${trend.lien}" target="_blank" style="display: inline-block; margin-top: 1.5rem; color: #ff0033; text-decoration: none; font-weight: bold;">➡️ Consulter la Source : ${trend.source_nom} ↗</a>
            <p style="margin-top: 2rem; font-size: 0.8rem; color: #888;">Ajouté le ${trend.date}</p>
        `;
        modal.style.display = 'flex';
    }

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

});
