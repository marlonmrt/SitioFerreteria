export interface ColumnMapping {
  erpCode: string;
  name: string;
  description: string;
  brand: string;
  unit: string;
  family: string;
  subfamily: string;
  mainImage: string;
  stock: string;
  offerB2C: string;
  offerB2B: string;
  prices: {
    [priceListCode: string]: string;
  };
}

export const DEFAULT_MAPPING: ColumnMapping = {
  erpCode: "COD_ART",
  name: "NOMBRE",
  description: "DESCRIPCION",
  brand: "MARCA",
  unit: "UNIDAD",
  family: "FAMILIA",
  subfamily: "SUBFAMILIA",
  mainImage: "IMAGEN",
  stock: "STOCK",
  offerB2C: "OFERTA_B2C",
  offerB2B: "OFERTA_B2B",
  prices: {
    PUBLIC: "PRECIO_PVP",
    PRO_01: "PRECIO_PRO_01"
  }
};
