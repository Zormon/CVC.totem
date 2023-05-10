# Changelog


## [6.5.1] - 2023-02-08

### Changed

- Formato json cambiado
    'catalog' incluye todos los datos de los contenidos
    'media' solo la lista de ids



## [6.5.0] - 2023-02-06

### Added

- Aviso sin contenidos cuando no hay contenidos


## [6.4.0] - 2023-01-13

### Added

- Soporte para fechas y horas tanto de música como de contenidos
- Selector de volumen para los contenidos con audio
- Opción de color de fondo de aplicación (para transiciones)

### Changed

- exports.js con DEFAULTS for main.js
- Nueva interfaz de configuración de la aplicación por pestañas

- Nuevo formato json, deploy.json, para todo. Detalles:
    Contenidos, musica, eventos, horarios y demás en un solo fichero desde el servidor
    Contenidos en la carpeta /media
    Música en la carpeta /music
    Catálogo separado de las listas de música, enlazados por id
    Más cambios pequeños

- Actualizado electron a 22.0.1
- Multiples cambios de estabilidad/limpeza


### Fixed

- Mensaje de error al cerrar la ventana de preview de impresión, teniendo desactivada la impresión de tickets (para debug)


### Removed

- Antigua interfaz de configuración de UI



## [6.3.0] - 2022-12-21

### Added

- Soporte para más extensiones de contenidos (WEBP, AVIF)

### Changed

- Actualizado electron a 22.0.0

### Fixed

- Comprobación de extensiones de ficheros con o sin mayúsculas (ej, jpg, JPG)