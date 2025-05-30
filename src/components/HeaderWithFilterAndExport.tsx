export function HeaderWithFilterAndExport({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className=" font-semibold">{title}</h2>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Filtrar"
          className="rounded-full px-4 py-2 bg-bg_input_color border border-border_input_color"
        />
        <button className="bg-color_tertiary text-tex_color_white px-4 py-2 rounded">
          Exportar
        </button>
      </div>
    </div>
  );
}
