interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  onBack?: () => void;
}

export function PageHeading({ eyebrow = "PERSONAL COSMIC JOURNAL", title, description, onBack }: Props) {
  return (
    <header className="page-heading">
      {onBack && (
        <button className="back-button" type="button" onClick={onBack} aria-label="Назад">
          ←
        </button>
      )}
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p className="page-description">{description}</p>}
    </header>
  );
}
