"use client";

export const dynamic = "force-dynamic";

import { useState, type FormEvent } from "react";
import { Navbar } from "@/components/layout/navbar";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  MR5_CONTACT,
  formatPhoneDisplay,
  mailtoHref,
  mapsHref,
  telHref,
  whatsappHref,
} from "@/data/contact";

function copyText(label: string, value: string) {
  void navigator.clipboard?.writeText(value);
  toast.success(`${label} copied`);
}

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const name = [firstName, lastName].filter(Boolean).join(" ").trim();
    const body = [
      name ? `Name: ${name}` : "",
      email ? `Reply-to: ${email}` : "",
      "",
      message,
    ]
      .filter((line, index, arr) => line !== "" || (index > 0 && arr[index - 1] !== ""))
      .join("\n");

    window.location.href = mailtoHref(
      MR5_CONTACT.email,
      subject || "MR5 School — Contact form",
      body,
    );
  };

  const addressLines = [
    MR5_CONTACT.address.line1,
    MR5_CONTACT.address.line2,
    MR5_CONTACT.address.country,
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-r from-primary/20 via-purple-600/20 to-blue-600/20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="container relative z-10 mx-auto flex h-full flex-col justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Get in Touch</h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Tap any option below to call, chat, email, or get directions — we respond
              quickly during office hours.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-wrap gap-3">
          {MR5_CONTACT.phones.map((phone) => (
            <a
              key={phone.id}
              href={telHref(phone.e164)}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-purple-500/20"
            >
              <Phone className="h-4 w-4 text-purple-500" />
              Call {formatPhoneDisplay(phone.e164)}
            </a>
          ))}
          <a
            href={whatsappHref(
              MR5_CONTACT.phones[0].e164,
              "Hello MR5 School, I have a question about your courses.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-green-500/20"
          >
            <MessageCircle className="h-4 w-4 text-green-500" />
            WhatsApp
          </a>
          <a
            href={mapsHref(MR5_CONTACT.address.mapsQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-sky-500/20"
          >
            <MapPin className="h-4 w-4 text-sky-500" />
            Directions
          </a>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 lg:col-span-1"
          >
            <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Email Us</CardTitle>
                <CardDescription>Tap to open your mail app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={mailtoHref(MR5_CONTACT.email)}
                  className="block text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {MR5_CONTACT.email}
                </a>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => copyText("Email", MR5_CONTACT.email)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy email
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10">
                  <Phone className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Call Us</CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {MR5_CONTACT.supportHours}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {MR5_CONTACT.phones.map((phone) => (
                  <div
                    key={phone.id}
                    className="rounded-xl border border-border/60 bg-muted/30 p-3"
                  >
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {phone.label}
                    </p>
                    <a
                      href={telHref(phone.e164)}
                      className="text-base font-semibold text-foreground underline-offset-4 hover:text-purple-500 hover:underline"
                    >
                      {formatPhoneDisplay(phone.e164)}
                    </a>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="secondary" className="h-8 gap-1.5">
                        <a href={telHref(phone.e164)}>
                          <Phone className="h-3.5 w-3.5" />
                          Call now
                        </a>
                      </Button>
                      {phone.whatsapp && (
                        <Button asChild size="sm" variant="outline" className="h-8 gap-1.5">
                          <a
                            href={whatsappHref(phone.e164)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            WhatsApp
                          </a>
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1.5"
                        onClick={() => copyText("Phone", phone.e164)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10">
                  <MapPin className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Visit Us</CardTitle>
                <CardDescription>Tap for Google Maps directions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={mapsHref(MR5_CONTACT.address.mapsQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-medium leading-relaxed underline-offset-4 hover:text-green-600 hover:underline dark:hover:text-green-400"
                >
                  {addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </a>
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <a
                    href={mapsHref(MR5_CONTACT.address.mapsQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open in Maps
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription>
                  Submit opens your email app with your message pre-filled — no account
                  needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="first-name" className="text-sm font-medium">
                        First Name
                      </label>
                      <Input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Nimal"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last-name" className="text-sm font-medium">
                        Last Name
                      </label>
                      <Input
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Abishek"
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-sm font-medium">
                      Your Email
                    </label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="How can we help?"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us more about your inquiry..."
                      className="min-h-[150px] bg-background"
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2 md:w-auto">
                    <Send className="h-4 w-4" />
                    Send via Email
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
