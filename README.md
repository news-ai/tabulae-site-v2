# tabulae-site
Remember to upload sourcemap to Sentry after merge to production:


```
sentry-cli releases files 0.0.1 upload-sourcemaps --url-prefix https://tabulae.newsai.co ./build/main.js.map --rewrite
```
