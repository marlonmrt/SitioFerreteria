"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, Store, Navigation } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StoreData = {
  id: string;
  name: string;
  address: string;
  phone: string;
  openingHours: string;
  lat: number;
  lng: number;
};

interface TiendasClientProps {
  initialStores: StoreData[];
}

export default function TiendasClient({ initialStores }: TiendasClientProps) {
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(
    initialStores.length > 0 ? initialStores[0] : null
  );

  // Calculate bounding box for the map iframe zoom level
  const getMapUrl = (store: StoreData | null) => {
    if (!store) {
      // Default Tenerife coordinates bounding box if no store selected
      return "https://www.openstreetmap.org/export/embed.html?bbox=-16.85%2C28.05%2C-16.15%2C28.55&layer=mapnik";
    }
    const delta = 0.008; // Zoom factor bounding box delta
    const minLng = store.lng - delta;
    const maxLng = store.lng + delta;
    const minLat = store.lat - delta * 0.7;
    const maxLat = store.lat + delta * 0.7;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${store.lat}%2C${store.lng}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <Badge className="rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.2em]">
          Ubicaciones Físicas
        </Badge>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Nuestras Tiendas</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground text-sm sm:text-base">
          Visita cualquiera de nuestros centros de distribución para recibir asesoramiento técnico especializado o retirar tus compras ERP.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
        {/* Left column: Stores list */}
        <div className="space-y-4">
          {initialStores.length === 0 ? (
            <Card className="rounded-3xl border-border/70 p-6 bg-card text-center text-muted-foreground">
              No se han encontrado tiendas registradas.
            </Card>
          ) : (
            initialStores.map((store) => {
              const isSelected = selectedStore?.id === store.id;
              return (
                <Card
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`rounded-3xl border-border/70 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "ring-2 ring-primary bg-primary/5 border-primary/30"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2.5">
                      <Store className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      {store.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-normal">{store.address}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Phone className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                      <a href={`tel:${store.phone}`} className="text-foreground hover:underline">
                        {store.phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Clock className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground whitespace-pre-line leading-relaxed">
                        {store.openingHours}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className="rounded-2xl gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStore(store);
                        }}
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Ver en mapa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Right column: Interactive map iframe */}
        <div className="relative rounded-[2rem] border border-border/70 overflow-hidden bg-card min-h-[400px] lg:min-h-[500px] shadow-soft">
          <iframe
            src={getMapUrl(selectedStore)}
            className="absolute inset-0 w-full h-full border-0"
            title="Localización de tiendas físicas"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
