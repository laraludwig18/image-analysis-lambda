# GoBarber

Função de reconhecimento de imagens que executa no AWS Lambda.

## Inicialização

Instalar dependências:
```
yarn
```
Instalar serverless framework:
```
yarn global add serverless
```

## Comandos

Rodar função local:
```
sls invoke local -f image-recognition --path request.json
```
Rodar função no AWS Lambda:
```
sls invoke -f image-recognition --path request.json 
```
Realizar deploy:
```
sls deploy
```