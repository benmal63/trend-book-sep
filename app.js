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

            // Handle Weekly Analysis
            const analysisSection = document.getElementById('weekly-analysis');
            const analysisContent = document.getElementById('analysis-content');

            if (selectedWeek.analyse_hebdo && Object.keys(selectedWeek.analyse_hebdo).length > 0) {
                analysisSection.style.display = 'block';
                let html = '';
                for (const [theme, text] of Object.entries(selectedWeek.analyse_hebdo)) {
                    html += `<div style="margin-bottom: 15px;">
                                <h4 style="margin: 0 0 5px 0; color: #fff; font-size: 0.9rem; text-transform: uppercase;">${theme}</h4>
                                <p style="margin: 0; color: #a0aec0;">${text}</p>
                             </div>`;
                }
                analysisContent.innerHTML = html;
            } else {
                analysisSection.style.display = 'none';
                analysisContent.innerHTML = '';
            }

            renderCards(currentWeekTrends);
        }
    }

    // Render Cards Function
    function renderCards(trends) {
        grid.innerHTML = '';
        trends.forEach((trend, index) => {
            const card = document.createElement('div');
            card.className = 'trend-card';
            // Staggered animation delay
            card.style.animationDelay = `${index * 0.05}s`;
            card.innerHTML = `
                <div class="card-content" style="padding: 25px;">
                    <span class="card-tag" style="position: static; display: inline-block; margin-bottom: 12px; font-size: 0.75rem;">${trend.thematique}</span>
                    <h3 style="margin-top: 0; font-size: 1.1rem; line-height: 1.4;">${trend.titre}</h3>
                    <p style="font-size: 0.9rem; color: #a0aec0; margin-bottom: 20px;">${trend.resume}</p>
                    <div class="card-footer" style="margin-top: auto;">
                        <button class="btn-insight" data-id="${index}" style="padding: 8px 15px; font-size: 0.8rem;">Analyse SEP</button>
                        <a href="${trend.lien}" class="source-link" target="_blank" style="font-size: 0.8rem;">Source : ${trend.source_nom} ↗</a>
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
