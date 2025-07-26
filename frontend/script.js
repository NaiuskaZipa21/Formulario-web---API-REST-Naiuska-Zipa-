// Configuración de la API
const API_URL = 'http://localhost:3000/api';

// Validaciones del lado del cliente
function validarFormulario(formData) {
    let esValido = true;
    const errores = {};

    // Validar nombre
    if (!formData.nombre || formData.nombre.trim().length < 2) {
        errores.nombre = 'El nombre es requerido (mínimo 2 caracteres)';
        esValido = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
        errores.email = 'Ingrese un email válido';
        esValido = false;
    }

    // Validar teléfono (opcional pero si se proporciona debe ser válido)
    if (formData.telefono) {
        const telefonoRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
        if (!telefonoRegex.test(formData.telefono)) {
            errores.telefono = 'Formato de teléfono inválido';
            esValido = false;
        }
    }

    // Validar edad
    const edad = parseInt(formData.edad);
    if (!edad || edad < 18 || edad > 100) {
        errores.edad = 'La edad debe estar entre 18 y 100 años';
        esValido = false;
    }

    // Validar país
    if (!formData.pais) {
        errores.pais = 'Seleccione un país';
        esValido = false;
    }

    return { esValido, errores };
}

function mostrarErrores(errores) {
    // Limpiar errores anteriores
    document.querySelectorAll('.error').forEach(error => {
        error.style.display = 'none';
    });

    // Mostrar nuevos errores
    Object.keys(errores).forEach(campo => {
        const errorElement = document.getElementById(campo + 'Error');
        if (errorElement) {
            errorElement.textContent = errores[campo];
            errorElement.style.display = 'block';
        }
    });
}

// Función para registrar usuario
async function registrarUsuario(userData) {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar usuario');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Función para cargar usuarios
async function cargarUsuarios() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '<div class="loading">Cargando usuarios...</div>';

    try {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }

        const usuarios = await response.json();
        mostrarUsuarios(usuarios);
    } catch (error) {
        console.error('Error:', error);
        userList.innerHTML = '<div class="loading"> Error al cargar usuarios. Verifique que el servidor esté ejecutándose.</div>';
    }
}

function mostrarUsuarios(usuarios) {
    const userList = document.getElementById('userList');
    
    if (usuarios.length === 0) {
        userList.innerHTML = '<div class="loading"> No hay usuarios registrados</div>';
        return;
    }

    userList.innerHTML = usuarios.map(usuario => `
        <div class="user-card fade-in">
            <div class="user-info">
                <div class="info-item">
                    <span class="info-label">Nombre</span>
                    <span class="info-value">${usuario.nombre}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email</span>
                    <span class="info-value">${usuario.email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Teléfono</span>
                    <span class="info-value">${usuario.telefono || 'No proporcionado'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Edad</span>
                    <span class="info-value">${usuario.edad} años</span>
                </div>
                <div class="info-item">
                    <span class="info-label">País</span>
                    <span class="info-value">${usuario.pais}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Registrado</span>
                    <span class="info-value">${new Date(usuario.fechaCreacion).toLocaleDateString('es-ES')}</span>
                </div>
            </div>
            ${usuario.comentarios ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                    <span class="info-label">Comentarios</span>
                    <span class="info-value">${usuario.comentarios}</span>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function limpiarFormulario() {
    document.getElementById('userForm').reset();
    document.querySelectorAll('.error').forEach(error => {
        error.style.display = 'none';
    });
}

function mostrarMensajeExito() {
    const mensaje = document.getElementById('successMessage');
    mensaje.style.display = 'block';
    setTimeout(() => {
        mensaje.style.display = 'none';
    }, 3000);
}

// Event Listeners
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
    
    // Validar datos
    const { esValido, errores } = validarFormulario(userData);
    
    if (!esValido) {
        mostrarErrores(errores);
        return;
    }

    try {
        await registrarUsuario(userData);
        mostrarMensajeExito();
        limpiarFormulario();
        cargarUsuarios(); // Recargar la lista
    } catch (error) {
        alert('Error al registrar usuario: ' + error.message);
    }
});

// Validación en tiempo real
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('blur', () => {
        const formData = new FormData(document.getElementById('userForm'));
        const userData = Object.fromEntries(formData.entries());
        const { errores } = validarFormulario(userData);
        
        const errorElement = document.getElementById(input.name + 'Error');
        if (errorElement) {
            if (errores[input.name]) {
                errorElement.textContent = errores[input.name];
                errorElement.style.display = 'block';
            } else {
                errorElement.style.display = 'none';
            }
        }
    });
});

// Cargar usuarios al cargar la página
document.addEventListener('DOMContentLoaded', cargarUsuarios);