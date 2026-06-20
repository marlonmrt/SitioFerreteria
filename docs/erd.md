# ERD

```mermaid
erDiagram
  USERS {
    uuid id PK
    text email
    text password_hash
    text name
    user_type type
    user_status status
    uuid company_id FK
    timestamp created_at
  }

  COMPANIES {
    uuid id PK
    text legal_name
    text tax_id
    text contact_phone
    text price_list_code
    timestamp approved_at
    uuid approved_by_user_id FK
    timestamp created_at
  }

  FAMILIES {
    uuid id PK
    text name
    text slug
    text image
    integer sort_order
  }

  SUBFAMILIES {
    uuid id PK
    uuid family_id FK
    text name
    text slug
    integer sort_order
  }

  ARTICLES {
    uuid id PK
    text erp_code
    text name
    text slug
    text description
    text brand
    text unit
    uuid subfamily_id FK
    text main_image
    boolean is_active
    timestamp last_synced_at
  }

  ARTICLE_IMAGES {
    uuid id PK
    uuid article_id FK
    text url
    integer sort_order
  }

  ARTICLE_PRICES {
    uuid id PK
    uuid article_id FK
    text price_list_code
    numeric price
    text currency
    timestamp updated_at
  }

  STORES {
    uuid id PK
    text name
    text address
    text phone
    text opening_hours
    float lat
    float lng
  }

  FAVORITES {
    uuid user_id PK, FK
    uuid article_id PK, FK
    timestamp created_at
  }

  INFO_REQUESTS {
    uuid id PK
    uuid article_id FK
    uuid user_id FK
    text name
    text email
    text phone
    text message
    uuid store_id FK
    timestamp created_at
    info_request_status status
  }

  IMPORT_BATCHES {
    uuid id PK
    text file_name
    import_file_type type
    timestamp started_at
    timestamp finished_at
    import_batch_status status
    integer total_rows
    integer success_rows
    integer error_rows
    text error_log
  }

  FAQS {
    uuid id PK
    text question
    text answer
    integer sort_order
  }

  COMPANIES ||--o{ USERS : "company_id"
  USERS ||--o{ COMPANIES : "approved_by_user_id"
  FAMILIES ||--o{ SUBFAMILIES : "family_id"
  SUBFAMILIES ||--o{ ARTICLES : "subfamily_id"
  ARTICLES ||--o{ ARTICLE_IMAGES : "article_id"
  ARTICLES ||--o{ ARTICLE_PRICES : "article_id"
  USERS ||--o{ FAVORITES : "user_id"
  ARTICLES ||--o{ FAVORITES : "article_id"
  USERS ||--o{ INFO_REQUESTS : "user_id"
  ARTICLES ||--o{ INFO_REQUESTS : "article_id"
  STORES ||--o{ INFO_REQUESTS : "store_id"
```

## Notas

- `erp_code` es la clave de negocio única del ERP.
- `price_list_code` admite `PUBLIC` y cualquier tarifa B2B aprobada.
- `info_requests` almacena consultas de producto y de contacto general.
- `import_batches.error_log` queda como texto serializado para simplificar auditoría inicial.
