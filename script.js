// Cargar datos y renderizar la página
async function loadData() {
    try {
        const response = await fetch('data.json');
        const months = await response.json();
        renderTimeline(months);
        initScrollAnimations();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('timeline').innerHTML = 
            '<p class="loading">Error al cargar los datos</p>';
    }
}

// Renderizar la línea de tiempo con todos los meses
function renderTimeline(months) {
    const timeline = document.getElementById('timeline');
    
    months.forEach(month => {
        const section = createMonthSection(month);
        timeline.appendChild(section);
    });
}

// Crear sección de un mes
function createMonthSection(month) {
    const section = document.createElement('section');
    section.className = 'month-section';
    
    // Header del mes (título + subtítulo)
    const header = document.createElement('div');
    header.className = 'month-header';
    
    const title = document.createElement('h2');
    title.className = 'month-title';
    title.textContent = month.mes;
    header.appendChild(title);
    
    // Subtítulo (si existe)
    if (month.subtitulo && month.subtitulo.trim() !== '') {
        const subtitle = document.createElement('p');
        subtitle.className = 'month-subtitle';
        subtitle.textContent = month.subtitulo;
        header.appendChild(subtitle);
    }
    
    section.appendChild(header);
    
    // Grid de medios (fotos/videos)
    if (month.media && month.media.length > 0) {
        const grid = document.createElement('div');
        grid.className = 'media-grid';
        
        month.media.forEach(mediaPath => {
            const item = createMediaItem(mediaPath);
            grid.appendChild(item);
        });
        
        section.appendChild(grid);
    }
    
    // Texto del mes
    if (month.texto && month.texto.trim() !== '') {
        const textDiv = document.createElement('div');
        textDiv.className = 'month-text';
        
        // Dividir el texto en párrafos si contiene saltos de línea
        const paragraphs = month.texto.split('\n\n').filter(p => p.trim() !== '');
        paragraphs.forEach(paragraph => {
            const p = document.createElement('p');
            p.textContent = paragraph.trim();
            textDiv.appendChild(p);
        });
        
        section.appendChild(textDiv);
    }
    
    return section;
}

// Crear item de media (imagen/video/gif)
function createMediaItem(mediaPath) {
    const item = document.createElement('div');
    item.className = 'media-item';
    
    const extension = mediaPath.split('.').pop().toLowerCase();
    
    if (extension === 'mp4' || extension === 'webm' || extension === 'mov') {
        // Video
        const video = document.createElement('video');
        video.src = mediaPath;
        video.controls = true;
        video.preload = 'metadata';
        video.setAttribute('playsinline', '');
        video.muted = true; // Muted para permitir autoplay
        video.loop = true; // Loop para que se repita
        item.appendChild(video);
    } else {
        // Imagen o GIF
        const img = document.createElement('img');
        img.src = mediaPath;
        img.alt = 'Memoria';
        img.loading = 'lazy';
        item.appendChild(img);
    }
    
    return item;
}

// Inicializar animaciones de scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    // Observer para secciones completas
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animar items de media dentro de la sección
                const mediaItems = entry.target.querySelectorAll('.media-item');
                mediaItems.forEach(item => {
                    item.classList.add('visible');
                });
                
                // Animar texto
                const text = entry.target.querySelector('.month-text');
                if (text) {
                    text.classList.add('visible');
                }
            }
        });
    }, observerOptions);
    
    // Observer para videos (autoplay cuando son visibles)
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Play video cuando es visible
                video.play().catch(err => {
                    console.log('Autoplay prevented:', err);
                });
            } else {
                // Pause video cuando no es visible
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // El video debe estar al menos 50% visible
    });
    
    // Observar todas las secciones de meses
    const sections = document.querySelectorAll('.month-section');
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Observar todos los videos
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        videoObserver.observe(video);
    });
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadData);
