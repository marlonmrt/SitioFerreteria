import { describe, it, expect } from "vitest";
import { parseCsv } from "./parser";
import { DEFAULT_MAPPING } from "./mapping";

describe("Import Parser", () => {
  it("should successfully parse a valid CSV buffer", () => {
    const csvContent = Buffer.from(
      "COD_ART,NOMBRE,DESCRIPCION,MARCA,UNIDAD,FAMILIA,SUBFAMILIA,IMAGEN,PRECIO_PVP,PRECIO_PRO_01\n" +
        "GRI-01,Grifo Monomando,Un grifo cromado,AquaPro,ud,Baños,Grifería,/grifo.jpg,49.90,39.90\n" +
        "TUB-02,Tubo PVC 1m,Tubo de fontanería,FixPro,ud,Fontanería,Tuberías,,12.50,10.00"
    );

    const result = parseCsv(csvContent, DEFAULT_MAPPING);

    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(2);

    expect(result.rows[0]).toEqual({
      erpCode: "GRI-01",
      name: "Grifo Monomando",
      description: "Un grifo cromado",
      brand: "AquaPro",
      unit: "ud",
      family: "Baños",
      subfamily: "Grifería",
      mainImage: "/grifo.jpg",
      prices: {
        PUBLIC: 49.9,
        PRO_01: 39.9
      }
    });

    expect(result.rows[1].mainImage).toBeNull();
  });

  it("should capture validation errors for invalid rows", () => {
    const csvContent = Buffer.from(
      "COD_ART,NOMBRE,DESCRIPCION,MARCA,UNIDAD,FAMILIA,SUBFAMILIA,IMAGEN,PRECIO_PVP,PRECIO_PRO_01\n" +
        ",Grifo Sin Código,Un grifo,AquaPro,ud,Baños,Grifería,/grifo.jpg,49.90,39.90\n" +
        "TUB-02,,Tubo sin nombre,FixPro,ud,Fontanería,Tuberías,,12.50,-10.00"
    );

    const result = parseCsv(csvContent, DEFAULT_MAPPING);

    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].reason).toContain("erpCode");
    expect(result.errors[1].reason).toContain("name");
    expect(result.errors[1].reason).toContain("prices.PRO_01");
  });
});
