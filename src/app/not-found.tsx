import { DokaButton } from "@/components/ui/DokaButton";

export default function NotFound() {
  return (
    <section className="nf t-orange">
      <p className="nf__code display" aria-hidden="true">
        404
      </p>
      <h1 className="display type-2">cette page est partie à emporter.</h1>
      <p className="lead">Elle n&apos;existe pas ou plus. La carte, elle, est toujours là.</p>
      <div className="nf__ctas">
        <DokaButton href="/la-carte" variant="ink" size="lg">
          Voir la carte
        </DokaButton>
        <DokaButton href="/" variant="cream" size="lg">
          Retour à l&apos;accueil
        </DokaButton>
      </div>
    </section>
  );
}
