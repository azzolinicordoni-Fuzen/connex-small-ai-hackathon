import { BIOMES, BR_STATES, type LocationValue, type Option, type Question } from "@/field/questions";
import type { FieldLang, FieldStrings } from "@/field/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Choice({ name, options, value, onChange, lang, multi }: {
  name: string; options: Option[]; value: unknown; onChange: (v: unknown) => void; lang: FieldLang; multi?: boolean;
}) {
  const sel = multi ? ((value as string[]) ?? []) : value;
  return (
    <div role={multi ? "group" : "radiogroup"} aria-labelledby={`${name}-label`} className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => {
        const checked = multi ? (sel as string[]).includes(o.value) : sel === o.value;
        return (
          <label
            key={o.value}
            className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring ${
              checked ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/50"
            }`}
          >
            <input
              type={multi ? "checkbox" : "radio"}
              name={name}
              value={o.value}
              checked={checked}
              onChange={() => {
                if (!multi) return onChange(o.value);
                const arr = sel as string[];
                onChange(checked ? arr.filter((x) => x !== o.value) : [...arr, o.value]);
              }}
              className="h-4 w-4 accent-primary"
            />
            {o.label[lang]}
          </label>
        );
      })}
    </div>
  );
}

export function QuestionInput({ q, value, onChange, lang, t, error }: {
  q: Question | "C06.biome"; value: unknown; onChange: (v: unknown) => void; lang: FieldLang; t: FieldStrings; error?: string;
}) {
  if (q === "C06.biome") {
    const loc = (value as LocationValue) ?? { country: "BR", state: "", municipality: "", biome: "" };
    return (
      <fieldset className="space-y-3">
        <legend id="C06-biome-label" className="font-semibold">{t.biome}</legend>
        <Choice name="C06-biome" options={BIOMES} value={loc.biome} lang={lang} onChange={(b) => onChange({ ...loc, biome: b })} />
      </fieldset>
    );
  }
  const errId = `${q.id}-err`;
  return (
    <fieldset className="space-y-3" aria-describedby={error ? errId : undefined}>
      <legend id={`${q.id}-label`} className="font-semibold leading-snug">
        <span className="mr-2 font-mono text-xs text-muted-foreground">{q.id}</span>
        {q.label[lang]}
      </legend>
      {q.rule && <p className="text-xs text-muted-foreground">{q.rule[lang]}</p>}
      {q.kind === "multi" && <p className="text-xs text-muted-foreground">{t.selectAll}</p>}
      {(q.kind === "single" || q.kind === "multi") && (
        <Choice name={q.id} options={q.options!} value={value} lang={lang} multi={q.kind === "multi"} onChange={onChange} />
      )}
      {q.kind === "text" && (
        <Input
          aria-labelledby={`${q.id}-label`}
          aria-invalid={!!error}
          maxLength={40}
          autoComplete="off"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {q.kind === "location" && (() => {
        const loc = (value as LocationValue) ?? { country: "BR", state: "", municipality: "", biome: "" };
        const set = (p: Partial<LocationValue>) => onChange({ ...loc, ...p });
        return (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="c06-country">{t.country}</Label>
              <select id="c06-country" value={loc.country} onChange={(e) => set({ country: e.target.value as "BR" | "other", state: "" })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="BR">{t.brazil}</option>
                <option value="other">{t.otherCountry}</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="c06-state">{t.state}</Label>
              {loc.country === "BR" ? (
                <select id="c06-state" value={loc.state} onChange={(e) => set({ state: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">—</option>
                  {BR_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <Input id="c06-state" maxLength={60} value={loc.state} onChange={(e) => set({ state: e.target.value })} />
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="c06-mun">{t.municipality}</Label>
              <Input id="c06-mun" maxLength={80} autoComplete="off" aria-invalid={!!error} value={loc.municipality} onChange={(e) => set({ municipality: e.target.value })} />
            </div>
          </div>
        );
      })()}
      {error && <p id={errId} role="alert" className="text-sm font-medium text-destructive">{error}</p>}
    </fieldset>
  );
}
