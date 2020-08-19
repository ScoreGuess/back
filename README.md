# firebase-graphql 🚀

## Pourquoi firebase ?
Ce service, largement inspiré de [ce tuto Medium](https://medium.com/@lukepighetti/yes-you-can-query-firebase-with-graphql-e79a45990f22), propose une interface GraphQL devant une base de données [Realtime Database](https://firebase.google.com/docs/storage/admin/start) de [Firebase](https://console.firebase.google.com/) 

Pour générer l'interface GraphQL on utilise les [Cloud Functions](https://firebase.google.com/docs/functions) à l'instar des lambdas d'aws ca permet de faire un backend serverless. 

Pour le projet ScoreGuess une architecture serverless est très préferrable car:
- rapide à mettre en place et bien documentée
- pas d'infogérance 
- système *pay as you go* avec très souvent un [free tier](https://firebase.google.com/pricing) qui couvre amplement le démarrage d'un projet 
- c'est relativement nouveau donc c'est cool 😅

## Pourquoi graphql
Très plébiscité en ce moment, ce la permet de manipuler les données sous forme de graphe. 

## Pour démarrer
Pensez à installer [node](https://nodejs.org/en/download/) et [yarn](https://yarnpkg.com/) au préalable 🤗

Une fois le projet cloné depuis GitHub, il faut se mettre à la racine du projet et lancer les commandes suivantes.
```
yarn install
```

Pour lancer le projet en version de développement
```
yarn start
```

## Format de la base

Les bases de données Real Time Database de Firebase permettent de stocker des collections d'objets assez simplement. 
Dans notre cas on a défini les collections suivantes:
- **teams** les équipes
- **fixtures** les matches
- **users** les utilisateurs

La collection la plus importante est **users** car elle contient les **predictions**, **resultats** et autres infos
nécessaires à l'app.
Concretement dès lors qu'une ressource est créée ou associée à un utilisateur elle est stockée dans cette collection.
Si on prend l'exemple d'une prédiction faite par l'utilisateur `{userId}` pour le match `{fixtureId}`
 on aura chemin d'accès comme celui-ci:
 
```
/users/{userId}/predictions/{fixtureId}
```
### Predictions
les prédictions sont situées au chemin d'accès suivant: `/users/{userId}/predictions`

Elles sont stockées par id de match ce qui permet de les récupérer beaucoup plus facilement. 
En d'autres termes il s'agit d'une map `<Fixture.id,Prediction>`

### Results
```
// users/{userId}/predictions/{fixtureId}/points
// users/{userId}/results/{weekId}/[Point]
```


