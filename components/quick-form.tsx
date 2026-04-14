export function QuickForm({
  title,
  fields,
}: {
  title: string;
  fields: { label: string; placeholder: string }[];
}) {
  return (
    <form className="quick-form">
      <h3>{title}</h3>
      <div className="quick-form-grid">
        {fields.map((field) => (
          <label className="field" key={field.label}>
            <span>{field.label}</span>
            <input placeholder={field.placeholder} readOnly />
          </label>
        ))}
      </div>
      <button className="button primary" type="button">
        Preparar cadastro
      </button>
    </form>
  );
}
