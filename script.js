// Script para el proyecto web - Laboratorio Git

// Función para scroll suave
function smoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Función para animaciones al hacer scroll
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    const animatedElements = document.querySelectorAll('.service-card, .about ul');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Función para el botón CTA
function setupCTAButton() {
    const ctaButton = document.querySelector('.cta-button');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Mostrar mensaje de bienvenida
            alert('¡Bienvenido al proyecto! Este es un ejemplo de interactividad con JavaScript.');
            
            // Scroll hacia la sección "acerca"
            const aboutSection = document.querySelector('#acerca');
            if (aboutSection) {
                aboutSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

// Función para mostrar información del repositorio
function showGitInfo() {
    console.log('🚀 Proyecto Web - Laboratorio Git');
    console.log('📁 Archivos del proyecto:');
    console.log('   - index.html (Estructura HTML)');
    console.log('   - style.css (Estilos CSS)');
    console.log('   - script.js (Funcionalidad JavaScript)');
    console.log('🔧 Comandos Git utilizados:');
    console.log('   - git init');
    console.log('   - git remote add origin <url>');
    console.log('   - git branch -M main');
    console.log('   - git add .');
    console.log('   - git commit -m "mensaje"');
    console.log('   - git push origin main');
}

// Función para cambiar el color del header al hacer scroll
function headerScrollEffect() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(102, 126, 234, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            header.style.backdropFilter = 'none';
        }
    });
}

// Inicializar todas las funciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Proyecto Web cargado correctamente!');
    
    // Inicializar funcionalidades
    smoothScroll();
    animateOnScroll();
    setupCTAButton();
    headerScrollEffect();
    showGitInfo();
    
    // Mensaje de bienvenida en consola
    setTimeout(() => {
        console.log('💡 Abre las herramientas de desarrollador para ver más información sobre Git!');
    }, 2000);
});

// Función para mostrar estadísticas del proyecto
function showProjectStats() {
    const stats = {
        archivos: 3,
        lineasHTML: document.querySelector('html').innerHTML.split('\n').length,
        lineasCSS: 200, // Aproximado
        lineasJS: 100,  // Aproximado
        version: '1.0.0'
    };
    
    console.table(stats);
}

// Exportar funciones para uso global
window.projectFunctions = {
    showGitInfo,
    showProjectStats,
    smoothScroll
};