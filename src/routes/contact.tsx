import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — NexaStore" }, { name: "description", content: "Get in touch with NexaStore. WhatsApp, email, or visit us in Karachi." }] }),
  component: () => (
    <div className="container-x py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-muted-foreground mb-10">We're here to help — reach out any time.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { Icon: Phone, title: "Phone / WhatsApp", value: "+92 322 5305296" },
          { Icon: Mail, title: "Email", value: "hello@nexastore.pk" },
          { Icon: MapPin, title: "Address", value: "Karachi, Pakistan" },
        ].map(({ Icon, title, value }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-6">
            <Icon className="h-6 w-6 text-primary mb-3" />
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  ),
});
