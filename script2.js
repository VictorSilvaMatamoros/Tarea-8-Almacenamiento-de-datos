window.addEventListener("load", () => {
    let baseDatos;

    // Función para abrir o crear la base de datos
    function abrirBaseDatos() {
        let solicitudConexion = indexedDB.open("notas", 1);

        solicitudConexion.onsuccess = function (evento) {
            baseDatos = evento.target.result;
            // Mostrar todas las notas al cargar la página
            mostrarNotas();
        };

        solicitudConexion.onerror = function (evento) {
            document.querySelector("#resultado").innerHTML = `Error al abrir la base de datos: ${evento.target.errorCode}`;
        };

        solicitudConexion.onupgradeneeded = function (evento) {
            baseDatos = evento.target.result;
            baseDatos.createObjectStore('notas', { autoIncrement: true });
        }
    }

    abrirBaseDatos();

    // Función para agregar una nueva nota
    document.querySelector('#AgregarNota').addEventListener('click', function (evento) {
        let contenido = document.querySelector('#contenido').value;
        if (contenido.length) {
            let transaccion = baseDatos.transaction(['notas'], 'readwrite');
            let notas = transaccion.objectStore('notas');
            let nota = { contenido: contenido };
            notas.add(nota);
            transaccion.oncomplete = function () {
                mostrarNotas();
                document.querySelector('#resultado').innerHTML = 'La nota se creó';
            }
            transaccion.onerror = function () {
                document.querySelector('#resultado').innerHTML = `Error al intentar almacenar: ${evento.target.errorCode}`;
            }
        } else {
            document.querySelector('#resultado').innerHTML = 'No hay escrito nada';
        }
    });

    // Función para mostrar todas las notas
    function mostrarNotas() {
        let transaccion = baseDatos.transaction(['notas'], 'readonly');
        let notas = transaccion.objectStore('notas');
        let contenidoNotas = '';
    
        
        notas.openCursor().onsuccess = function (evento) {
            let cursor = evento.target.result;
            if (cursor) {
                // Se agrega el contenido de la nota al contenido a mostrar en la página
                contenidoNotas += `<div>
                                        <p>${cursor.value.contenido}</p>
                                        <button class="eliminarNota" data-id="${cursor.key}">Eliminar</button>
                                        <button class="editarNota" data-id="${cursor.key}">Editar</button>
                                    </div>`;
                cursor.continue();
            } else {
                
                document.querySelector('#resultado').innerHTML = contenidoNotas;
    
                //  evento que elimina las notas 
                let botonesEliminar = document.querySelectorAll('.eliminarNota');
                botonesEliminar.forEach(boton => {
                    boton.addEventListener('click', function(evento) {
                        let notaId = Number(evento.target.dataset.id);
                        eliminarNota(notaId);
                    });
                });

                //  evento para editar las notas
                let botonesEditar = document.querySelectorAll('.editarNota');
                botonesEditar.forEach(boton => {
                    boton.addEventListener('click', function(evento) {
                        let notaId = Number(evento.target.dataset.id);
                        editarNota(notaId);
                    });
                });
            }
        };
    }

    // Función para eliminar una nota específica
    function eliminarNota(notaId) {
        let transaccion = baseDatos.transaction(['notas'], 'readwrite');
        let notas = transaccion.objectStore('notas');
        let solicitudEliminacion = notas.delete(notaId);

        solicitudEliminacion.onsuccess = function () {
            mostrarNotas();
            document.querySelector('#resultado').innerHTML = 'La nota ha sido eliminada';
        };

        solicitudEliminacion.onerror = function () {
            document.querySelector('#resultado').innerHTML = `Error al intentar eliminar la nota: ${event.target.errorCode}`;
        };
    }

    // Función para editar una nota específica
    function editarNota(notaId) {
        let transaccion = baseDatos.transaction(['notas'], 'readonly');
        let notas = transaccion.objectStore('notas');
        let solicitudNota = notas.get(notaId);

        solicitudNota.onsuccess = function(evento) {
            let nota = evento.target.result;

            // Mostrar el formulario de edición
            let formularioEditar = document.querySelector('#formulario-editar');
            formularioEditar.style.display = 'block';

            // Cargar el contenido actual de la nota en el formulario
            let contenidoEditar = document.querySelector('#editar-contenido');
            contenidoEditar.value = nota.contenido;

            // Agregar evento de clic para el botón de guardar cambios
            let botonGuardar = document.querySelector('#guardar-cambios');
            botonGuardar.onclick = function() {
                // Obtener el nuevo contenido de la nota
                let nuevoContenido = contenidoEditar.value;

                // Actualizar la nota en la base de datos
                let transaccionUpdate = baseDatos.transaction(['notas'], 'readwrite');
                let notasUpdate = transaccionUpdate.objectStore('notas');
                let solicitudUpdate = notasUpdate.put({contenido: nuevoContenido}, notaId);

                solicitudUpdate.onsuccess = function() {
                    mostrarNotas();
                    document.querySelector('#resultado').innerHTML = 'La nota ha sido actualizada';
                    formularioEditar.style.display = 'none';
                };

                solicitudUpdate.onerror = function() {
                    document.querySelector('#resultado').innerHTML = `Error al intentar actualizar la nota: ${event.target.errorCode}`;
                };
            };
        };

        solicitudNota.onerror = function() {
            document.querySelector('#resultado').innerHTML = `Error al intentar recuperar la nota: ${event.target.errorCode}`;
        };
    }

    // Función para borrar todas las notas
    document.querySelector('#BorrarNotas').addEventListener('click', function (evento) {
        let transaccion = baseDatos.transaction(['notas'], 'readwrite');
        let notas = transaccion.objectStore('notas');
        notas.clear();
        transaccion.oncomplete = function () {
            mostrarNotas();
            document.querySelector('#resultado').innerHTML = 'Todas las notas han sido borradas';
        }
        transaccion.onerror = function () {
            document.querySelector('#resultado').innerHTML = `Error al intentar borrar las notas: ${evento.target.errorCode}`;
        }
    });
});
