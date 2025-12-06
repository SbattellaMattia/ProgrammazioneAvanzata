
# Usa l'immagine base ufficiale di Node.js
FROM node:latest

# Imposta la directory di lavoro all'interno del container
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    netcat-traditional \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copia i file package.json e package-lock.json per installare le dipendenze
COPY package*.json ./

# Rimuove la cartella dist se esiste
RUN rm -rf dist/

# Installa le dipendenze del progetto
RUN npm install

# Copia il resto del codice sorgente nel container
COPY . .


# Compila TypeScript in JavaScript
RUN npm run build

# Espone la porta 3000
EXPOSE 3000

COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

# Comando per avviare l'applicazione
CMD ["npm", "start"]
