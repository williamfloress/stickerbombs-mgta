# StickerBomb V1

StickerBomb es una plataforma de comercio electronico especializada en la venta de stickers decorativos para tarjetas de credito y debito. Esta version (V1) funciona como un Minimum Viable Product (MVP) diseñado para ofrecer una experiencia rapida, segura y con una estetica premium.

## Tecnologias Utilizadas

El proyecto fue desarrollado utilizando el siguiente stack tecnologico:

- Frontend: Next.js (React)
- Estilos: CSS puro (Vanilla CSS) enfocado en un diseño moderno, con soporte para variables, Grid, Flexbox y animaciones fluidas sin dependencias externas.
- Backend y Base de Datos: Supabase (PostgreSQL) para la gestion de datos relacionales, almacenamiento y autenticacion.
- Autenticacion: Supabase Auth.
- Pagos: Integracion basica de pasarela de pago para la funcionalidad de checkout.

## Caracteristicas Principales (V1)

- Catalogo de Stickers: Galeria interactiva para explorar los diseños disponibles, visualizar detalles de los productos y agregarlos al carrito.
- Visor de Previsualizacion (Simulador): Herramienta principal que permite al usuario seleccionar un diseño y previsualizarlo aplicado sobre la silueta de una tarjeta, simulando el recorte del chip y el resultado final.
- Carrito de Compras: Gestion de productos seleccionados, calculo de totales e impuestos antes de la compra.
- Sistema de Usuarios: Registro e inicio de sesion seguro para gestionar el historial de compras y la informacion de envio.
- Gestion de Ordenes: Panel donde los usuarios pueden revisar sus pedidos anteriores y consultar el estado actual (Pendiente, Procesando, Enviado).
- Checkout: Formulario para la recoleccion de datos de envio y simulacion del proceso de pago.

## Desarrollo Local

Para correr este proyecto en un entorno local:

1. Instala las dependencias del proyecto:
   npm install

2. Configura las variables de entorno necesarias para Supabase en el archivo `.env.local`.

3. Inicia el servidor de desarrollo:
   npm run dev

4. Abre tu navegador en `http://localhost:3000`.
