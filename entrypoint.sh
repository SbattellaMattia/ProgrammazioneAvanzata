#!/bin/sh
set -e

echo "🔐 JWT Keys Setup - Starting..."

# Directory dove salvare le chiavi
SECRETS_DIR="/usr/src/app/secrets"
PRIVATE_KEY="$SECRETS_DIR/jwtRS256.key"
PUBLIC_KEY="$SECRETS_DIR/jwtRS256.key.pub"

# Crea la directory se non esiste
mkdir -p "$SECRETS_DIR"

# Controlla se le chiavi esistono già
if [ -f "$PRIVATE_KEY" ] && [ -f "$PUBLIC_KEY" ]; then
    echo "✓ Le chiavi JWT esistono già"
    echo "  - Privata: $PRIVATE_KEY"
    echo "  - Pubblica: $PUBLIC_KEY"
else
    echo "🔑 Generazione chiavi JWT RSA (4096 bit) con ssh-keygen..."
    
    # Genera chiave privata con ssh-keygen
    # -t rsa: tipo RSA
    # -b 4096: 4096 bit
    # -m PEM: formato PEM (compatibile con JWT)
    # -f: file di output
    # -N "": nessuna passphrase
    ssh-keygen -t rsa -b 4096 -m PEM -f "$PRIVATE_KEY" -N "" -q
    
    if [ $? -eq 0 ]; then
        echo "✓ Chiave privata generata con ssh-keygen"
    else
        echo "❌ Errore durante la generazione della chiave privata"
        exit 1
    fi
    
    # Estrai chiave pubblica con openssl
    openssl rsa -in "$PRIVATE_KEY" -pubout -outform PEM -out "$PUBLIC_KEY" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✓ Chiave pubblica estratta con openssl"
    else
        echo "❌ Errore durante l'estrazione della chiave pubblica"
        exit 1
    fi
    
    # Rimuovi il file .pub generato da ssh-keygen (non serve)
    #rm -f "${PRIVATE_KEY}.pub"
    
    # Imposta permessi sicuri
    chmod 600 "$PRIVATE_KEY"
    chmod 644 "$PUBLIC_KEY"
    
    echo "✅ Chiavi JWT generate con successo!"
    echo "  - Privata: $PRIVATE_KEY"
    echo "  - Pubblica: $PUBLIC_KEY"
fi

echo ""
echo "⏳ Waiting for PostgreSQL..."

DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
MAX_RETRIES=60
RETRY_COUNT=0

until nc -z "$DB_HOST" "$DB_PORT"; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -gt $MAX_RETRIES ]; then
    echo "❌ Database not available after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "  Database is unavailable - attempt $RETRY_COUNT/$MAX_RETRIES"
  sleep 1
done

echo ""
echo "🔄 Running database migrations..."
npm run migrate

echo ""
echo "🌱 Seeding database..."
npm run seed

echo ""
echo "🚀 Starting application..."
echo ""
# Esegui il comando passato al container (es: npm start)
exec "$@"
