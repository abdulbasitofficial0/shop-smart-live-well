import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — NexaStore" }, { name: "description", content: "About NexaStore — Smart Shopping, Better Living." }] }),
  component: () => (
    <div className="container-x py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">About NexaStore</h1>
      <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground leading-relaxed">
        <p>NexaStore is Pakistan's premium online store, bringing you carefully curated products across electronics, fashion, home, beauty, sports and more.</p>
        <p>Our mission is simple: <span className="text-foreground font-semibold">Smart Shopping, Better Living.</span> We hand-pick every product for quality, value, and longevity — so you can shop with confidence.</p>
        <p>We ship nationwide with Cash on Delivery, EasyPaisa and JazzCash payment options. Fast, secure, and always reliable.</p>
      </div>
    </div>
  ),
});
