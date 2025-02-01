# IRC Server and Client Application (English/French)

## Project Overview
### English
This project implements an IRC (Internet Relay Chat) system using Node.js with Express.js for the server and React.js for the client. The server uses Socket.IO for real-time communication and supports multiple simultaneous connections. It includes features like channel management, message persistence, and user nicknames. The client allows users to interact with the server via commands and an intuitive user interface.

### Français
Ce projet implémente un système IRC (Internet Relay Chat) utilisant Node.js, Express.js pour le serveur, MongoDb pour la base de données et React.js pour le client. Le serveur utilise Socket.IO pour la communication en temps réel et prend en charge plusieurs connexions simultanées. Il inclut des fonctionnalités telles que la gestion des canaux, la persistance des messages et les pseudonymes des utilisateurs. Le client permet aux utilisateurs d'interagir avec le serveur via des commandes et une interface utilisateur intuitive.

---

## Features / Fonctionnalités

### Server Features / Fonctionnalités du Serveur
- **Multi-channel Support / Support Multi-canaux**: Users can join multiple channels simultaneously / Les utilisateurs peuvent rejoindre plusieurs canaux simultanément.
- **Channel Management / Gestion des Canaux**:
  - Create, rename, and delete channels / Créer, renommer et supprimer des canaux.
  - Persistent storage of channels and messages using MongoDB/ Stockage persistant des canaux et des messages en utilisant MongoDB.
- **Real-time Notifications / Notifications en Temps Réel**:
  - Notify all users when a user joins or leaves a channel / Notifie tous les utilisateurs lorsqu'un utilisateur rejoint ou quitte un canal.
- **Private Messaging / Messagerie Privée**: Users can send private messages to each other / Les utilisateurs peuvent s'envoyer des messages privés.
- **Nickname Management / Gestion des Pseudonymes**: Users must set a nickname before interacting / Les utilisateurs doivent définir un pseudonyme avant d'interagir.

### Client Features / Fonctionnalités du Client
- **Command-based Interactions / Interactions basées sur des Commandes**:
  - `/nick nickname`: Define the nickname of the user / Définit le pseudonyme de l'utilisateur.
  - `/list [string]`: List available channels (filterable by string) / Liste les canaux disponibles (filtrable par chaîne).
  - `/create channel`: Create a channel / Crée un canal.
  - `/delete channel`: Delete a channel / Supprime un canal.
  - `/join channel`: Join a channel / Rejoint un canal.
  - `/quit channel`: Quit a channel / Quitte un canal.
  - `/users`: List users in the current channel / Liste les utilisateurs du canal actuel.
  - `/msg nickname message`: Send a private message to a user / Envoie un message privé à un utilisateur.
  - Regular messages to channels / Messages réguliers aux canaux.
- **User-friendly Interface / Interface Intuitive**: Built with React.js for seamless interaction / Construit avec React.js pour une interaction fluide.

---

## Technologies Used / Technologies Utilisées

### Server / Serveur
- **Node.js**: JavaScript runtime for building the backend / Environnement d'exécution JavaScript pour le backend.
- **Express.js**: Framework for API and server-side routing / Framework pour les API et le routage côté serveur.
- **Socket.IO**: For real-time, bidirectional communication / Pour une communication bidirectionnelle en temps réel.
- **Persistence / Persistance**: use of MongoDB / 

### Client / Client
- **React.js**: Frontend framework for creating a dynamic user interface / Framework frontend pour créer une interface utilisateur dynamique.
- **Socket.IO-client**: For real-time communication with the server / Pour la communication en temps réel avec le serveur.

---

## Installation and Setup / Installation et Configuration

### Prerequisites / Prérequis
Ensure the following are installed / Assurez-vous que les éléments suivants sont installés :
- Node.js (version 14 or above / version 14 ou supérieure)
- npm (Node Package Manager) or yarn / npm (Gestionnaire de Paquets Node) ou yarn

### Steps / Étapes

#### 1. Clone the Repository / Cloner le Répertoire
```bash
git clone git@github.com:EpitechMscProPromo2027/T-JSF-600-LYO_3.git || https://github.com/EpitechMscProPromo2027/T-JSF-600-LYO_3.git
cd T-JSF-600-LYO_3
```

#### 2. Install Dependencies / Installer les Dépendances

##### Server / Serveur
```bash
cd backend
npm install
```

##### Client / Client
```bash
cd frontend
npm install
```

#### 3. Set Up Environment Variables / Configurer les Variables d'Environnement
Create a `.env` file in the `server` directory and add the necessary environment variables / Créez un fichier `.env` dans le répertoire `server` et ajoutez les variables d'environnement nécessaires :
```env
PORT=3000
DB_URI=mongodb://localhost:27017/irc
```

#### 4. Start the Server / Démarrer le Serveur
```bash
cd backend
node server.js
```

#### 5. Start the Client / Démarrer le Client
```bash
cd frontend
npm run dev
```

Access the client at `http://localhost:5173/` / Accédez au client sur `http://localhost:5173/`.

---

## Usage / Utilisation

### Server Commands / Commandes du Serveur
The server automatically listens for connections and processes commands sent by the client / Le serveur écoute automatiquement les connexions et traite les commandes envoyées par le client.

### Client Commands / Commandes du Client
- `/nick nickname`: Set your nickname / Définir votre pseudonyme.
- `/list [string]`: Display all available channels or those matching a string / Afficher tous les canaux disponibles ou ceux correspondant à une chaîne.
- `/create channel`: Create a new channel / Créer un nouveau canal.
- `/delete channel`: Delete a channel / Supprimer un canal.
- `/join channel`: Join an existing channel / Rejoindre un canal existant.
- `/quit channel`: Leave a channel / Quitter un canal.
- `/users`: List users in the current channel / Lister les utilisateurs dans le canal actuel.
- `/msg nickname message`: Send a private message to another user / Envoyer un message privé à un autre utilisateur.
- Regular message: Send to the current channel / Message régulier : Envoyé au canal actuel.

---

### Communication Protocol / Protocole de Communication
The server and client communicate via Socket.IO events. Key events include / Le serveur et le client communiquent via des événements Socket.IO. Événements clés :
- `user:join`: User joins a channel / Un utilisateur rejoint un canal.
- `user:leave`: User leaves a channel / Un utilisateur quitte un canal.
- `message:send`: Send a message to a channel / Envoyer un message à un canal.
- `channel:create`: Create a new channel / Créer un nouveau canal.
- `channel:delete`: Delete a channel / Supprimer un canal.

---

## Testing / Tests
- Test the server using tools like Postman or Curl / Tester le serveur avec des outils comme Postman ou Curl.
- Test the client manually by interacting with the interface / Tester le client manuellement en interagissant avec l'interface.
- Use Jest or Mocha for unit and integration tests / Utiliser Jest ou Mocha pour les tests unitaires et d'intégration.

---

## Contributors / Contributeurs
- Bastien Cochet & Mathias Arnaud

---

## License / Licence
This project is licensed under the [Epitech](LICENSE) / Ce projet est sous licence [Epitech](LICENSE).

