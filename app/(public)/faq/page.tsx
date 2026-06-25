import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Mail, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { getFaqs } from "@/lib/db/queries/catalog";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes (FAQ)",
  description: "Respuestas a las dudas más habituales sobre nuestro catálogo, sincronización ERP, registro de empresas B2B y solicitudes de presupuesto."
};

export default async function FaqPage() {
  const faqsList = await getFaqs();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <Badge className="rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.2em]">
          Dudas Resueltas
        </Badge>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary shrink-0" />
          Preguntas Frecuentes
        </h1>
        <p className="mt-4 text-muted-foreground text-sm sm:text-base max-w-xl">
          Todo lo que necesitas saber sobre el funcionamiento de nuestro catálogo informativo, tarifas profesionales y sincronización con el ERP.
        </p>
      </div>

      {/* Accordion container */}
      <div className="space-y-6">
        {faqsList.length === 0 ? (
          <Card className=" border-border/70 p-8 text-center text-muted-foreground bg-card">
            No hay preguntas frecuentes registradas en este momento.
          </Card>
        ) : (
          <Card className=" border-border/70 bg-card p-6 sm:p-8 shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              {faqsList.map((faq, index) => (
                <AccordionItem key={faq.id} value={`faq-${index}`} className="border-b border-border/60 py-1 last:border-b-0">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary transition-colors py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        )}
      </div>

      {/* Contact CTA */}
      <div className="mt-16 text-center border-t border-border/60 pt-10">
        <h3 className="text-xl font-semibold">¿Aún tienes alguna pregunta?</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Si no has encontrado respuesta a tu consulta, no dudes en ponerte en contacto con nuestro equipo de soporte técnico.
        </p>
        <div className="mt-6 flex flex-col gap-3 justify-center sm:flex-row">
          <Button asChild className=" px-6 gap-2">
            <Link href="/contacto">
              <Mail className="h-4 w-4" />
              Formulario de Contacto
            </Link>
          </Button>
          <Button asChild variant="outline" className=" px-6 gap-2">
            <Link href="tel:+34922000000">
              <MessageSquare className="h-4 w-4" />
              Llamar al +34 922 000 000
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
