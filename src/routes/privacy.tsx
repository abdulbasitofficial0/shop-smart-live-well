import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — NexaStore" }] }),
  component: () => (
    <div className="container-x py-16 max-w-3xl prose prose-invert">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>NexaStore respects your privacy. We collect only the information required to process your orders and improve your shopping experience.</p>
        <h3 className="text-foreground font-semibold pt-4">What we collect</h3>
        <p>Name, phone, delivery address, and email address. Payment details are handled securely through your chosen payment provider.</p>
        <h3 className="text-foreground font-semibold pt-4">How we use it</h3>
        <p>To deliver your orders, notify you of updates, and improve our service. We never sell your data.</p>
        <h3 className="text-foreground font-semibold pt-4">Contact</h3>
        <p>Questions? Reach us at hello@nexastore.pk.</p>
      </div>
    </div>
  ),
});
