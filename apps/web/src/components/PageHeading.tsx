interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  onBack?: () => void;
  hideBrand?: boolean;
}

export function PageHeading({ eyebrow = "", title, description, onBack, hideBrand = false }: Props) {
  return (
    <header className={`page-heading ${hideBrand ? "page-heading--plain" : ""}`}>
      {!hideBrand && (
        <div className="page-heading__brand-row">
          <div className="page-brand">
            <span className="page-brand__moon" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M25.8 4.5C14.2 8 8.2 20.2 12.5 30.1c2.2 5.1 6.7 8.1 12.2 8.4C14 41.1 3 32.7 3 20.8 3 9.7 12.1.7 23.1.7c1 0 1.9.1 2.7.3Z"/><path d="m32 5 1.3 3.4L37 10l-3.7 1.4L32 15l-1.3-3.6L27 10l3.7-1.6L32 5Z"/></svg></span>
            <span className="page-brand__wordmark">
              <strong>Personal Cosmic Journal</strong>
              <small>ТАРО · АСТРОЛОГИЯ · ГАРМОНИЯ</small>
            </span>
          </div>
        </div>
      )}
      <div className="page-heading__title-row">
        {onBack && (
          <button className="back-button" type="button" onClick={onBack} aria-label="Назад">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m0 0 7-7m-7 7 7 7"/></svg>
          </button>
        )}
        <div className="page-heading__titles">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>
      </div>
    </header>
  );
}
