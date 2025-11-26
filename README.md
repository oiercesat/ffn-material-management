# S3
Here is an example of a local config file for AWS S3 using environment variables.

```env
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=admin
S3_SECRET_KEY=admin123
S3_BUCKET=material
S3_REGION=eu-west-1
```
# COMMANDES
Commandes pour héberger l'app sur le s3 :
/!\ A faire depuis la racine du projet.

```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://ffn-frontend-nextjs-bucket ##Créer le bucket next
aws --endpoint-url=http://localhost:4566 s3 mb s3://images ##Créer le bucket images

aws --endpoint-url=http://localhost:4566 s3api put-bucket-website --bucket ffn-frontend-nextjs-bucket --website-configuration file://website.json ##Config le bucket next pour afficher un site web static

npm run build
aws --endpoint-url=http://localhost:4566 s3 sync out/ s3://ffn-frontend-nextjs-bucket ##Push le build sur le s3
```
