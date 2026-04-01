import { MessageCircleMore, Phone, Timer, MapPin } from "lucide-react";
import { useState } from "react";
import { MapsEmbed } from "../components/maps-embed";
import { useToast } from "../components/toast-provider";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Seo } from "../lib/seo";
import { whatsappNumber } from "../lib/constants";

export function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  function submitHandler(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      showToast({
        title: "Incomplete form",
        description: "Please fill out all fields before submitting.",
        variant: "error",
      });
      return;
    }

    showToast({
      title: "Message received",
      description: "This demo form is ready for backend wiring or email integration.",
    });
    setForm({ name: "", phone: "", message: "" });
  }

  return (
    <>
      <Seo
        title="Contact | Printing Shop in Bhopal"
        description="Contact the Bhopal printing team for orders, timings, WhatsApp help, and delivery details."
      />
      <section className="py-16 sm:py-20">
        <div className="section-shell">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-5">
              <Card className="p-6">
              <h1 className="text-4xl font-semibold tracking-tight">Contact the delivery desk</h1>
                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                  For quick orders, WhatsApp is the fastest route. Use the contact form for general queries and service requests.
                </p>
                <div className="mt-8 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-brand-500" />
              <div>
                <p className="font-semibold">Address</p>
                <p className="text-slate-600 dark:text-slate-300">
                  Shop No-f-3, Bhavani Tower, above Naman restaurant, Bhawanidham Phase-1, Chhatrapati Nagar, Narela Jod, Ayodhya Nagar, Bhopal, Madhya Pradesh 462041
                </p>
              </div>
            </div>
                  <div className="flex items-start gap-3">
                    <Timer className="mt-1 h-5 w-5 text-brand-500" />
                    <div>
                      <p className="font-semibold">Timings</p>
                      <p className="text-slate-600 dark:text-slate-300">Monday to Saturday, 9:00 AM to 8:30 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-1 h-5 w-5 text-brand-500" />
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p className="text-slate-600 dark:text-slate-300">+91 98765 43210</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  className="mt-8 w-full"
                  onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank", "noopener,noreferrer")}
                >
                  <MessageCircleMore className="h-4 w-4" />
                  Chat on WhatsApp
                </Button>
              </Card>

              <MapsEmbed />
            </div>

            <Card className="p-6 sm:p-8">
              <form onSubmit={submitHandler} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">Name</label>
                  <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Phone</label>
                  <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Message</label>
                  <Textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />
                </div>
                <Button type="submit" className="w-full">
                  Send enquiry
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
