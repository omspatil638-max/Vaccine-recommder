import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl space-y-4 px-4 py-16">
      <h1 className="text-3xl">We couldn’t find that page</h1>
      <p className="text-ink-2">The link may be out of date, or the page may have moved.</p>
      <Button to="/" variant="secondary">
        Go to the start
      </Button>
    </section>
  );
}
