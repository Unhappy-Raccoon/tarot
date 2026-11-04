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
        <div className="page-brand">
          <span className="page-brand__moon" aria-hidden="true">☾</span>
          <span className="page-brand__wordmark">
            <strong>Personal Cosmic Journal</strong>
            <small>ТАРО · АСТРОЛОГИЯ · ГАРМОНИЯ</small>
          </span>
        </div>
      )}
      {onBack && (
        <button className="back-button" type="button" onClick={onBack} aria-label="Назад">
          ←
        </button>
      )}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="page-description">{description}</p>}
    </header>
  );
}
