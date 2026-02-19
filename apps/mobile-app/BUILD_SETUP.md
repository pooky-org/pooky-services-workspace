# Guide de Configuration du Build iOS avec EAS

## 📱 Configuration EAS pour iOS

### Structure des Fichiers
```
apps/mobile-app/
├── eas.json                      # Configuration EAS
├── app.json                       # Configuration Expo
├── credentials.json               # Credentials locaux (optionnel)
└── certs/ios/                     # Certificats et profils locaux (optionnel)
    ├── dist.p12                   # Certificat de distribution  
    └── profile.mobileprovision    # Profil de provisioning
```

### Options de Configuration dans `eas.json`

#### Option 1 : Credentials Distants (Recommandé)
Laissez EAS gérer les credentials via le serveur Expo :

```json
"build": {
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "env": { /* vos variables */ }
  }
}
```

**Avantages :**
- Pas besoin de gérer les certificats localement
- Les credentials sont synchronisés avec Apple Developer
- Moins d'erreurs de correspondance

**Lancer le build :**
```bash
eas build --platform ios --profile development --non-interactive --local
```

#### Option 2 : Credentials Locaux
Si vous voulez utiliser des certificats locaux :

```json
"build": {
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "ios": {
      "credentialsSource": "local"  // Utiliser credentials.json
    },
    "env": { /* vos variables */ }
  }
}
```

**Prérequis :**
- Fichier `credentials.json` avec chemins corrects
- Certificat `.p12` et profil `.mobileprovision` correspondants
- Les deux doivent avoir le même certificat signataire

## 🔑 Gestion des Credentials

### Télécharger les Credentials depuis EAS
```bash
cd apps/mobile-app
eas credentials
```

Sélectionnez :
1. `ios`
2. `development` (ou votre profil)
3. `Download credentials`

Cela télécharge le certificat et profil valides qui sont stockés sur EAS.

### Créer/Mettre à Jour les Credentials Localement

#### 1. Télécharger le Certificat depuis EAS
```bash
# Via eas credentials (voir au-dessus)
```

#### 2. Vérifier le Certificat
```bash
openssl pkcs12 -in certs/ios/dist.p12 -nokeys -passin pass:YOUR_PASSWORD | openssl x509 -noout -subject
```

#### 3. Créer le Profil de Provisioning
- Aller sur [Apple Developer - Profiles](https://developer.apple.com/account/resources/profiles/add)
- Type : **Ad Hoc** (pour distribution internal)
- App ID : `com.branli.pooky-mobile-app`
- **IMPORTANT** : Cochez le certificat qui correspond à votre `.p12`
- Sélectionnez les devices de test
- Téléchargez et placez dans `certs/ios/profile.mobileprovision`

#### 4. Mettre à Jour `credentials.json`
```json
{
  "ios": {
    "provisioningProfilePath": "certs/ios/profile.mobileprovision",
    "distributionCertificate": {
      "path": "certs/ios/dist.p12",
      "password": "YOUR_CERTIFICATE_PASSWORD"
    }
  }
}
```

## ❌ Erreurs Courantes

### Erreur 1 : "Provisioning profile doesn't include signing certificate"
**Cause :** Le profil et le certificat ne correspondent pas.

**Solution :**
1. Vérifier le certificat du profil sur Apple Developer
2. Recréer le profil avec le bon certificat coché
3. Ou utiliser les credentials distants (plus simple)

### Erreur 2 : "invalid password?" lors de la vérification du `.p12`
**Cause :** Mot de passe incorrect ou fichier corrompu.

**Solution :**
- Télécharger le certificat à nouveau via `eas credentials`
- Ou utiliser les credentials distants

### Erreur 3 : "Unknown key `ignore` in biome.json"
**Cause :** Utilisation de `ignore` au lieu de `experimentalScannerIgnores`.

**Solution :**
En version 2.3.13 de Biome, utilisez `experimentalScannerIgnores`.

## 🚀 Workflow de Build Recommandé

```bash
# 1. Modifier le code/env dans app.json et eas.json
# 2. Lancer le build
eas build --platform ios --profile development --non-interactive --local

# 3. EAS crée un fichier .ipa que vous pouvez installer sur un device ou simulator
```

## 📋 Checklist avant le Build

- [ ] `eas.json` configuré correctement
- [ ] Variables d'environnement définies dans `eas.json`
- [ ] Bundle identifier correct dans `app.json` : `com.branli.pooky-mobile-app`
- [ ] Si crédenditials locaux : certificat et profil correspondent
- [ ] Si credentials distants : synchronisés avec Apple Developer

## 🔗 Ressources

- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [Apple Developer Certificates](https://developer.apple.com/account/resources/certificates/list)
- [Apple Developer Provisioning Profiles](https://developer.apple.com/account/resources/profiles/list)
