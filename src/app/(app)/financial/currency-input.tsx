"use client"

// Input de valor em R$ com máscara de centavos — digitar preenche da direita
// pra esquerda (ex: "1","2","3","4","5" vira R$ 123,45), igual app de banco.
// Controlado por value/onChange em reais (number), não em texto, pra plugar
// direto no react-hook-form via <Controller>.
interface CurrencyInputProps {
  id?: string
  label?: string
  error?: string
  ariaLabel?: string
  value: number
  onChange: (value: number) => void
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function CurrencyInput({ id, label, error, ariaLabel, value, onChange }: CurrencyInputProps) {
  const cents = Math.round((value || 0) * 100)
  const display = cents === 0 ? "" : `R$ ${formatBRL(cents)}`

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "")
    const newCents = digits ? parseInt(digits, 10) : 0
    onChange(newCents / 100)
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
      )}
      <input
        id={id}
        aria-label={ariaLabel}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder="R$ 0,00"
        className="h-11 rounded-md border border-border bg-input-bg px-3 text-base text-foreground outline-none focus:border-ring transition-colors placeholder:text-muted-foreground"
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
