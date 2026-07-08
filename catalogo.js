/**
 * SISTEMA VIOLETT - CATÁLOGO WEB
 * Optimizado para lectura pública de inventario.
 */

// 1. REEMPLAZA CON LA MISMA URL DE TU APPS SCRIPT
const API_URL = 'https://script.google.com/macros/s/AKfycbw47nf3nOhFYOQVbuK8TJnnhCPfTSPd5fiudvKs7La9EhVf-_9_Zd6qEzamQv8n-rZL/exec';

// 2. COLOCA EL NÚMERO DE WHATSAPP DONDE SE RECIBIRÁN LOS PEDIDOS (Con código de país, ej: 52 para México)
const TELEFONO_VENTAS = '52XXXXXXXXXX'; // <-- ¡Reemplaza con el número real de Atziri!

// Estado de la aplicación
let catalogoData = [];

// Imagen por defecto (SVG Morado)
const DEFAULT_IMAGE_BASE64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQjc3NEY1IiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik02IDJMMyA2djE0YTIgMiAwIDAgMCAyIDJoMTRhMiAyIDAgMCAwIDItMlY2bC0zLTR6Ij48L3BhdGg+PGxpbmUgeDE9IjMiIHkxPSI2IiB4Mj0iMjEiIHkyPSI2Ij48L2xpbmU+PHBhdGggZD0iTTE2IDEwYTQgNCAwIDAgMS04IDAiPjwvcGF0aD48L3N2Zz4=";

document.addEventListener("DOMContentLoaded", () => {
    cargarCatalogo();
    
    // Configurar buscador en tiempo real
    document.getElementById('search-input').addEventListener('input', (e) => {
        filtrarCatalogo(e.target.value);
    });
});

/**
 * Carga los datos usando JSONP, añadiendo ?catalogo=true para seguridad
 */
function cargarCatalogo() {
    const script = document.createElement('script');
    // Se añade el parámetro catalogo=true para que el backend solo envíe productos
    script.src = `${API_URL}?catalogo=true&callback=recibirCatalogo`;
    document.body.appendChild(script);
}

// Función callback que ejecuta Apps Script
window.recibirCatalogo = function(data) {
    if (data && data.productos) {
        catalogoData = data.productos;
        renderizarGrid(catalogoData);
    } else {
        console.error("No se pudieron cargar los productos");
    }
    
    // Ocultar pantalla de carga
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 500);
}

/**
 * Dibuja las tarjetas de producto en la pantalla
 */
function renderizarGrid(productos) {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    
    grid.innerHTML = '';
    
    if (productos.length === 0) {
        grid.style.display = 'none';
        emptyState.classList.remove('hidden');
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.classList.add('hidden');
    
    productos.forEach(prod => {
        const stockActual = Number(prod['Stock Actual']) || 0;
        const sinStock = stockActual <= 0;
        
        // Determinar imagen
        const imagenUsar = (prod['Imagen'] && prod['Imagen'].trim() !== '') ? prod['Imagen'] : DEFAULT_IMAGE_BASE64;
        const descripcionUsar = prod['Descripción'] ? prod['Descripción'] : 'Sin especificaciones detalladas.';
        
        // Estructura de la tarjeta
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <div class="product-img-container">
                <img src="${imagenUsar}" alt="${prod['Nombre']}">
                <span class="stock-badge ${sinStock ? 'out-of-stock' : 'in-stock'}">
                    ${sinStock ? 'Agotado' : 'Disponible'}
                </span>
            </div>
            <div class="product-info">
                <h3 class="product-title">${prod['Nombre']}</h3>
                <p class="product-desc">${descripcionUsar}</p>
                <div class="product-price">$${Number(prod['Precio Venta']).toLocaleString('es-MX', {minimumFractionDigits: 2})}</div>
                
                <button class="btn-buy ${sinStock ? 'disabled' : ''}" 
                        onclick="${sinStock ? '' : `comprarPorWhatsApp('${prod['Nombre']}', '${prod['Precio Venta']}')`}">
                    ${sinStock ? 'No disponible' : '💬 Pedir por WhatsApp'}
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

/**
 * Filtra los productos localmente según lo escrito en el buscador
 */
function filtrarCatalogo(busqueda) {
    const termino = busqueda.toLowerCase().trim();
    const filtrados = catalogoData.filter(prod => {
        return prod['Nombre'].toLowerCase().includes(termino) || 
               (prod['Descripción'] && prod['Descripción'].toLowerCase().includes(termino));
    });
    renderizarGrid(filtrados);
}

/**
 * Genera el enlace dinámico para abrir WhatsApp con un mensaje pre-armado
 */
function comprarPorWhatsApp(nombreProducto, precioProducto) {
    const mensaje = `Hola Violett 🌸, me interesa adquirir el siguiente producto del catálogo:%0A%0A🛍️ *${nombreProducto}*%0A💰 Precio: *$${Number(precioProducto).toFixed(2)}*%0A%0A¿Aún lo tienes disponible?`;
    
    const url = `https://api.whatsapp.com/send?phone=${TELEFONO_VENTAS}&text=${mensaje}`;
    window.open(url, '_blank');
}