
document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM Elements ---
    const eventsContainer = document.getElementById('events-container');
    const lastUpdatedSpan = document.getElementById('last-updated');
    const ticketModal = document.getElementById('ticket-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const addEventModal = document.getElementById('add-event-modal');
    const addEventBtn = document.getElementById('add-event-btn');
    const addEventModalCloseBtn = document.getElementById('add-event-modal-close-btn');
    const addEventForm = document.getElementById('add-event-form');
    const formTitle = document.getElementById('form-title');
    const formDescription = document.getElementById('form-description');
    const formContent = document.getElementById('form-content');
    const formSuccessMessage = document.getElementById('form-success-message');
    const styleFilter = document.getElementById('style-filter');
    const cityFilter = document.getElementById('city-filter');
    const costFilter = document.getElementById('cost-filter');
    const costValueSpan = document.getElementById('cost-value');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const themeSwitcher = document.getElementById('theme-switcher');
    const themeIcon = document.getElementById('theme-icon');

    // --- State ---
    let originalAgenda = [];
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // --- Theme Control ---
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.documentElement.classList.add('light-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            document.documentElement.classList.remove('light-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        currentTheme = theme;
        localStorage.setItem('theme', theme);
    };

    themeSwitcher.addEventListener('click', () => {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // --- Modal Functions ---
    const showTicketModal = () => ticketModal.classList.remove('hidden');
    const hideTicketModal = () => ticketModal.classList.add('hidden');
    modalCloseBtn.addEventListener('click', hideTicketModal);
    ticketModal.addEventListener('click', (e) => { if (e.target === ticketModal) hideTicketModal(); });

    const showAddEventModal = (isCorrection = false, eventData = null) => {
        formContent.style.display = 'block';
        formSuccessMessage.classList.add('hidden');
        addEventForm.reset();

        const correctionFlagInput = document.getElementById('correction-flag');
        const originalTitleInput = document.getElementById('original-event-title');

        if (isCorrection && eventData) {
            formTitle.textContent = 'Sugerir una Corrección';
            formDescription.textContent = 'Gracias por ayudarnos a mantener la agenda actualizada. Por favor, corrige la información necesaria.';
            
            addEventForm.querySelector('[name="entry.123456789"]').value = eventData.title;
            addEventForm.querySelector('[name="entry.234567890"]').value = eventData.organizer;
            addEventForm.querySelector('[name="entry.345678901"]').value = eventData.date;
            const locationString = `${eventData.location.name}, ${eventData.location.street}`;
            addEventForm.querySelector('[name="entry.456789012"]').value = locationString;
            addEventForm.querySelector('[name="entry.567890123"]').value = eventData.styles.join(', ');
            addEventForm.querySelector('[name="entry.678901234"]').value = eventData.cost;
            addEventForm.querySelector('[name="entry.789012345"]').value = eventData.socialMedia;
            addEventForm.querySelector('[name="entry.890123456"]').value = eventData.ticketLink;

            correctionFlagInput.value = 'CORRECCIÓN SOLICITADA';
            originalTitleInput.value = eventData.title;
        } else {
            formTitle.textContent = 'Publica tu Evento';
            formDescription.textContent = 'Completa el formulario para que tu evento aparezca en la agenda. Lo revisaremos y publicaremos a la brevedad.';
            correctionFlagInput.value = 'NUEVO EVENTO';
            originalTitleInput.value = '';
        }

        addEventModal.classList.remove('hidden');
    };
    const hideAddEventModal = () => addEventModal.classList.add('hidden');
    addEventBtn.addEventListener('click', () => showAddEventModal(false));
    addEventModalCloseBtn.addEventListener('click', hideAddEventModal);
    addEventModal.addEventListener('click', (e) => { if (e.target === addEventModal) hideAddEventModal(); });

    // --- Add Event Form Submission ---
    addEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(addEventForm);
        const googleFormActionURL = '[https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse](https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse)';
        fetch(googleFormActionURL, { method: 'POST', body: formData, mode: 'no-cors' })
            .then(() => {
                formContent.style.display = 'none';
                formSuccessMessage.classList.remove('hidden');
                setTimeout(hideAddEventModal, 3000);
            }).catch(error => {
                console.error('Error submitting form:', error);
                alert('Hubo un error al enviar el formulario.');
            });
    });

    // --- Calendar File Generator ---
    const generateICS = (event) => {
        const title = event.title;
        const now = new Date();
        const year = now.getFullYear();
        const dateParts = event.date.split(' ');
        const day = dateParts[1];
        const monthName = dateParts[3];
        const monthMap = { "Enero": "01", "Febrero": "02", "Marzo": "03", "Abril": "04", "Mayo": "05", "Junio": "06", "Julio": "07", "Agosto": "08", "Septiembre": "09", "Octubre": "10", "Noviembre": "11", "Diciembre": "12" };
        const month = monthMap[monthName] || '01';
        const startTime = event.time.split(' - ')[0].replace(':', '');
        const endTime = event.time.split(' - ')[1].replace(':', '');
        const startDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}T${startTime}00`;
        const endDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}T${endTime}00`;
        const locationString = `${event.location.name}, ${event.location.street}, ${event.location.city}`;
        const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${startDate}-${Math.random().toString(36).substr(2, 9)}@dance-agenda.com\nDTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '')}\nDTSTART:${startDate}\nDTEND:${endDate}\nSUMMARY:${title}\nDESCRIPTION:Organizado por ${event.organizer}. Estilos: ${event.styles.join(', ')}. Coste: ${event.cost}\nLOCATION:${locationString}\nEND:VEVENT\nEND:VCALENDAR`;
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${title}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // --- Style Color Logic ---
    const getStyleColor = (style) => {
        const s = style.toLowerCase();
        if (s.includes('bachata')) return 'bg-blue-500 text-white';
        if (s.includes('salsa')) return 'bg-red-500 text-white';
        if (s.includes('kizomba')) return 'bg-purple-500 text-white';
        if (s.includes('tango')) return 'bg-orange-500 text-white';
        if (s.includes('zouk')) return 'bg-green-500 text-white';
        return 'bg-gray-500 text-white';
    };

    // --- Render Events Function ---
    const renderEvents = (agenda) => {
        eventsContainer.innerHTML = '';
        if (!agenda || agenda.every(week => week.events.length === 0)) {
            eventsContainer.innerHTML = `<p class="text-center text-muted">No se encontraron eventos con los filtros seleccionados.</p>`;
            return;
        }

        agenda.forEach((week) => {
            if (week.events.length === 0) return;
            const weekTitleHtml = `<h2 class="text-3xl font-bold mb-6 text-[color:var(--text-color)] border-l-4 border-[color:var(--accent-color)] pl-4">${week.title}</h2>`;
            let eventsHtml = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">';
            week.events.forEach((event) => {
                const stylesHtml = event.styles.map(style => `<span class="style-badge ${getStyleColor(style)}">${style}</span>`).join(' ');
                const locationString = `${event.location.name}, ${event.location.street}`;
                
                const imageHtml = event.imageUrl ? `<img src="${event.imageUrl}" alt="Imagen de ${event.title}" class="event-image" onerror="this.style.display='none'">` : '';
                const descriptionHtml = event.description ? `<p class="text-muted mt-3 italic">"${event.description}"</p>` : '';
                const instructorsHtml = (event.instructors && event.instructors.length > 0) ? `<p class="text-muted"><i class="fa-solid fa-chalkboard-user w-5 text-[color:var(--accent-color)]"></i> Instructores: ${event.instructors.map(i => i.name).join(', ')}</p>` : '';
                const djsHtml = (event.djs && event.djs.length > 0) ? `<p class="text-muted"><i class="fa-solid fa-compact-disc w-5 text-[color:var(--accent-color)]"></i> DJs: ${event.djs.map(dj => dj.name).join(', ')}</p>` : '';
                const sourceHtml = event.source ? `<div class="mt-4 pt-2 card-border flex justify-between items-center"><a href="${event.source.url}" target="_blank" class="text-xs text-gray-500 hover:text-[color:var(--accent-color)] transition-colors"><i class="fa-solid fa-globe w-4"></i> Fuente: ${event.source.name}</a><button class="correction-btn text-xs text-gray-500 hover:text-[color:var(--accent-color)] transition-colors"><i class="fa-solid fa-flag mr-1"></i> ¿Algo no está bien?</button></div>` : '';

                eventsHtml += `
                    <div class="event-card rounded-lg shadow-md ${event.featured ? 'featured' : ''}" data-event-id="${event.id}">
                        ${event.featured ? '<div class="featured-badge">Destacado</div>' : ''}
                        ${imageHtml}
                        <div class="p-6 flex-grow flex flex-col">
                            <p class="date-badge font-bold text-sm px-3 py-1 rounded-full self-start mb-4">${event.date}</p>
                            <h3 class="font-bold text-xl mb-2">${event.title}</h3>
                            <div class="flex flex-wrap gap-2 my-3">${stylesHtml}</div>
                            ${descriptionHtml}
                            <div class="mt-4 space-y-2 flex-grow">
                                <p class="text-muted"><i class="fa-solid fa-location-dot w-5 text-[color:var(--accent-color)]"></i> ${locationString}</p>
                                <p class="text-muted"><i class="fa-solid fa-clock w-5 text-[color:var(--accent-color)]"></i> ${event.time}</p>
                                <p class="text-muted"><i class="fa-solid fa-user-friends w-5 text-[color:var(--accent-color)]"></i> Organiza: ${event.organizer}</p>
                                ${instructorsHtml}
                                ${djsHtml}
                                <p class="font-semibold"><i class="fa-solid fa-money-bill-wave w-5 text-[color:var(--accent-color)]"></i> ${event.cost}</p>
                            </div>
                            ${sourceHtml}
                            <div class="mt-6 pt-4 card-border grid grid-cols-2 gap-3">
                                <a href="${event.socialMedia}" target="_blank" class="action-btn font-semibold py-2 px-3 rounded-lg"><i class="fab fa-instagram mr-2"></i>Instagram</a>
                                <button class="action-btn calendar-btn font-semibold py-2 px-3 rounded-lg"><i class="fa-solid fa-calendar-plus mr-2"></i>Agendar</button>
                                <a href="${event.ticketLink}" target="_blank" class="action-btn ticket-btn primary font-semibold py-2 px-3 rounded-lg col-span-2"><i class="fa-solid fa-ticket mr-2"></i>Entradas</a>
                            </div>
                        </div>
                    </div>`;
            });
            eventsHtml += '</div>';
            eventsContainer.innerHTML += weekTitleHtml + eventsHtml;
        });
    };

    // --- Filter Logic ---
    const applyFilters = () => {
        const selectedStyle = styleFilter.value;
        const selectedCity = cityFilter.value;
        const maxCost = parseInt(costFilter.value, 10);
        const filteredAgenda = originalAgenda.map(week => ({
            ...week,
            events: week.events.filter(event => {
                const costMatch = event.cost.match(/\d+/);
                const eventCost = costMatch ? parseInt(costMatch[0], 10) : 0;
                const styleMatch = !selectedStyle || event.styles.includes(selectedStyle);
                const cityMatch = !selectedCity || event.location.city === selectedCity;
                const costMatchResult = eventCost <= maxCost;
                return styleMatch && cityMatch && costMatchResult;
            })
        }));
        renderEvents(filteredAgenda);
    };

    // --- Populate Filters ---
    const populateFilters = (agenda) => {
        const allStyles = new Set();
        const allCities = new Set();
        agenda.forEach(week => week.events.forEach(event => {
            event.styles.forEach(style => allStyles.add(style));
            allCities.add(event.location.city);
        }));
        
        styleFilter.innerHTML = `<option value="">Todos los Estilos</option>`;
        allStyles.forEach(style => {
            const option = document.createElement('option');
            option.value = style;
            option.textContent = style;
            styleFilter.appendChild(option);
        });

        cityFilter.innerHTML = `<option value="">Todas las Ciudades</option>`;
        allCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            cityFilter.appendChild(option);
        });
    };
    
    // --- Main Click Handler for dynamic cards ---
    eventsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('a.action-btn, button.action-btn, button.correction-btn');
        if (!target) return;
        const card = target.closest('.event-card');
        if (!card) return;
        
        const eventId = card.dataset.eventId;
        let eventData = null;
        for (const week of originalAgenda) {
            const foundEvent = week.events.find(ev => ev.id === eventId);
            if (foundEvent) {
                eventData = foundEvent;
                break;
            }
        }

        if (!eventData) {
            console.error('Event data not found for ID:', eventId);
            return;
        }

        if (target.classList.contains('calendar-btn')) {
            e.preventDefault();
            generateICS(eventData);
        } else if (target.classList.contains('ticket-btn')) {
            if (!eventData.ticketLink || eventData.ticketLink === '#') {
                e.preventDefault();
                showTicketModal();
            }
        } else if (target.classList.contains('correction-btn')) {
            e.preventDefault();
            showAddEventModal(true, eventData);
        }
    });

    // --- Initial Fetch ---
    fetch('data/current-events.json')
        .then(response => {
            if (!response.ok) throw new Error('No se pudo encontrar data/current-events.json.');
            return response.json();
        })
        .then(data => {
            data.agenda.forEach((week, weekIndex) => {
                week.events.forEach((event, eventIndex) => {
                    event.id = `event-${weekIndex}-${eventIndex}`;
                });
            });
            originalAgenda = data.agenda;
            
            applyTheme(currentTheme);
            
            lastUpdatedSpan.textContent = data.lastUpdated || '';

            populateFilters(originalAgenda);
            renderEvents(originalAgenda);

            styleFilter.addEventListener('change', applyFilters);
            cityFilter.addEventListener('change', applyFilters);
            costFilter.addEventListener('input', () => {
                costValueSpan.textContent = `€${costFilter.value}`;
            });
            costFilter.addEventListener('change', applyFilters);
            resetFiltersBtn.addEventListener('click', () => {
                styleFilter.value = '';
                cityFilter.value = '';
                costFilter.value = 50;
                costValueSpan.textContent = `€50`;
                renderEvents(originalAgenda);
            });
        })
        .catch(error => {
            console.error('Error al cargar los eventos:', error);
            eventsContainer.innerHTML = `<p class="text-center text-red-400">${error.message}</p>`;
        });
});