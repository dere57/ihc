// ====== Datos del catálogo (sin base de datos) ======
const productos = [
  { id: 1, nombre: "Gomitas surtidas", categoria: "dulces", precio: 35, stock: 25,
    descripcion: "Bolsa de gomitas de colores y formas variadas, con azúcar y sabor a fruta.", imagen: "imagenes/gomitas.png" },
  { id: 2, nombre: "Paleta de caramelo", categoria: "dulces", precio: 15, stock: 40,
    descripcion: "Paleta en espiral de sabor fresa, ideal para compartir.", imagen: "imagenes/paleta.png" },
  { id: 3, nombre: "Caramelos surtidos", categoria: "dulces", precio: 28, stock: 18,
    descripcion: "Caramelos duros envueltos, en varios sabores.", imagen: "imagenes/caramelos.png" },
  { id: 4, nombre: "Tamarindo enchilado", categoria: "dulces", precio: 20, stock: 0,
    descripcion: "Dulce de tamarindo con chile, agridulce y picosito.", imagen: "imagenes/tamarindo.png" },
  { id: 5, nombre: "Barra de chocolate", categoria: "chocolates", precio: 30, stock: 14,
    descripcion: "Chocolate con leche en barra de cuadritos fáciles de partir.", imagen: "imagenes/barra.png" },
  { id: 6, nombre: "Trufas de cacao", categoria: "chocolates", precio: 65, stock: 0,
    descripcion: "Caja de trufas rellenas, cubiertas con cacao en polvo.", imagen: "imagenes/trufas.png" },
  { id: 7, nombre: "Bombones con chocolate", categoria: "chocolates", precio: 45, stock: 9,
    descripcion: "Bombones suaves bañados en chocolate oscuro.", imagen: "imagenes/bombones.png" },
  { id: 8, nombre: "Almendras cubiertas", categoria: "chocolates", precio: 55, stock: 4,
    descripcion: "Almendras tostadas cubiertas de chocolate con leche.", imagen: "imagenes/almendras.png" }
];

const nombresCategoria = { dulces: "Dulces", chocolates: "Chocolates" };

let carrito = [];            // [{ id, cantidad }]
let categoriaActual = "todos";
let temporizadorAviso;

// ====== Referencias al DOM ======
const catalogo = document.getElementById("catalogo");
const resumen = document.getElementById("resumen");
const contador = document.getElementById("contador");
const aviso = document.getElementById("aviso");
const panel = document.getElementById("panel-carrito");
const fondo = document.getElementById("fondo");
const lista = document.getElementById("lista-carrito");
const totalEl = document.getElementById("total");

const formatoPesos = n => "$" + n.toLocaleString("es-MX");

// ====== Catálogo ======
function mostrarCatalogo() {
  const visibles = productos.filter(p => categoriaActual === "todos" || p.categoria === categoriaActual);

  catalogo.innerHTML = visibles.map(p => {
    const enCarrito = (carrito.find(i => i.id === p.id) || { cantidad: 0 }).cantidad;
    const agotado = p.stock === 0;
    const sinMas = !agotado && enCarrito >= p.stock;
    const bloqueado = agotado || sinMas;

    // Visibilidad: el estado de stock siempre se ve; Restricción: botón deshabilitado
    const estadoTexto = agotado ? "AGOTADO" : "Stock: " + p.stock;
    const textoBoton = agotado ? "No disponible" : (sinMas ? "Límite alcanzado" : "Agregar al carrito");
    const nota = agotado ? "Producto agotado, no se puede agregar."
               : sinMas ? "Ya agregaste todo el stock disponible."
               : "";

    return `
      <article class="producto ${agotado ? "sin-stock" : ""}">
        <div class="estado ${agotado ? "agotado" : ""}">${estadoTexto}</div>
        <img src="${p.imagen}" alt="${p.nombre}">
        <div class="info">
          <span class="categoria">${nombresCategoria[p.categoria]}</span>
          <h3>${p.nombre}</h3>
          <p>${p.descripcion}</p>
        </div>
        <div class="accion">
          <p class="precio">${formatoPesos(p.precio)}</p>
          <button class="btn-agregar" data-id="${p.id}" ${bloqueado ? "disabled" : ""}>${textoBoton}</button>
          <p class="restriccion">${nota}</p>
        </div>
      </article>`;
  }).join("");

  const nombre = categoriaActual === "todos" ? "todas las categorías" : nombresCategoria[categoriaActual];
  resumen.textContent = `Mostrando ${visibles.length} producto(s) de ${nombre}.`;
}

// ====== Carrito ======
function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);

  // Restricción: nunca se agrega un producto agotado
  if (!producto || producto.stock === 0) {
    mostrarAviso("Este producto está agotado.", true);
    return;
  }

  const item = carrito.find(i => i.id === id);
  if (item) {
    if (item.cantidad >= producto.stock) {
      mostrarAviso("No hay más unidades disponibles.", true);
      return;
    }
    item.cantidad++;
  } else {
    carrito.push({ id, cantidad: 1 });
  }

  actualizarCarrito();
  mostrarCatalogo();
  // Retroalimentación: mensaje + animación del contador
  mostrarAviso(`✔ "${producto.nombre}" se agregó al carrito`);
  contador.classList.remove("salto");
  void contador.offsetWidth;
  contador.classList.add("salto");
}

function quitarDelCarrito(id) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad--;
  if (item.cantidad === 0) carrito = carrito.filter(i => i.id !== id);
  actualizarCarrito();
  mostrarCatalogo();
}

function actualizarCarrito() {
  const totalPiezas = carrito.reduce((s, i) => s + i.cantidad, 0);
  contador.textContent = totalPiezas;

  if (carrito.length === 0) {
    lista.innerHTML = '<li class="vacio">Tu carrito está vacío</li>';
    totalEl.textContent = formatoPesos(0);
    return;
  }

  let total = 0;
  lista.innerHTML = carrito.map(i => {
    const p = productos.find(x => x.id === i.id);
    total += p.precio * i.cantidad;
    return `
      <li>
        <div class="item-detalle">
          <strong>${p.nombre}</strong>
          <small>${i.cantidad} × ${formatoPesos(p.precio)} = ${formatoPesos(p.precio * i.cantidad)}</small>
        </div>
        <button class="btn-quitar" data-quitar="${p.id}" aria-label="Quitar una unidad de ${p.nombre}">−</button>
      </li>`;
  }).join("");
  totalEl.textContent = formatoPesos(total);
}

// ====== Avisos ======
function mostrarAviso(texto, esError = false) {
  aviso.textContent = texto;
  aviso.classList.toggle("error", esError);
  aviso.classList.add("visible");
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove("visible"), 2200);
}

// ====== Panel ======
function abrirPanel() { panel.hidden = false; fondo.hidden = false; }
function cerrarPanel() { panel.hidden = true; fondo.hidden = true; }

// ====== Eventos ======
catalogo.addEventListener("click", e => {
  const boton = e.target.closest(".btn-agregar");
  if (boton && !boton.disabled) agregarAlCarrito(Number(boton.dataset.id));
});

document.querySelector(".filtros").addEventListener("click", e => {
  const boton = e.target.closest(".btn-filtro");
  if (!boton) return;
  categoriaActual = boton.dataset.categoria;
  document.querySelectorAll(".btn-filtro").forEach(b => b.classList.toggle("activo", b === boton));
  mostrarCatalogo();
});

lista.addEventListener("click", e => {
  const boton = e.target.closest("[data-quitar]");
  if (boton) quitarDelCarrito(Number(boton.dataset.quitar));
});

document.getElementById("btn-carrito").addEventListener("click", abrirPanel);
document.getElementById("cerrar-carrito").addEventListener("click", cerrarPanel);
fondo.addEventListener("click", cerrarPanel);
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarPanel(); });
document.getElementById("vaciar").addEventListener("click", () => {
  carrito = [];
  actualizarCarrito();
  mostrarCatalogo();
});

// ====== Inicio ======
mostrarCatalogo();
actualizarCarrito();
