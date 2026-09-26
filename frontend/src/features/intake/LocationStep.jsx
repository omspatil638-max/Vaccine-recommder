import { useState } from 'react';
import { LocateFixed } from 'lucide-react';
import Button from '../../components/ui/Button';
import { ChoiceGroup } from '../../components/ui/Choice';
import { SelectField, TextField } from '../../components/ui/FormField';
import Notice from '../../components/ui/Notice';
import { useIntake } from './IntakeContext';
import StepFrame, { Section, Why } from './StepFrame';
import { useFieldErrors } from '../../lib/useFieldErrors';

export default function LocationStep() {
  const { data, catalog, save } = useIntake();
  const l = data?.location ?? {};
  const [form, setForm] = useState({
    country_code: l.country_code ?? '',
    country_name: l.country_code === 'OTHER' ? l.country_name ?? '' : '',
    region: l.region ?? '',
    city: l.city ?? '',
    lat: l.lat ?? null,
    lon: l.lon ?? null,
  });
  const [errors, setErrors] = useFieldErrors(form);
  const [geo, setGeo] = useState({ state: l.lat != null ? 'saved' : 'idle', message: null });

  const jurisdictions = catalog?.jurisdictions ?? [];
  const selected = jurisdictions.find((j) => j.code === form.country_code);

  const locate = () => {
    if (!navigator.geolocation) {
      setGeo({ state: 'error', message: 'Your browser doesn’t support sharing location.' });
      return;
    }
    setGeo({ state: 'loading', message: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: Math.round(pos.coords.latitude * 100) / 100,
          lon: Math.round(pos.coords.longitude * 100) / 100,
        }));
        setGeo({ state: 'saved', message: null });
      },
      (err) =>
        setGeo({
          state: 'error',
          message:
            err.code === 1
              ? 'Location permission was declined. That’s fine: providers will be listed without distances.'
              : 'We couldn’t get your location. You can continue without it.',
        }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  const submit = async () => {
    const e = {};
    if (!form.country_code) e.country_code = 'Choose where you live.';
    if (form.country_code === 'OTHER' && !form.country_name.trim()) e.country_name = 'Enter your country.';
    setErrors(e);
    if (Object.keys(e).length) throw new Error('Some answers need your attention.');
    await save('location', {
      country_code: form.country_code,
      country_name: form.country_code === 'OTHER' ? form.country_name.trim() : null,
      region: form.region || null,
      city: form.city.trim() || null,
      lat: form.lat,
      lon: form.lon,
    });
  };

  return (
    <StepFrame
      stepKey="location"
      title="Tell us where you are"
      purpose="Vaccination guidance differs between countries. We use the official guideline for where you live, and never mix countries’ recommendations."
      onSubmit={submit}
    >
      <Section>
        <ChoiceGroup
          legend="Which country do you live in?"
          options={jurisdictions.map((j) => ({ value: j.code, label: j.name }))}
          value={form.country_code}
          onChange={(v) => setForm((f) => ({ ...f, country_code: v, region: '' }))}
          error={errors.country_code}
        />

        {selected?.guideline && (
          <Notice tone="info" title="The guideline we’ll use">
            <p>
              {selected.guideline.name} ({selected.guideline.publisher}), <span className="data">{selected.guideline.version}</span>.
            </p>
            {selected.guideline.scope_note && <p className="text-ink-2">{selected.guideline.scope_note}</p>}
          </Notice>
        )}

        {form.country_code === 'OTHER' && (
          <>
            <TextField
              label="Country"
              autoComplete="country-name"
              value={form.country_name}
              error={errors.country_name}
              onChange={(e) => setForm((f) => ({ ...f, country_name: e.target.value }))}
            />
            <Notice tone="caution" title="We don’t have guidelines for other countries yet">
              You can still save your information, but we can’t assess your vaccinations. Your health ministry or a
              healthcare professional can advise you. We won’t apply another country’s guidance to you.
            </Notice>
          </>
        )}
      </Section>

      {form.country_code && (
        <Section title="Your area" description="Optional. Used only to find vaccination providers near you.">
          <div className="grid gap-5 sm:grid-cols-2">
            {selected?.regions?.length > 0 ? (
              <SelectField
                label={selected.regionLabel}
                optional
                placeholder="Choose…"
                options={selected.regions.map((r) => ({ value: r, label: r }))}
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              />
            ) : (
              <TextField
                label="Region"
                optional
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              />
            )}
            <TextField
              label="Town or city"
              optional
              autoComplete="address-level2"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={locate} loading={geo.state === 'loading'} loadingLabel="Finding you…">
                <LocateFixed className="h-4 w-4" aria-hidden="true" />
                {geo.state === 'saved' ? 'Update my location' : 'Use my current location'}
              </Button>
              {geo.state === 'saved' && (
                <>
                  <span className="text-sm text-ok">Location added (approximate, to about 1 km)</span>
                  <Button
                    variant="quiet"
                    onClick={() => {
                      setForm((f) => ({ ...f, lat: null, lon: null }));
                      setGeo({ state: 'idle', message: null });
                    }}
                  >
                    Remove
                  </Button>
                </>
              )}
            </div>
            {geo.message && <p className="text-sm text-ink-2">{geo.message}</p>}
            <Why>We store only an approximate location, and use it only to sort providers by distance.</Why>
          </div>
        </Section>
      )}
    </StepFrame>
  );
}
