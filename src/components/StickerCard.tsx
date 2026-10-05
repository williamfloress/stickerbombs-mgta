interface Sticker {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
}

export default function StickerCard({ sticker, onPreview }: { sticker: Sticker, onPreview?: () => void }) {
  return (
    <div className="sticker-card" onClick={onPreview} style={{ cursor: 'pointer' }}>
      <div className="sticker-image-wrapper">
        <img 
          src={sticker.imagen_url} 
          alt={sticker.nombre} 
          className="sticker-image"
        />
      </div>
      <div className="sticker-info">
        <h3>{sticker.nombre}</h3>
        <p className="price">${sticker.precio.toFixed(2)}</p>
        <button className="primary-button" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }} onClick={(e) => { e.stopPropagation(); if (onPreview) onPreview(); }}>
          Ver diseño
        </button>
      </div>
    </div>
  );
}
