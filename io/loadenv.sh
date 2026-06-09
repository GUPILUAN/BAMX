#!/usr/bin/env bash
while IFS='=' read -r key value; do
  # Ignorar comentarios y líneas vacías
  [[ -z "$key" || "$key" =~ ^# ]] && continue

  # Eliminar comillas al inicio/final
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"

  # Reemplazar retornos de carro de Windows (\r)
  value="${value//$'\r'/}"

  # Exportar sin romper espacios
  export "$key=$value"
done < <(grep -v '^#' .env)
