import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — NexaStore" }] }),
  component: () => (
    <div className="container-x py-16 max-w-3xl prose prose-invert">
      <h1 className="text-4xl font-bold mb-6">Terms &amp; Conditions</h1>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>By using NexaStore you agree to the following terms.</p>
        <h3 className="text-foreground font-semibold pt-4">Orders</h3>
        <p>All orders are subject to availability. Delivery charges of Rs. 170 per product apply, with an additional Rs. 60 fee for Cash on Delivery orders.</p>
        <h3 className="text-foreground font-semibold pt-4">Returns</h3>
        <p>Products may be returned within 7 days if unused and in original packaging. Contact support to initiate a return.</p>
        <h3 className="text-foreground font-semibold pt-4">Liability</h3>
        <p>NexaStore is not liable for damages arising from misuse of products.</p>
      </div>
    </div>
  ),
});
