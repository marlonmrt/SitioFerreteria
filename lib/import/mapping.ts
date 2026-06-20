export interface ColumnMapping {
  erpCode: string;
  name: string;
  description: string;
  brand: string;
  unit: string;
  family: string;
  subfamily: string;
  mainImage: string;
  prices: {
    [priceListCode: string]: string; // priceListCode -> nombre de columna del CSV
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
  prices: {
    PUBLIC: "PRECIO_PVP",
    PRO_01: "PRECIO_PRO_01"
  }
};
